# api/urls.py

from django.urls import path
from .views import RegisterView, LoginView, LogoutView, SendOTPView, ResetPasswordView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    #   path('chatbot/', ChatbotView.as_view(), name='chatbot')
]

