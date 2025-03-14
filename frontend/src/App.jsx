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
            {/* Background glow effects */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute right-0 top-1/3 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="container mx-auto relative z-10">
                {/* Logo and Header */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="flex flex-col items-center mb-12"
                >
                    <div className="relative mb-4">
                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                            CryptoNite
                        </span>
                        <span className="absolute -top-3 -right-8 text-2xl font-bold text-yellow-300">⚡</span>
                    </div>
                    <p className="text-xl text-indigo-200 italic">Illuminating the future of cryptocurrency</p>
                </motion.div>

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
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
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
                        <div className="relative">
                            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-cyan-400 shadow-lg"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-medium text-cyan-300">Loading</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
                        >
                            {data.historical.length > 0 && (
                                <>
                                    <StatsCard
                                        title="Current Price"
                                        value={`$${formatPrice(data.historical[data.historical.length-1].price)}`}
                                        color="from-blue-500 to-cyan-400"
                                        icon="📊"
                                    />
                                    <StatsCard
                                        title="Prediction (Next)"
                                        value={data.predictions.length > 0 ? `$${formatPrice(data.predictions[0].predicted_price)}` : "N/A"}
                                        color="from-purple-500 to-pink-400"
                                        icon="🔮"
                                    />
                                    <StatsCard
                                        title="7-Day Forecast"
                                        value={data.predictions.length >= 7 ? `$${formatPrice(data.predictions[6].predicted_price)}` : "N/A"}
                                        color="from-indigo-500 to-blue-400"
                                        icon="📈"
                                    />
                                    <StatsCard
                                        title="30-Day Trend"
                                        value={data.predictions.length >= 30 ?
                                            (data.predictions[29].predicted_price > data.historical[data.historical.length-1].price ? "▲ Up" : "▼ Down")
                                            : "N/A"}
                                        color="from-green-500 to-emerald-400"
                                        icon="🚀"
                                    />
                                </>
                            )}
                        </motion.div>

                        {/* Chart Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-2xl mb-10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
                        >
                            <h2 className="text-3xl font-semibold mb-6 text-indigo-300 flex items-center">
                                <span className="mr-3">📈</span> Price Trend Analysis
                            </h2>
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
                                className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
                            >
                                <h2 className="text-2xl font-semibold mb-6 text-cyan-300 flex items-center">
                                    <span className="mr-3">🗓️</span> Historical Data
                                </h2>
                                <div className="overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-700">
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-gray-800 z-10">
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
                                className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                            >
                                <h2 className="text-2xl font-semibold mb-6 text-purple-300 flex items-center">
                                    <span className="mr-3">🔮</span> Predicted Prices
                                </h2>
                                <div className="overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-gray-800 z-10">
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

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <p className="text-sm text-gray-400 mb-2">
                        <span className="font-bold text-indigo-400">CryptoNite</span> - Illuminating the future of cryptocurrency
                    </p>
                    <p className="text-xs text-gray-500">
                        Note: Predictions are for educational purposes only, not financial advice.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

// Stats Card Component
const StatsCard = ({ title, value, color, icon }) => {
    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.5)" }}
            className={`bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl p-6 border border-indigo-500/20`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${color} text-transparent bg-clip-text`}>{value}</h3>
                </div>
                <div className="text-3xl">{icon}</div>
            </div>
        </motion.div>
    );
};

// Add these styles to your CSS
const style = document.createElement('style');
style.textContent = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thumb-indigo-500::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.5);
  border-radius: 3px;
}
.scrollbar-thumb-purple-500::-webkit-scrollbar-thumb {
  background-color: rgba(168, 85, 247, 0.5);
  border-radius: 3px;
}
.scrollbar-track-gray-700::-webkit-scrollbar-track {
  background-color: rgba(55, 65, 81, 0.3);
}
`;
document.head.appendChild(style);

export default App;