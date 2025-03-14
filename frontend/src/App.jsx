import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';

function App() {
    const [data, setData] = useState({ historical: [], predictions: [] });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch crypto data
    const fetchCryptoData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/data/');
            setData({
                historical: response.data.historical,
                predictions: response.data.predictions
            });
        } catch (err) {
            console.error('Error fetching crypto data:', err);
            setError('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCryptoData();
    }, []);

    // Format price with commas
    const formatPrice = (price) => {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Sort historical data latest first for the table
    const sortedHistorical = [...data.historical].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Chart data (keeps chronological order: oldest to newest)
    const chartData = {
        labels: [
            ...data.historical.map(d => formatDate(d.date)),
            ...data.predictions.map(d => formatDate(d.date)),
        ],
        datasets: [
            {
                label: 'Historical Prices (USD)',
                data: [...data.historical.map(d => d.price), ...Array(data.predictions.length).fill(null)],
                borderColor: '#3B82F6', // Blue
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: false,
                tension: 0.3,
            },
            {
                label: 'Predicted Prices (USD)',
                data: [...Array(data.historical.length).fill(null), ...data.predictions.map(d => d.predicted_price)],
                borderColor: '#EF4444', // Red
                borderDash: [5, 5],
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: false,
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: 'Date', color: '#D1D5DB' },
                ticks: { color: '#D1D5DB' },
                grid: { color: '#374151' },
            },
            y: {
                title: { display: true, text: 'Price (USD)', color: '#D1D5DB' },
                ticks: {
                    color: '#D1D5DB',
                    callback: (value) => `$${formatPrice(value)}`,
                },
                grid: { color: '#374151' },
                beginAtZero: false,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { color: '#D1D5DB' },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        return `${label}: $${formatPrice(value)}`;
                    },
                },
            },
        },
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="container mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">Crypto Price Predictor</h1>

                {/* Error and Loading States */}
                {error ? (
                    <div className="text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={fetchCryptoData}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Chart Section */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-200">Price Trend</h2>
                            <div className="w-full h-96">
                                <Line data={chartData} options={options} />
                            </div>
                        </div>

                        {/* Data Table Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Historical Data Table (Latest First) */}
                            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-200">Historical Data</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="py-2 px-4 text-gray-400">Date</th>
                                            <th className="py-2 px-4 text-gray-400">Price (USD)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {sortedHistorical.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-700">
                                                <td className="py-2 px-4 text-gray-300">{formatDate(item.date)}</td>
                                                <td className="py-2 px-4 text-gray-300">${formatPrice(item.price)}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Predictions Table */}
                            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-200">Predicted Prices</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="py-2 px-4 text-gray-400">Date</th>
                                            <th className="py-2 px-4 text-gray-400">Price (USD)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data.predictions.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-700">
                                                <td className="py-2 px-4 text-gray-300">{formatDate(item.date)}</td>
                                                <td className="py-2 px-4 text-gray-300">${formatPrice(item.predicted_price)}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Disclaimer */}
                <p className="text-sm text-gray-500 mt-8 text-center">
                    Note: Predictions are for educational purposes only, not financial advice.
                </p>
            </div>
        </div>
    );
}

export default App;