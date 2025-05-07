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

    # returns approved clients for therapist
    path('fetchClients/',
         Therapist_View.as_view({'get': 'get_clients'}), name='fetchClients'),

    # return therapist list for user
    path('fetchTherapist/',
         User_View.as_view({'get': 'get_therapist'}), name='fetchTherapist'),

    # user can book therapist
    path('book_clients/',
         User_View.as_view({'post': 'book_therapist'}), name='book_clients'),

    # returns approved clients for have conversation with therapist
    path('get_session/',
         Therapist_View.as_view({'get': 'get_user_therapist_sessions'}), name="get_session/"),

    # returns client-therapist conversation
    path('get_chat_messages/',
         Therapist_View.as_view({'get': 'get_chat_messages'}), name="get_chat_messages/"),

    # add client/therapist message to database
    path('post_chat/', Therapist_View.as_view({'post': 'make_chat_to_db'}), name="post_chat/"),

    # currently not focusing
    path('send-otp/', Register_Login_View.as_view({'post': 'generate_otp'}), name="send-otp/"),

    # stores user health history into DB
    path('post_health_history', User_View.as_view(
        {'post': 'user_health_history'}), name="post_health_history/"),

    # returns the patient health summarize by ai agent
    path('ai_summarize/', User_View.as_view({'get': 'get_user_history'}), name="ai_summarize/"),

    # returns client who needs get approval from therapist
    path('get_pending_clients/',
         Therapist_View.as_view({'get': 'get_pending_clients'}), name='get_pending_clients/'),

    # returns client approval/decline
    path('make_approve/',
         Therapist_View.as_view({'post': 'approve_decline_request'}), name="make_approve/"),

    # returns approved list
    path('get_approval/',
         Therapist_View.as_view({'get': 'get_approve_decline'}), name="get_approve/"),

    # returns users session details
    path('get_session_details/',
         User_View.as_view({'get': 'get_user_creds'}), name='get_session_details/'),

    # return patient health summary
    path('summarize/',
         Therapist_View.as_view({'get': 'patient_history_summarizer'}), name='summarize/'),

    path('is_patient_info_exists/',
         User_View.as_view({'get': 'get_user_health_history'}), name='is_patient_info_exists/')

]
