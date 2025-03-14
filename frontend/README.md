# CryptoNite

CryptoNite is a full-stack web application that predicts cryptocurrency prices using machine learning. It fetches historical data from the CoinGecko API, trains an LSTM model to forecast future prices, and displays the results in an interactive React frontend with a dark-themed UI. Built with Django (backend) and React (frontend), this project showcases skills in machine learning, web development, and API integration.

---

## Features

- **Price Prediction**: Uses an improved LSTM model to predict cryptocurrency prices for the next 7 days.
- **Real-Time Data**: Fetches historical price and volume data from CoinGecko API.
- **Interactive Charts**: Displays historical and predicted prices in a line chart using Chart.js.
- **Data Tables**: Shows historical data (latest first) and predicted prices in responsive tables.
- **Dark Theme**: Modern, user-friendly dark-themed UI built with Tailwind CSS.
- **Error Handling**: Robust handling of API errors and loading states.

---

## Tech Stack

### Backend
- **Framework**: Django with Django REST Framework
- **Machine Learning**: TensorFlow (LSTM), Scikit-learn
- **API**: CoinGecko API
- **Database**: SQLite (development), extensible to PostgreSQL
- **Dependencies**: Managed via `requirements.txt`

### Frontend
- **Framework**: React with Vite
- **Charting**: Chart.js via `react-chartjs-2`
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Dependencies**: Managed via `package.json`

---

## Project Structure

CryptoNite/
├── backend/              # Django backend
│   ├── predictor/        # Django app with models, views, serializers
│   ├── backend/          # Django settings
│   ├── manage.py         # Django management script
│   ├── model.py          # LSTM model training script
│   └── requirements.txt  # Backend dependencies
├── frontend/             # React frontend
│   ├── src/              # React source code (App.jsx, etc.)
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
├── .gitignore            # Git ignore file (optional root-level)
└── README.md             # Project documentation


---

## Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher (18.x recommended)
- **npm**: 8.x or higher
- **Git**: For cloning the repository

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CryptoNite.git
cd CryptoNite