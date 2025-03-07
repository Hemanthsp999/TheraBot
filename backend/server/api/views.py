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
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from datetime import timedelta
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import get_user_model
# from api.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail
import random
from django.core.cache import cache
from rest_framework_simplejwt.authentication import JWTAuthentication
import time
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
        fields = ['username', 'phone_number', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


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
            if not check_password(password, user.password):
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

        return Response({
            'refresh': str(refresh),
            'access_token': str(refresh.access_token),
            'redirect_url': '/',
            'expires_at': access_token_expiry,
            "name": str(user.username)
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

