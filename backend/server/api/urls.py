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


from django.urls import path
from .views import Register_Login_View, ChatbotView, User_View, Therapist_View

urlpatterns = [
    path("register/",
         Register_Login_View.as_view({'post': 'user_therapist_register'}), name="register"),
    path("login/", Register_Login_View.as_view({'post': 'user_therapist_login'}), name="login"),
    path("logout/", Register_Login_View.as_view({'post': 'logout'}), name="logout"),
    path('chatbot/', ChatbotView.as_view({'post': 'post'}), name='chatbot'),
    path('fetchTherapist/',
         User_View.as_view({'get': 'get_therapist'}), name='fetchTherapist'),
    path('book_clients/',
         User_View.as_view({'post': 'book_therapist'}), name='book_clients'),
    path('fetchClients/',
         Therapist_View.as_view({'get': 'get_clients'}), name='fetchClients')

]

