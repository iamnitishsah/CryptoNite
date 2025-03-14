from django.contrib import admin
from django.urls import path
from predictor.views import DataAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/data/', DataAPIView.as_view(), name='data-api'),
]