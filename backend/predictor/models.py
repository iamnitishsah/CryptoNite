from django.db import models

class CryptoData(models.Model):
    date = models.DateField()
    price = models.FloatField()
    volume = models.FloatField(null=True)  # Add volume field

class Prediction(models.Model):
    date = models.DateField()
    predicted_price = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)