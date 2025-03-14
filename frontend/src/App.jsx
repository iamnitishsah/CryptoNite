import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import { motion } from 'framer-motion';

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
                predictions: response.data.predictions,
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

    // Chart data
    const chartData = {
        labels: [...data.historical.map(d => formatDate(d.date)), ...data.predictions.map(d => formatDate(d.date))],
        datasets: [
            {
                label: 'Historical Prices (USD)',
                data: [...data.historical.map(d => d.price), ...Array(data.predictions.length).fill(null)],
                borderColor: '#00FFFF', // Cyan glow
                backgroundColor: 'rgba(0, 255, 255, 0.2)',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'Predicted Prices (USD)',
                data: [...Array(data.historical.length).fill(null), ...data.predictions.map(d => d.predicted_price)],
                borderColor: '#FF00FF', // Magenta glow
                backgroundColor: 'rgba(255, 0, 255, 0.2)',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: 'Date', color: '#A5B4FC', font: { size: 14 } },
                ticks: { color: '#A5B4FC' },
                grid: { color: 'rgba(165, 180, 252, 0.1)' },
            },
            y: {
                title: { display: true, text: 'Price (USD)', color: '#A5B4FC', font: { size: 14 } },
                ticks: {
                    color: '#A5B4FC',
                    callback: (value) => `$${formatPrice(value)}`,
                },
                grid: { color: 'rgba(165, 180, 252, 0.1)' },
                beginAtZero: false,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { color: '#E0E7FF', font: { size: 12 } },
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#E0E7FF',
                bodyColor: '#E0E7FF',
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-gray-100 p-8">
            <div className="container mx-auto">
                {/* Header */}
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-5xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
                >
                    Crypto Price Predictor
                </motion.h1>

                {/* Error and Loading States */}
                {error ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <p className="text-red-400 mb-4 text-lg">{error}</p>
                        <button
                            onClick={fetchCryptoData}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                        >
                            Retry
                        </button>
                    </motion.div>
                ) : loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center items-center h-96"
                    >
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-cyan-400 shadow-lg"></div>
                    </motion.div>
                ) : (
                    <>
                        {/* Chart Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-2xl mb-10 border border-indigo-500/20"
                        >
                            <h2 className="text-3xl font-semibold mb-6 text-indigo-300">Price Trend</h2>
                            <div className="w-full h-96">
                                <Line data={chartData} options={options} />
                            </div>
                        </motion.div>

                        {/* Data Table Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Historical Data Table */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-cyan-500/20"
                            >
                                <h2 className="text-2xl font-semibold mb-6 text-cyan-300">Historical Data</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="border-b border-indigo-500/30">
                                            <th className="py-3 px-4 text-indigo-400">Date</th>
                                            <th className="py-3 px-4 text-indigo-400">Price (USD)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {sortedHistorical.map((item, index) => (
                                            <motion.tr
                                                key={index}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="border-b border-indigo-500/20 hover:bg-indigo-900/50 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-gray-200">{formatDate(item.date)}</td>
                                                <td className="py-3 px-4 text-gray-200">${formatPrice(item.price)}</td>
                                            </motion.tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>

                            {/* Predictions Table */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-purple-500/20"
                            >
                                <h2 className="text-2xl font-semibold mb-6 text-purple-300">Predicted Prices</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="border-b border-purple-500/30">
                                            <th className="py-3 px-4 text-purple-400">Date</th>
                                            <th className="py-3 px-4 text-purple-400">Price (USD)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data.predictions.map((item, index) => (
                                            <motion.tr
                                                key={index}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="border-b border-purple-500/20 hover:bg-purple-900/50 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-gray-200">{formatDate(item.date)}</td>
                                                <td className="py-3 px-4 text-gray-200">${formatPrice(item.predicted_price)}</td>
                                            </motion.tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}

                {/* Disclaimer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-sm text-gray-400 mt-10 text-center"
                >
                    Note: Predictions are for educational purposes only, not financial advice.
                </motion.p>
            </div>
        </div>
    );
}

export default App;