# Copyright 2025 [Hemanth S P]
#
# Licensed under the Apache License, Version 2.0 (the "License");
# You may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


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

