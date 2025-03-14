from rest_framework import serializers
from .models import CryptoData, Prediction

class CryptoDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CryptoData
        fields = ['date', 'price']

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = ['date', 'predicted_price']