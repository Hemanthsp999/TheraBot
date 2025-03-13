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

from langchain.chains.combine_documents import create_stuff_documents_chain
# from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain.chains import create_retrieval_chain
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
import random
import time
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from django.conf import settings
import jwt
import logging

logger = logging.getLogger(__name__)

# from langchain.memory import ConversationBufferMemory

transformer_model_name = "sentence-transformers/all-miniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name=transformer_model_name)

# Load FAISS directory
folder_path = "/home/hexa/ai_bhrtya/backend/mental_health_faiss_index/"
vector_db = FAISS.load_local(folder_path=folder_path,
                             embeddings=embedding_model, allow_dangerous_deserialization=True)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'gender', 'age',
                  'phone_number', 'password']  # ✅ Remove `username`
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])  # ✅ Hash password
        return User.objects.create(**validated_data)


class TherapistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Therapist
        fields = ['name', 'email', 'password', 'specialization',
                  'experience', 'phone_number', 'desc', 'availability']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])  # Hash password
        return Therapist.objects.create(**validated_data)


class TherapistRegisterView(APIView):
    permission_classes = [AllowAny]  # Open for registration

    def post(self, request):
        print("📩 Received Therapist Registration Data:", request.data)  # Debugging

        serializer = TherapistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print("✅ Therapist Registered Successfully!")
            return Response(
                {'message': 'Therapist registered successfully'},
                status=201
            )

        print("❌ Serializer Errors:", serializer.errors)  # Debugging errors
        return Response(serializer.errors, status=400)


class TherapistLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        email = request.data.get('therapist_email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Both email and password are required'}, status=400)

        try:
            therapist = Therapist.objects.get(email=email)
            if not check_password(password, therapist.password):  # ✅ Hash check
                raise Therapist.DoesNotExist
        except Therapist.DoesNotExist:
            time.sleep(random.uniform(0.1, 0.3))  # ✅ Prevent timing attacks
            return Response({'error': 'Invalid credentials'}, status=401)

        # ✅ Define Expiry Times
        access_token_expiry = now() + timedelta(minutes=30)
        refresh_token_expiry = now() + timedelta(days=1)

        # ✅ Manually Generate JWT Tokens
        access_token_payload = {
            "therapist_id": therapist.id,
            "email": therapist.email,
            "exp": access_token_expiry.timestamp(),  # ✅ Convert to UNIX timestamp
            "type": "access",
        }
        access_token = jwt.encode(access_token_payload, settings.SECRET_KEY, algorithm="HS256")

        refresh_token_payload = {
            "therapist_id": therapist.id,
            "email": therapist.email,
            "exp": refresh_token_expiry.timestamp(),
            "type": "refresh",
        }
        refresh_token = jwt.encode(refresh_token_payload, settings.SECRET_KEY, algorithm="HS256")
        user_type = "Therapist"

        return Response({
            "access_token": str(access_token),
            "refresh_token": str(refresh_token),
            "expires_at": access_token_expiry.isoformat(),  # ✅ Include readable expiry
            "therapist_id": therapist.id,
            "email": therapist.email,
            "name": therapist.name,
            "redirect_url": "/",
            "user_type": user_type
        }, status=200)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        print("📩 Received Data:", request.data)  # ✅ Print incoming request data
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            print("✅ Registration Successful!")
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

        print("❌ Serializer Errors:", serializer.errors)  # ✅ Print validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Both email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

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


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        try:
            user = User.objects.get(email=email)
            print(f"Email: {user}")
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        otp = random.randint(100000, 999999)
        cache.set(email, otp, timeout=300)  # Store OTP in cache for 5 minutes

        send_mail(
            subject="Password Reset OTP",
            message=f"Your OTP for password reset is {otp}. It will expire in 5 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False
        )

        return Response({'message': 'OTP sent to email'}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        cached_otp = cache.get(email)

        if not cached_otp or str(cached_otp) != str(otp):
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            user.password = make_password(new_password)
            user.save()

            cache.delete(email)  # Remove OTP after successful reset
            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)


class TherapistMembers(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
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
                    "desc": therapist.desc,
                }
                for therapist in therapists
            ]

            return Response({"therapists": therapist_list}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        user = request.user
        therapist_id = request.data.get("therapist_id")
        session_type = request.data.get("session_type")
        assign_date = request.data.get("assign_date")
        assign_time = request.data.get("assign_time")
        note = request.data.get("note", "")

        if not therapist_id or not session_type or not assign_date or not assign_time:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            therapist = Therapist.objects.get(id=therapist_id)
        except Therapist.DoesNotExist:
            return Response({"error": "Therapist Not Found"}, status=status.HTTP_404_NOT_FOUND)

        booking = BookingModel.objects.create(
            user=user,
            therapist=therapist,
            session_type=session_type,
            assign_date=assign_date,
            assign_time=assign_time,
            note=note
        )

        return Response(
            {"message": "Booking successful", "booking_id": booking.id},
            status=status.HTTP_201_CREATED
        )


class ChatbotView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.model_name = "llama3.2"
        self.temperature = 0

        self.llm = ChatOllama(model=self.model_name, temperature=self.temperature)

        self.vector_db = vector_db

        # self.memory = ConversationBufferMemory()

        self.rag_chain = self.setup_rag_chain()

    def setup_rag_chain(self):
        retriever = self.vector_db.as_retriever()

        prompt = PromptTemplate(
            input_variables=["context", "input"],
            template="You are a helpful AI assistant. Based on the following retrieved documents:\n{context}\n\nAnswer the user's question:\n{question}"
        )

        document_chain = create_stuff_documents_chain(self.llm, prompt)

        retrieval_chain = create_retrieval_chain(retriever, document_chain)

        return retrieval_chain

    def conversation(self, request):

        query = request.data.get('query', '')

        if query.lower() == "exit":
            return Response({"Message": "Conversation endend"})

        response = self.rag_chain.invoke({"question": query})

        return Response({"response": response["output"]})

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

