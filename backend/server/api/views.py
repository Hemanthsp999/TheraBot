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

from operator import itemgetter
from rest_framework.decorators import action
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain.chains.conversation.memory import ConversationBufferMemory
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from api.models import BookingModel, UserTherapistChatModel
from rest_framework import status
from rest_framework.response import Response
import whisper
from rest_framework import viewsets
import random
import time
import librosa
import numpy as np
from io import BytesIO
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta


transformer_model_name = "sentence-transformers/all-miniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name=transformer_model_name)
# conversation_memories = {}

# Load FAISS directory
folder_path = "/home/hexa/ai_bhrtya/backend/chatbot_model/faiss/"
vector_db = FAISS.load_local(folder_path=folder_path,
                             embeddings=embedding_model, allow_dangerous_deserialization=True)

User = get_user_model()


# return db
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


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTherapistChatModel
        fields = '__all__'
        db_table = "user_therapist_chat"


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
        access_token_expiry = now() + timedelta(minutes=60)

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

            '''
            self.conversation_memories = conversation_memories
            user_id = request.user.id if request.user.is_authenticated else request.session.session_key
            if user_id in self.conversation_memories:
                del self.conversation_memories[user_id]
            '''

            print("User Found:", user.email)

            refresh_token = request.data.get("refreshToken")
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=400)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logout successful", "redirect_url": "/login"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


# returns user_component
class User_View(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # returns list of therapist
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

    # returns the therapist sessions for users
    '''
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_therapist_user_chat_sessions(self, request):
        print(f"Headers: {request.headers}")
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return Response({"error": "User not authorized"}, status=status.HTTP_401_UNAUTHORIZED)

        # NOTE: need to work on this function

        try:
            if request.method == "GET":
                user_role = request.query_params.get('role', '')
                if "user" in user_role:
                    user_id = request.query_params.get('user_id')

                    sessions = UserTherapistChatModel.objects.filter(
                        user=user_id).order_by('created_at')

                    if not sessions.exists():
                        return Response({"error": "Session is not registered"}, status=status.HTTP_404_NOT_FOUND)

                elif "therapist" in user_role:
                    therapist_id = request.query_params.get('therapist_id')

                    sessions = UserTherapistChatModel.objects.filter(
                        therapist=therapist_id).order_by('created_at')

                    if not sessions.exists():
                        return Response({"error": "There is no sessions booked"}, status=status.HTTP_404_NOT_FOUND)
                else:
                    return Response({"error": "Bad request"}, status=status.HTTP_400_BAD_REQUEST)

                session_list = [{
                    "id": session.id,  # correcty way to get ID: session.id and not session.session_id
                    "name": session.user.name if "user" in user_role else session.therapist.name,
                    "message": session.message,
                    "created_at": session.created_at
                } for session in sessions]
                print(f"Session: {session_list}")

                return Response({"response": session_list}, status=status.HTTP_200_OK)

            else:
                return Response({"error": "Only get method allowd"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        except Exception as e:
            return Response({"error": f"Internal server error {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        '''

    # returns the success if the session booked successfully
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


# returns the therapist_components
class Therapist_View(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    # returns the client(patient) list
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

    # returns the therapist sessions for users

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_user_therapist_chat_id(self, request):
        print(f"Headers: {request.headers}")
        auth_header = request.headers.get("Authorization")
        print(f"Authorization: {auth_header}")

        if not auth_header:
            return Response({"error": "User not authorized"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user_role = request.query_params.get('role')
            sessions = UserTherapistChatModel.objects.all()

            registered_sessions = [{
                "session_id": session.id,
                "name": session.user.name if "therapist" in user_role else session.therapist.name,
            } for session in sessions]
            print("Registered Sessions", registered_sessions)

            return Response({
                "response": registered_sessions
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Internal server error {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post', 'get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_by_session_id(self, request):
        print(f"Header: {request.headers}")
        auth_header = request.headers.get('Authorization')

        # NOTE need to work on this
        if not auth_header:
            return Response({"error": "User in not authorized to use this func"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            session_id = request.query_params.get('session_id')

            get_session = UserTherapistChatModel.objects.get(session_id=session_id)

            if not get_session:
                return Response({"error": "Session is not registered"}, status=status.HTTP_404_NOT_FOUND)

            session_creds = [{
                "user_message": get_session.user_message,
                "therapist_message": get_session.therapist_message
            }]
            return Response({"response": session_creds}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Internal server error {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# return responses from bot
class ChatbotView(viewsets.ViewSet):

    # track the history of the sessions
    conversation_memories = {}

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.model_name = "llama3.2"
        self.temperature = 0.5
        self.whisper_model = whisper.load_model("tiny")
        self.llm = ChatOllama(model=self.model_name, temperature=self.temperature)
        self.vector_db = vector_db
        self.str_out_put_parser = StrOutputParser()
        self.rag_chain = self.setup_rag_chain()
        self.memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        # self.conversation_memories = conversation_memo

    def format_docs(self, docs):
        return "\n\n".join(doc.page_content for doc in docs)

    def setup_rag_chain(self):
        retriever = self.vector_db.as_retriever()

        template = """
        You are an AI Therapist named TheraBot. You provide efficient solution for users mental health issues.

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
            | self.llm
            | self.str_out_put_parser
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

        '''
        if query.lower() == "exit":
            # the memories get erased after the user logsout
            if user_id in self.conversation_memories:
                del self.conversation_memories[user_id]
            return Response({"Message": "Conversation ended"})
        '''

        # Process audio if provided
        if audio_file:
            audio_bytes = audio_file.read()
            audio_stream = BytesIO(audio_bytes)
            # Load the audio file into a NumPy array
            audio, sr = librosa.load(audio_stream, sr=16000)  # Whisper expects 16kHz audio
            # convert into array
            audio = np.array(audio, dtype=np.float32)
            audio = whisper.pad_or_trim(audio)
            result = self.whisper_model.transcribe(audio)
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
