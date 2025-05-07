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

import time
import pytz
import random
import librosa
import whisper
import numpy as np
from operator import itemgetter
from rest_framework.decorators import action
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain.chains.conversation.memory import ConversationBufferMemory
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from django.utils.timezone import now
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework import viewsets
from io import BytesIO
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from .Serializers import BookingSerializer, UserSerializer, PatientHealthSerializer, User, ChatSerializer
from api.models import BookingModel, UserTherapistChatModel, PatientHealthInfo
from api.agent_summarizer import summarize_patient_data
from datetime import date, datetime

india = pytz.timezone("Asia/Kolkata")

# NOTE Pre-Load model components
transformer_model_name = "sentence-transformers/all-miniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name=transformer_model_name)

# path to vector database
folder_path = "/home/hexa/ai_bhrtya/backend/chatbot_model/faiss/"
vector_db = FAISS.load_local(folder_path=folder_path,
                             embeddings=embedding_model, allow_dangerous_deserialization=True)
model_name = "llama3.2"  # Llama-3.2 LLM Model
temperature = 0.5
whisper_model = whisper.load_model("tiny")
llm = ChatOllama(model=model_name, temperature=temperature)
vector_db = vector_db
str_out_put_parser = StrOutputParser()


class Register_Login_View(viewsets.ViewSet):
    permission_classes = [AllowAny]

    # -returns to client and therapist to database
    @action(detail=False, methods=['post'])
    def user_therapist_register(self, request):
        data = request.data.copy()
        role = data.get('role', 'user')
        print(f"Received {request.data.get('role')} Registration Data:",
              request.data)  # DebugginUserg
        print(f"role: {role}")
        if role not in ['user', 'therapist']:
            return Response({"error": "Invalid role. Choose 'user' or 'therapist'."}, status=400)

        # if data['role'] == "therapist":
        if data['role'] == "therapist":

            serializer = UserSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                print("Therapist Registered Successfully!")
                return Response(
                    {'message': 'Therapist registered successfully', 'redirect_url': '/therapist-login'},
                    status=201
                )
            print("Serializer Errors:", serializer.errors)  # Debugging errors
            return Response(serializer.errors, status=400)

        elif data['role'] == "user":

            serializer = UserSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                print("User Registration Successful!")
                return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

            print("Serializer Errors:", serializer.errors)  # Debugging errors
            return Response(serializer.errors, status=400)

        else:
            print("Invalid Role")

    # -returns authorized clients/therapist
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def user_therapist_login(self, request, format=None):
        email = request.data.get('email')
        password = request.data.get('password')

        user_type = request.data.get('role')
        print(user_type)

        if not email or not password:
            return Response(
                {'error': 'Both email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)

            if not user.check_password(password):
                raise User.DoesNotExist

            if user_type == "user":
                get_patient_history = PatientHealthInfo.objects.filter(user=user).exists()
                print("Patient Health history", get_patient_history)

        except User.DoesNotExist:
            # Consider adding a small delay here to prevent timing attacks
            time.sleep(random.uniform(0.1, 0.3))
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

            # Create token with explicit expiry
        refresh = RefreshToken.for_user(user)
        access_token_expiry = now() + timedelta(minutes=60)

        # Set token expiry (if using simple_jwt)
        refresh.access_token.set_exp(lifetime=timedelta(minutes=30))

        print(user.email)

        return Response({
            'refresh': str(refresh),
            'access_token': str(refresh.access_token),
            'redirect_url': '/' if user_type == "user" else "/therapist",
            'expires_at': access_token_expiry,
            "name": user.name,
            "id": user.id,
            "email": user.email,
            "user_type": user.role,
            "patient_history": True if user.role == "user" and get_patient_history else False
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def logout(self, request):
        try:
            print("Authorization Header:", request.headers.get("Authorization"))

            # Manually authenticate user
            auth = JWTAuthentication()
            user, token = auth.authenticate(request)

            if not user:
                return Response({"error": "User not authenticated"}, status=401)

            print("User Found:", user.email)

            refresh_token = request.data.get("refreshToken")
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=400)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logout successful", "redirect_url": "/login"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=400)

    # we've not implemented forgot pass func in frontend, so this is of no use
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def generate_otp(self, request):
        phone = request.data.get("phone_number")

        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            get_phone = User.objects.get(phone_number=phone)
            print(f"user found: {get_phone.name}")

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class User_View(viewsets.ViewSet):

    # -returns list of therapist to users
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_therapist(self, request):
        print("Authorization Header:", request.headers.get("Authorization"))

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return Response(
                {"error": "No authorization header", "code": "no_auth_header"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # Fetch all therapists
            therapists = User.objects.filter(role="therapist")
            if not therapists.exists():
                return Response({"message": "No therapists available"}, status=status.HTTP_404_NOT_FOUND)

            # make a list of therapist retrieved from database
            therapist_list = [
                {
                    "id": therapist.id,
                    "name": therapist.name,
                    "email": therapist.email,
                    "specialization": therapist.specialization,
                    "experience": therapist.experience,
                    "availability": therapist.availability,
                    "desc": therapist.desc,
                }
                for therapist in therapists
            ]

            return Response({"therapists": therapist_list}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # returns the success if the session booked successfully
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def book_therapist(self, request):
        auth_header = request.headers.get('Authorization')
        print(f'Authorization header: {auth_header}')

        if not auth_header:
            return Response({"error": "Need Acces token."}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        id = request.data.get('therapist_id')
        role = request.data.get('role', '').lower()
        assign_date = request.data.get('assign_date')
        session_type = request.data.get('session_type')
        assign_time = request.data.get('assign_time')
        note = request.data.get('note', '')
        is_valid = request.data.get('is_valid')

        # ID exists ?
        if not id:
            return Response({"error": "Therapist ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # typecast to int from str
            id = int(id)
        except ValueError:
            return Response({"error": "Invalid therapist ID format."}, status=status.HTTP_400_BAD_REQUEST)

        if role != "therapist":
            return Response({"error": "Invalid role provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            therapist = User.objects.filter(role="therapist", id=id).first()
            if not therapist:
                return Response({"error": "Therapist Not Found"}, status=status.HTTP_404_NOT_FOUND)

            if BookingModel.objects.filter(user=user, therapist=therapist).exists():
                return Response({"response": "Session already exists"}, status=status.HTTP_302_FOUND)

            # if session timings are overlaping or trying to book at the same slot/time ???
            if BookingModel.objects.filter(assign_date=assign_date, assign_time=assign_time).exists():
                return Response({"error": f"Session with {assign_date} and {assign_time} already exists"}, status=status.HTTP_409_CONFLICT)

            # Fetch Database
            booking = BookingModel.objects.create(
                user=user,
                therapist=therapist,
                assign_date=assign_date,
                assign_time=assign_time,
                note=note,
                session_type=session_type,
                is_valid=is_valid
            )

            serialized_booking = BookingSerializer(booking).data

            # return success message
            return Response({"message": "Booking successful", "booking": serialized_booking}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Fetch Patient health history into Database
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def user_health_history(self, request):
        print(f'Full header {request.headers}')
        auth_header = request.headers.get('Authorization')
        health_history = request.data.get('health_history')
        family_history = request.data.get('family_history')
        curr_medications = request.data.get('curr_medications')
        present_health_issues = request.data.get('present_health_issue')

        user_id = request.query_params.get('user_id')

        if not auth_header:
            return Response({"error": "Header is missing"}, status=status.HTTP_401_UNAUTHORIZED)

        # user_id exists ?
        if not user_id:
            return Response({"error": "Require user_id params"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # retrieve user from the database
            get_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            patient_health_history = PatientHealthInfo.objects.create(
                user=get_user,
                health_history=health_history,
                curr_medications=curr_medications,
                family_history=family_history,
                present_health_issues=present_health_issues
            )

            fetch_to_db = PatientHealthSerializer(patient_health_history).data
            print(f"Fetched to Database: {fetch_to_db}")

            return Response({"response": "Data fetched to database successfully."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Internal server error {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # returns patient health history
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_user_health_history(self, request):
        print(f"Authorization: {request.headers}")
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return Response({"error": "Sorry, You are not authorized"}, status=status.HTTP_401_UNAUTHORIZED)

        user_id = request.query_params.get('user_id')
        print(f"user id: {user_id}")

        try:
            # retrieve user from database
            get_user = User.objects.get(id=user_id)

            if not get_user.DoesNotExist:
                return Response({"error": "user not found"}, status=status.HTTP_404_NOT_FOUND)

            get_patient = PatientHealthInfo.objects.filter(user=get_user).first()

            if not get_patient:
                return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

            print(f"user found: {get_patient}")

            return Response({"patient_history": "true"}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error Debug: {str(e)}")
            return Response({"error": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # returns user session info
    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_user_creds(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or "Bearer " not in auth_header:
            return Response({"error": "No Access Key found"}, status=status.HTTP_401_UNAUTHORIZED)

        booking_id = request.GET.get('request_id')
        user_id = request.query_params.get('user_id')
        print(f"User: {user_id}")

        if not booking_id:
            return Response({"error": "Missing request_id"}, status=400)

        try:
            get_creds = BookingModel.objects.get(id=booking_id)

            user_cred = {
                "id": get_creds.id,
                "therapist": get_creds.therapist.name,
                "session_type": get_creds.session_type,
                "Date": get_creds.assign_date,
                "Time": get_creds.assign_time
            }

            return Response({"response": user_cred}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Therapist_View(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    # returns client(patient) list
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_clients(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or "Bearer " not in auth_header:
            return Response({"error": "No Access Key found"}, status=status.HTTP_401_UNAUTHORIZED)

        therapist_id = request.query_params.get("therapist_id")

        try:
            # Retrieve clients from the database
            get_clients = BookingModel.objects.filter(therapist=therapist_id)

            if not get_clients.exists:
                return Response({"message": "Clients not found"}, status=status.HTTP_404_NOT_FOUND)

            # make a list of clients who have appointment for particular therapist and send response
            booking_list = [{
                "id": client.id,
                "user_id": client.user.id,
                "name": client.user.name,
                "age": client.user.age,
                "email": client.user.email,
                "phone": client.user.phone_number,
                "gender": client.user.gender,
                "notes": client.note,
                "appointment": client.assign_date,
                "status": client.is_valid,
            } for client in get_clients]

            return Response({"message": booking_list}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Internal server error {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # returns client whose status is approve or rejected
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_pending_clients(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or "Bearer " not in auth_header:
            return Response({"error": "No Access Key found"}, status=status.HTTP_401_UNAUTHORIZED)

        therapist_id = request.query_params.get('therapist_id')
        print(f"Therapist ID: {therapist_id}")

        try:
            get_therapist = User.objects.get(id=therapist_id)
            if not get_therapist:
                return Response({"error": "Therapist not found"}, status=status.HTTP_404_NOT_FOUND)

            print(f"USER: {get_therapist}")

            get_pending_list = BookingModel.objects.filter(
                therapist=get_therapist, status="Pending")

            print(f"{get_pending_list}")

            if not get_pending_list:
                return Response({"error": "No list found"}, status=status.HTTP_404_NOT_FOUND)

            session_list = [{
                "id": session.id,
                "name": session.user.name,
                "requestDate": session.assign_date,
                "requestTime": session.assign_time,
                "requestType": session.session_type,
                "message": session.note,
                "status": session.status,
            } for session in get_pending_list]

            print(f"Session list: {session_list}")

            return Response({"response": session_list}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception: {str(e)}")
            return Response({"error": "Internal Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # return sessions if approved
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def approve_decline_request(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or "Bearer " not in auth_header:
            return Response({"error": "No Access Key found"}, status=status.HTTP_401_UNAUTHORIZED)

        therapist_id = request.data.get('therapist_id')
        print(f"Therapist ID: {therapist_id}")
        try:
            get_therapist = User.objects.get(id=therapist_id if request.data.get(
                'therapist_id') else request.query_params.get('user_id'))
            if not get_therapist:
                return Response({"error": "Therapist not found"}, status=status.HTTP_404_NOT_FOUND)

            print(f"USER: {get_therapist}")
            is_approved = request.data.get("is_approved")
            booking_id = request.data.get('booking_id')

            if not is_approved or not booking_id:
                return Response({"error": "Missing data"}, status=status.HTTP_400_BAD_REQUEST)

            booking = BookingModel.objects.get(
                id=booking_id, therapist=get_therapist)

            if is_approved == "Declined":
                booking.delete()

            elif is_approved == "Approved":
                booking.status = is_approved

                booking.save()

                initiate_chat = UserTherapistChatModel.objects.create(
                    session_id=booking,
                    user=booking.user,
                    therapist=booking.therapist,
                    messages=[{"sender": "user", "message": "session Initaied", "date": date.today().isoformat(), "time": datetime.now(india).strftime("%H:%M")},
                              {"sender": "therapist", "message": "Session Initiated", "date": date.today().isoformat(), "time": datetime.now(india).strftime("%H:%M")}]
                )

                print(f"Chat Initiated: {initiate_chat}")

                return Response({"response": "Updated Successfully"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Exception: {str(e)}")
            return Response({"error": "Internal Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # returns approved sessions
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_approve_decline(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or "Bearer " not in auth_header:
            return Response({"error": "No Access Key found"}, status=status.HTTP_401_UNAUTHORIZED)
        user_id = request.query_params.get('user_id')

        try:
            get_user = User.objects.get(id=user_id)
            if not get_user:
                return Response({"error": "Therapist not found"}, status=status.HTTP_404_NOT_FOUND)
            print(get_user)

            get_approval = BookingModel.objects.filter(user=get_user).first()
            approval_list = []

            approval_list.append({
                "id": get_approval.id,
                "type": get_approval.session_type,
                "status": get_approval.status,
                "note": get_approval.note,
                "requestDate": get_approval.assign_date,
            })
            print(approval_list)

            return Response({"response": approval_list}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception: {str(e)}")
            return Response({"error": "Internal Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # return sessions list for user and therapist
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_user_therapist_sessions(self, request):
        print(f"Headers: {request.headers}")
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return Response({"error": "User not authorized"}, status=status.HTTP_401_UNAUTHORIZED)

        user_role = request.query_params.get('role')
        user_id = request.query_params.get('user_id')
        print(f"Debugging Log: Role: {user_role} | User ID: {user_id}")

        try:

            get_user = User.objects.get(id=user_id)

            if not get_user:
                return Response({"error": "There is no session registered for this user/therapist"}, status=status.HTTP_404_NOT_FOUND)

            if user_role == "user":
                sessions = UserTherapistChatModel.objects.filter(user=get_user)
            elif user_role == "therapist":
                sessions = UserTherapistChatModel.objects.filter(therapist=get_user)

            registered_sessions = [{
                "session_id": session.session_id.id,
                "name": session.user.name if user_role == "therapist" else session.therapist.name,
                "id": session.user.id,
            } for session in sessions]
            print("Registered Sessions", registered_sessions)

            return Response({
                "response": registered_sessions
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception: {str(e)}")
            return Response({"error": f"USER {user_id} Does not in the Session Registered Log"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # return chat message of client <--> therapist
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_chat_messages(self, request):
        print(f"Header: {request.headers}")
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return Response({"error": "User in not authorized to use this func"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            session_id = request.query_params.get('session_id')
            user_role = request.query_params.get('role')
            user_id = request.query_params.get('user_id')
            print(f"Session ID: {session_id} | User ID: {user_id}")
            print(f"Role: {user_role}")

            if not user_role or not session_id or not user_id:
                return Response({"error": "session_iD, user_role and user_id are missing"}, status=status.HTTP_406_NOT_ACCEPTABLE)

            get_user = User.objects.get(id=user_id)

            if not get_user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            if user_role == "user":
                get_session = UserTherapistChatModel.objects.filter(
                    id=session_id, user=get_user).first()
            elif user_role == "therapist":
                get_session = UserTherapistChatModel.objects.filter(
                    id=session_id, therapist=get_user).first()
            else:
                print("Invalid Role provided")

            print("Debugging Log")
            print(f"ID: {user_id} with Name: {get_user.name} has registered session with -> {get_session} ")

            if not get_session:
                return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

            return Response({"response": get_session.messages}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception: {str(e)}")
            return Response({"error": f"Internal server error {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # this api get called if web sockets get crashed
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def make_chat_to_db(self, request):
        print(f"Full header: {request.headers}")
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return Response({"error": "User in not authorized to use this func"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            session_id = request.query_params.get('session_id')
            get_session = UserTherapistChatModel.objects.filter(
                session_id=session_id).order_by('-id').first()
            print(f"Session ID: {get_session}")

            user_role = request.query_params.get('role', None)

            if "therapist" in user_role:
                therapist_message = request.data.get('therapist_message', None)
                therapist_id = request.data.get('therapist_id')

                therapist = User.objects.get(id=therapist_id)
                UserTherapistChatModel.objects.create(
                    session_id=get_session.session_id, user=get_session.user, therapist_message=therapist_message, therapist=therapist)
            elif "user" in user_role:
                user_message = request.data.get('user_message', None)
                user_id = request.data.get('user_id')

                user = User.objects.get(id=user_id)

                UserTherapistChatModel.objects.create(
                    session_id=get_session.session_id, user_message=user_message, user=user, therapist=get_session.therapist)

            return Response({"response": "Data updated successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Internal server error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # returns Patient health summary
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def patient_history_summarizer(self, request):
        print(f"Header: {request.headers}")
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return Response({"error": "The user is not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        user_id = request.query_params.get('user_id')

        print(f"user id: {user_id}")

        try:
            get_user = User.objects.get(id=user_id)

            if not get_user.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            get_patient_history = PatientHealthInfo.objects.get(user=get_user)

            # convert to PatientData schema
            patient_health_data = {
                "patient_id": str(get_user.id),
                "patient_name": get_patient_history.user.name,
                "patient_age": str(get_patient_history.user.age),
                "patient_gender": get_patient_history.user.gender,
                "health_history": get_patient_history.health_history,
                "family_history": get_patient_history.family_history,
                "curr_medications": get_patient_history.curr_medications,
                "present_issues": get_patient_history.present_health_issues,
            }

            print(f"Patient History: {patient_health_data}")

            # returns summary of patient history
            get_summary = summarize_patient_data(patient_health_data)

            print(f"Patient Summary: {get_summary}")

            return Response({get_summary.get("summary", "")}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error Debug: {str(e)}")
            return Response({"error": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatbotView(viewsets.ViewSet):

    # NOTE It only tracks current session after expiriation of session the memory will be wiped out
    conversation_memories = {}

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.rag_chain = self.setup_rag_chain()
        self.memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    def format_docs(self, docs):
        return "\n\n".join(doc.page_content for doc in docs)

    def setup_rag_chain(self):
        retriever = vector_db.as_retriever(search_kwargs={"k": 3})

        template = """
        You are an AI Therapist named TheraBot. You provide efficient solution for users mental health issues.
        And also highlight most important solution. 
        If user asks related to Sucidical thoughts, then say "It's sensitive topic you should not think of that, just remember your family who are waiting for you, please call 100 for more help"

        Context information is below.
        {context}

        Chat history:
            {chat_history}

        Human: {input}
        AI:"""

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", template),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}"),
            ]
        )

        rag_chain = (
            {
                "context": itemgetter("input") | retriever | self.format_docs,
                "input": lambda x: x["input"],
                "chat_history": lambda x: x.get("chat_history", []),
            }
            | prompt
            | llm
            | str_out_put_parser
        )

        return rag_chain

    def get_memory_for_user(self, user_id):
        """Get or create a memory instance for a specific user"""
        if user_id not in self.conversation_memories:
            self.conversation_memories[user_id] = ConversationBufferMemory(return_messages=True)
            print(f"Session history: {self.conversation_memories[user_id]}")
        return self.conversation_memories[user_id]

    def conversation(self, request):
        query = request.data.get('query', "").strip()
        audio_file = request.FILES.get("audio", None)
        print(f"audio file is received: {audio_file}")

        user_id = request.user.id if request.user.is_authenticated else request.session.session_key

        # Get memory for this specific user
        memory = self.get_memory_for_user(user_id)

        # Retrieve chat history from memory
        chat_history = memory.load_memory_variables({}).get("history", [])

        if not (query or audio_file):
            return Response({"error": "Query is missing"}, status=status.HTTP_400_BAD_REQUEST)

        # Process audio if provided
        if audio_file:
            audio_bytes = audio_file.read()
            audio_stream = BytesIO(audio_bytes)
            # Load the audio file into a NumPy array
            audio, sr = librosa.load(audio_stream, sr=16000)  # Whisper expects 16kHz audio
            # convert into array
            audio = np.array(audio, dtype=np.float32)
            audio = whisper.pad_or_trim(audio)
            result = whisper_model.transcribe(audio)
            print(f"Decoded Audio: {result['text']}")
            query = result['text']

        # Use the RAG chain with proper input structure
        response = self.rag_chain.invoke({"input": query, "chat_history": chat_history})

        # add user_question and bot_response into chat_memory
        memory.chat_memory.add_user_message(query)
        memory.chat_memory.add_ai_message(response)

        return Response({"response": response})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def post(self, request):
        # Add extensive logging
        print("Full Request Headers:", request.headers)
        print("Authorization Header:", request.headers.get("Authorization"))
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                return Response(
                    {"error": "No authorization header", "code": "no_auth_header"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response(
                {"error": f"Authentication error: {str(e)}", "code": "auth_error"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # If all checks pass, proceed with the conversation
        return self.conversation(request)
