# api/urls.py

from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ChatbotView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('chatbot/', ChatbotView.as_view(), name='chatbot')
]

