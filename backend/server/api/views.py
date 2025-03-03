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

from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings
import jwt

import time
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.cache import cache
import random
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models import User
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
from django.utils.timezone import now
from datetime import timedelta
from langchain_ollama import ChatOllama
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
# from langchain.memory import ConversationBufferMemory
from langchain.chains import create_retrieval_chain
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain.chains.combine_documents import create_stuff_documents_chain

transformer_model_name = "sentence-transformers/all-miniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name=transformer_model_name)

# Load FAISS directory
folder_path = "/home/hexa/ai_bhrtya/backend/mental_health_faiss_index/"
vector_db = FAISS.load_local(folder_path=folder_path,
                             embeddings=embedding_model, allow_dangerous_deserialization=True)


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
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
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
            'expires_at': access_token_expiry
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            refresh_token = request.data.get('refreshToken')
            if not refresh_token:
                return Response({'error:' 'Refresh token is required'}, status=400)
            print(f"refresh token{ refresh_token}")

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logged out successfully"}, status=200)

        except Exception as e:
            return Response({"error": f"Invalid token {e}"}, status=400)


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        try:
            user = User.objects.get(email=email)
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
    # authentication_classes = [JWTAuthentication]
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
            input_variables=["context", "question"],
            template="You are a helpful AI assistant. Based on the following retrieved documents:\n{context}\n\nAnswer the user's question:\n{question}"
        )

        document_chain = create_stuff_documents_chain(self.llm, prompt)

        retrieval_chain = create_retrieval_chain(retriever, document_chain)

        return retrieval_chain

    def conversation(self, request):

        query = request.data.get('query', '')

        if query.lower() == "exit":
            return Response({"Message": "Conversation endend"})

        response = self.rag_chain.invoke({"input": query})

        return Response({"response": response["output"]})

    def post(self, request):
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(' ')[1]
            print(f"Received token: {token}")

            try:
                decoded = jwt.decode(token, key=settings.SECRET_KEY, algorithms=["HS256"])
                print(f"Decoded token payload: {decoded}")
                user_id = decoded.get('user_id')
                print(f"Extracted user ID: {user_id}")

                try:
                    user = User.objects.get(pk=user_id)
                    print(f"Found user: {user}")
                except User.DoesNotExist:
                    print(f"User with ID {user_id} not found!")
                    return Response({"error": "User not found"}, status=status.HTTP_401_UNAUTHORIZED)
            except jwt.ExpiredSignatureError:
                print("Token has expired")
                return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
            except jwt.InvalidTokenError:
                print("Invalid token")
                return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        return self.conversation(request)


'''
        auth_header = request.headers.get("Authorization")
        print("Authorization Header Recieved: ", auth_header)

        auth = JWTAuthentication()
        try:
            user, token = auth.authenticate(request)
            if user is None:
                return Response({"error": "Invalid or missing token"}, status=status.HTTP_401_UnAUTHORIZED)

            print(f"Authenticated {user}")
        except Exception as e:
            print("Token Authentication failed", str(e))
            return Response({"error": f"Token authentication error: {str(e)}"}, status=status.HTTP_401_UNAUTHORIZED)
        '''

