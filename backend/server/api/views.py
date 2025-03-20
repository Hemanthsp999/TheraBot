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

# from langchain.chains.combine_documents import create_stuff_documents_chain
# from langchain_core.output_parsers import StrOutputParser
from rest_framework.decorators import action
from langchain_core.prompts import PromptTemplate
# from langchain.chains import create_retrieval_chain
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from django.core.cache import cache
# from api.models import User
from api.models import Therapist, BookingModel
from rest_framework import status
from django.contrib.auth.hashers import check_password
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail
from rest_framework import viewsets
import random
import time
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from django.conf import settings
import jwt

# from langchain.memory import ConversationBufferMemory

transformer_model_name = "sentence-transformers/all-miniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name=transformer_model_name)

# Load FAISS directory
folder_path = "/home/hexa/ai_bhrtya/backend/chatbot_model/faiss/"
vector_db = FAISS.load_local(folder_path=folder_path,
                             embeddings=embedding_model, allow_dangerous_deserialization=True)

User = get_user_model()


class UserTherapistSerializer(serializers.Serializer):
    user_type = serializers.ChoiceField(choices=['user', 'therapist'], write_only=True)

    # Common fields
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=15)

    # User-specific fields
    username = serializers.CharField(required=False)
    gender = serializers.CharField(required=False)
    age = serializers.IntegerField(required=False)

    # Therapist-specific fields
    name = serializers.CharField(required=False)
    specialization = serializers.CharField(required=False)
    experience = serializers.IntegerField(required=False)
    desc = serializers.CharField(required=False)
    availability = serializers.CharField(required=False)

    def create(self, validated_data):
        user_type = validated_data.pop('user_type')

        validated_data['password'] = make_password(validated_data['password'])  # Hash password

        if user_type == 'user':
            return User.objects.create(**validated_data)

        if user_type == 'therapist':
            return Therapist.objects.create(**validated_data)

        raise serializers.ValidationError("Invalid user type selected")


class Register_Login_View(viewsets.ViewSet):
    permission_classes = [AllowAny]  # Open for registration

    @action(detail=False, methods=['post'])
    def user_therapist_register(self, request):
        data = request.data.copy()
        print(f"Received {request.data.get('user_type')} Registration Data:",
              request.data)  # Debugging

        if data['user_type'] == "therapist":

            serializer = UserTherapistSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                print("Therapist Registered Successfully!")
                return Response(
                    {'message': 'Therapist registered successfully'},
                    status=201
                )
            print("Serializer Errors:", serializer.errors)  # Debugging errors
            return Response(serializer.errors, status=400)

        elif data['user_type'] == "user":

            serializer = UserTherapistSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                print("User Registration Successful!")
                return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

            print("Serializer Errors:", serializer.errors)  # Debugging errors
            return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def user_therapist_login(self, request, format=None):
        email = request.data.get('email')
        password = request.data.get('password')
        user_type = request.data.get('user_type')

        if not email or not password:
            return Response(
                {'error': 'Both email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user_type == "user":
            try:
                user = User.objects.get(email=email)
                if not user.check_password(password):
                    raise User.DoesNotExist  # Use same exception for security
            except User.DoesNotExist:
                # Consider adding a small delay here to prevent timing attacks
                time.sleep(random.uniform(0.1, 0.3))  # Add 'import time, random' at the top
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Create token with explicit expiry
            refresh = RefreshToken.for_user(user)
            access_token_expiry = now() + timedelta(minutes=30)

            # Set token expiry (if using simple_jwt)
            refresh.access_token.set_exp(lifetime=timedelta(minutes=30))
            user_type = "patient"

            return Response({
                'refresh': str(refresh),
                'access_token': str(refresh.access_token),
                'redirect_url': '/',
                'expires_at': access_token_expiry,
                "name": str(user.username),
                "user_type": user_type
            }, status=status.HTTP_200_OK)

        elif user_type == "therapist":
            try:
                therapist = Therapist.objects.get(email=email)
                if not check_password(password, therapist.password):  # Hash check
                    raise Therapist.DoesNotExist
            except Therapist.DoesNotExist:
                time.sleep(random.uniform(0.1, 0.3))  # Prevent timing attacks
                return Response({'error': 'Invalid credentials'}, status=401)

            #  Define Expiry Times
            access_token_expiry = now() + timedelta(minutes=60)
            refresh_token_expiry = now() + timedelta(days=1)

            #  Manually Generate JWT Tokens
            access_token_payload = {
                "therapist_id": therapist.id,
                "email": therapist.email,
                "exp": access_token_expiry.timestamp(),  # Convert to UNIX timestamp
                "type": "access",
            }
            access_token = jwt.encode(access_token_payload, settings.SECRET_KEY, algorithm="HS256")

            refresh_token_payload = {
                "therapist_id": therapist.id,
                "email": therapist.email,
                "exp": refresh_token_expiry.timestamp(),
                "type": "refresh",
            }
            refresh_token = jwt.encode(refresh_token_payload,
                                       settings.SECRET_KEY, algorithm="HS256")
            user_type = "Therapist"

            return Response({
                "access_token": str(access_token),
                "refresh_token": str(refresh_token),
                "expires_at": access_token_expiry.isoformat(),  # Include readable expiry
                "therapist_id": therapist.id,
                "email": therapist.email,
                "name": therapist.name,
                "redirect_url": "/",
                "user_type": user_type
            }, status=200)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Debugging: Print authentication headers
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

            return Response({"message": "Logout successful"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


class User_View(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def get_therapist(self, request):
        print("Full Request Headers:", request.headers)
        print("Authorization Header:", request.headers.get("Authorization"))

        # ✅ Check for authorization token
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return Response(
                {"error": "No authorization header", "code": "no_auth_header"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # ✅ Fetch all therapists
            therapists = Therapist.objects.all()
            if not therapists.exists():
                return Response({"message": "No therapists available"}, status=status.HTTP_404_NOT_FOUND)

            # ✅ Serialize therapist data
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

    @action(detail=False, methods=['post'])
    def book_therapist(self, request):
        print(f"Full Headers: {request.headers}")
        auth_header = request.headers.get('Authorization')
        print(f'Authorization header: {auth_header}')

        if not auth_header:
            return Response({"error": "Need Acces token."}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        therapist_id = request.data.get('therapist_id')
        assign_date = request.data.get('assign_date')
        session_type = request.data.get('session_type')
        assign_time = request.data.get('assign_time')
        note = request.data.get('note', '')
        is_valid = request.data.get('is_valid')

        try:
            booking = BookingModel.objects.all()
            try:
                therapist = Therapist.objects.get(id=therapist_id)
            except Therapist.DoesNotExist:
                return Response({"error": "Therapist Not Found"}, status=status.HTTP_404_NOT_FOUND)

            if not booking.exists():
                return Response({"message": "There's no data to fetch, Verify database"}, status=status.HTTP_404_NOT_FOUND)

            booking = BookingModel.objects.create(
                user=user,
                therapist=therapist,
                assign_date=assign_date,
                assign_time=assign_time,
                note=note,
                session_type=session_type,
                is_valid=is_valid
            )

            return Response({"message": "Booking successfull", "booking_id": booking.id}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Therapist_View(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @action(detail=False, methods=['get'])
    def get_clients(self, request):

        print(f"Full Headers: {request.headers}")
        auth_header = request.headers.get("Authorization")

        print(f"Authorization: {auth_header}")

        if not auth_header:
            return Response({"error": "No Access Key found"}, status=status.HTTP_401_UNAUTHORIZED)
        therapist_id = request.query_params.get("therapist_id")

        if not therapist_id:
            return Response({"error": "Therapist id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            get_bookings = BookingModel.objects.filter(therapist_id=therapist_id)
            if not get_bookings.exists():
                return Response({"error": "There's no Appointment sessions to fetch."}, status=status.HTTP_404_NOT_FOUND)

            booking_list = [{
                "user_id": booking.user.id,
                "therapist_id": booking.therapist.id,
                "age": booking.user.age,
                "gender": booking.user.gender,
                "is_valid": booking.is_valid
            } for booking in get_bookings]

            return Response({"bookings": booking_list}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatbotView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.model_name = "llama3.2"
        self.temperature = 0.5

        self.llm = ChatOllama(model=self.model_name, temperature=self.temperature)

        self.vector_db = vector_db

        # self.memory = ConversationBufferMemory()
        self.str_out_put_parser = StrOutputParser()

        self.rag_chain = self.setup_rag_chain()

    def format_docs(self, docs):
        return "\n\n".join(doc.page_content for doc in docs)

    def setup_rag_chain(self):
        retriever = self.vector_db.as_retriever()

        template = """
            Use the following pieces of context to answer the question at the end. If you don't know the answer or if the question is not related to the given context, please respond with "I'm sorry, but I don't have enough information to answer that question based on the provided context."

            Context: {context}

            Question: {question}

            """
        prompt = PromptTemplate.from_template(
            template=template
        )

        rag_chain = ({
            "context": retriever | self.format_docs, "question": RunnablePassthrough()}
            | prompt
            | self.llm
            | self.str_out_put_parser
        )

        return rag_chain

    def conversation(self, request):

        query = request.data.get('query', '')

        if query.lower() == "exit":
            return Response({"Message": "Conversation endend"})

        response = self.rag_chain.invoke(query)

        return Response({"response": response})

    def post(self, request):
        # Add extensive logging
        print("Full Request Headers:", request.headers)
        print("Authorization Header:", request.headers.get("Authorization"))

        # Manual token extraction and validation
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return Response(
                {"error": "No authorization header", "code": "no_auth_header"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # Extract token (remove 'Bearer ' prefix)
            token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else None

            if not token:
                return Response(
                    {"error": "Invalid token format", "code": "invalid_token_format"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Manually decode the token
            try:
                decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                print("Decoded Token:", decoded_token)

                # Manually check user existence
                user_id = decoded_token.get('user_id')
                if not user_id:
                    return Response(
                        {"error": "No user_id in token", "code": "no_user_id"},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

                try:
                    user = User.objects.get(id=user_id)
                    print(f"User found: {user.email}")
                except User.DoesNotExist:
                    return Response(
                        {"error": "User not found", "code": "user_not_found"},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            except jwt.ExpiredSignatureError:
                return Response(
                    {"error": "Token has expired", "code": "token_expired"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except jwt.InvalidTokenError:
                return Response(
                    {"error": "Invalid token", "code": "invalid_token"},
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

