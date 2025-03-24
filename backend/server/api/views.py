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

from rest_framework.decorators import action
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
# from langchain.chains import create_retrieval_chain
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_huggingface.llms import HuggingFacePipeline
from langchain_ollama import ChatOllama
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from api.models import BookingModel
from rest_framework import status
# from django.contrib.auth.hashers import check_password
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets
import random
import time
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from django.conf import settings
import jwt
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

# from langchain.memory import ConversationBufferMemory

transformer_model_name = "sentence-transformers/all-miniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name=transformer_model_name)

# Load FAISS directory
folder_path = "/home/hexa/ai_bhrtya/backend/chatbot_model/faiss/"
vector_db = FAISS.load_local(folder_path=folder_path,
                             embeddings=embedding_model, allow_dangerous_deserialization=True)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'password', 'role', 'name', 'phone_number',
            'gender', 'age', 'specialization', 'experience', 'desc', 'availability'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        role = data.get("role")

        if role == "user":
            # Remove therapist-specific fields if role is "user"
            data.pop("specialization", None)
            data.pop("experience", None)
            data.pop("desc", None)
            data.pop("availability", None)
        elif role == "therapist":
            # Ensure required therapist fields are provided
            missing_fields = []
            for field in ["specialization", "experience", "desc", "availability"]:
                if not data.get(field):
                    missing_fields.append(field)

            if missing_fields:
                raise serializers.ValidationError(
                    {field: "This field is required for therapists." for field in missing_fields})

        return data

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        validated_data['password'] = make_password(validated_data['password'])
        return user


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingModel
        fields = '__all__'


class Register_Login_View(viewsets.ViewSet):
    permission_classes = [AllowAny]  # Open for registration

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

        return Response({
            'refresh': str(refresh),
            'access_token': str(refresh.access_token),
            'redirect_url': '/' if user_type == "user" else "/therapist",
            'expires_at': access_token_expiry,
            "name": user.name,
            "id": user.id,
            "email": user.email,
            "user_type": user.role,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
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

            return Response({"message": "Logout successful", "redirect_url": "/login"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


class User_View(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def get_therapist(self, request):
        print("Full Request Headers:", request.headers)
        print("Authorization Header:", request.headers.get("Authorization"))

        # Check for authorization token
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

            # Serialize therapist data
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
        id = request.data.get('therapist_id')
        role = request.data.get('role', '').lower()
        assign_date = request.data.get('assign_date')
        session_type = request.data.get('session_type')
        assign_time = request.data.get('assign_time')
        note = request.data.get('note', '')
        is_valid = request.data.get('is_valid')

        if not id:
            return Response({"error": "Therapist ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            id = int(id)
        except ValueError:
            return Response({"error": "Invalid therapist ID format."}, status=status.HTTP_400_BAD_REQUEST)

        if role != "therapist":
            return Response({"error": "Invalid role provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            therapist = User.objects.filter(role="therapist", id=id).first()
            if not therapist:
                return Response({"error": "Therapist Not Found"}, status=status.HTTP_404_NOT_FOUND)

            # Insert into Database
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

            return Response({"message": "Booking successful", "booking": serialized_booking}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Therapist_View(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @action(detail=False, methods=['get'])
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


class ChatbotView(viewsets.ViewSet):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.model_name = "llama3.2"
        self.temperature = 0.5

        self.llm = ChatOllama(model=self.model_name, temperature=self.temperature)

        self.vector_db = vector_db

        self.str_out_put_parser = StrOutputParser()

        self.rag_chain = self.setup_rag_chain()

    def format_docs(self, docs):
        return "\n\n".join(doc.page_content for doc in docs)

    def setup_rag_chain(self):
        retriever = self.vector_db.as_retriever()

        '''
        template = """
            Use the following pieces of context to answer the question at the end. If you don't know the answer or if the question is not related to the given context, please respond with "I'm sorry, but I don't have enough information to answer that question based on the provided context."

            Context: {context}

            Question: {question}

            """
        prompt = PromptTemplate.from_template(
            template=template
        )
        '''
        prompt = ChatPromptTemplate.from_messages([

            ("system", "You are a helpful assistant. Please respond to the questions"),
            ("user", "Question:{question}")

        ])

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

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], Authentication=[JWTAuthentication])
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
