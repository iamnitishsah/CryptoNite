import requests
import numpy as np
import pickle
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from tensorflow.keras.models import load_model
from .models import CryptoData, Prediction
from .serializers import CryptoDataSerializer, PredictionSerializer


# Fetch historical data from CoinGecko API
def fetch_historical_data(coin_id='bitcoin', days=365):  # Reduced to 365 days
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart?vs_currency=usd&days={days}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if 'error' in data:
            raise ValueError(f"API Error: {data['error']['status']['error_message']}")
        if 'prices' not in data or 'total_volumes' not in data:
            raise KeyError("Expected keys 'prices' and 'total_volumes' not found")
        return data['prices'], data['total_volumes']
    except (requests.exceptions.RequestException, KeyError, ValueError) as e:
        print(f"Error fetching data: {e}")
        return [], []


# Update data and make predictions
def update_data():
    # Fetch historical data and volumes
    prices, volumes = fetch_historical_data()
    if not prices or not volumes:
        print("Failed to fetch data. Skipping update.")
        return

    CryptoData.objects.all().delete()  # Clear old data
    for (ts, price), (_, volume) in zip(prices[-60:], volumes[-60:]):  # Last 60 days
        date = datetime.fromtimestamp(ts / 1000).date()
        CryptoData.objects.create(date=date, price=price, volume=volume)

    # Prepare data for prediction
    recent_data = np.array([[p[1], v[1]] for (p, v) in zip(prices[-60:], volumes[-60:])])

    # Load the saved scaler
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)

    scaled_data = scaler.transform(recent_data)
    X = scaled_data.reshape(1, 60, 2)

    # Load the trained model
    model = load_model('improved_lstm_model.h5')

    # Make predictions
    pred_scaled = model.predict(X)[0]
    pred_scaled_with_dummy = np.column_stack([pred_scaled, np.zeros_like(pred_scaled)])
    pred_prices = scaler.inverse_transform(pred_scaled_with_dummy)[:, 0]

    # Save predictions
    Prediction.objects.all().delete()
    last_date = datetime.fromtimestamp(prices[-1][0] / 1000).date()
    for i, price in enumerate(pred_prices):
        date = last_date + timedelta(days=i + 1)
        Prediction.objects.create(date=date, predicted_price=price)


# API view to serve data
class DataAPIView(APIView):
    def get(self, request):
        # Update data (ideally use a scheduled task)
        update_data()
        historical = CryptoData.objects.all().order_by('date')[:60]
        predictions = Prediction.objects.all().order_by('date')[:7]
        historical_data = CryptoDataSerializer(historical, many=True).data
        prediction_data = PredictionSerializer(predictions, many=True).data
        return Response({'historical': historical_data, 'predictions': prediction_data})