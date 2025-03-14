import requests
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam

# Fetch historical data from CoinGecko API
def fetch_historical_data(coin_id='bitcoin', days=365):  # Reduced to 365 days
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart?vs_currency=usd&days={days}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad status codes
        data = response.json()
        if 'error' in data:
            raise ValueError(f"API Error: {data['error']['status']['error_message']}")
        if 'prices' not in data or 'total_volumes' not in data:
            raise KeyError("Expected keys 'prices' and 'total_volumes' not found in API response")
        prices = data['prices']  # [timestamp, price]
        volumes = data['total_volumes']  # [timestamp, volume]
        return prices, volumes
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from CoinGecko: {e}")
        return None, None
    except (KeyError, ValueError) as e:
        print(f"Error: {e}")
        return None, None

# Prepare data
prices, volumes = fetch_historical_data()
if prices is None or volumes is None or not prices or not volumes:
    print("Failed to fetch data. Exiting.")
    exit(1)

df = pd.DataFrame({
    'price': [p[1] for p in prices],
    'volume': [v[1] for v in volumes]
})

# Normalize data
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(df[['price', 'volume']])

# Create sequences: 60 days input -> 7 days output
def create_sequences(data, seq_length=60, pred_length=7):
    X, y = [], []
    for i in range(len(data) - seq_length - pred_length + 1):
        X.append(data[i:i + seq_length])  # Past 60 days
        y.append(data[i + seq_length:i + seq_length + pred_length, 0])  # Next 7 days' prices
    return np.array(X), np.array(y)

seq_length = 60
X, y = create_sequences(scaled_data, seq_length=seq_length)

# Split into training and testing
train_size = int(len(X) * 0.8)
X_train, X_test = X[:train_size], X[train_size:]
y_train, y_test = y[:train_size], y[train_size:]

# Build improved LSTM model
model = Sequential([
    LSTM(100, return_sequences=True, input_shape=(seq_length, 2)),
    Dropout(0.2),
    LSTM(50, return_sequences=False),
    Dropout(0.2),
    Dense(25),
    Dense(7)
])

# Compile with a lower learning rate
optimizer = Adam(learning_rate=0.0001)
model.compile(optimizer=optimizer, loss='mean_squared_error', metrics=['mae'])

# Train the model
model.fit(X_train, y_train, epochs=50, batch_size=32, validation_data=(X_test, y_test), verbose=1)

# Save the model and scaler
model.save('improved_lstm_model.h5')

import pickle
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("Model trained and saved as 'improved_lstm_model.h5'")