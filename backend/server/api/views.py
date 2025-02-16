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
# Load model directly
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model = AutoModelForCausalLM.from_pretrained("victunes/TherapyBeagle-11B-v2", device_map="auto",
                                             offload_folder="offload_dir"  # Set a folder to store offloaded weights
                                             )
tokenizer = AutoTokenizer.from_pretrained("victunes/TherapyBeagle-11B-v2")


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
            return Response({'error': 'Both username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        print(f'Login: {email, check_password(password, user.password)}')

        if not check_password(password, user.password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        access_token_expiry = now() + timedelta(minutes=30)

        return Response({'refresh': str(refresh), 'access_token': str(refresh.access_token),
                         'redirect_url': '/', 'expires_at': access_token_expiry}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response({'error:' 'Refresh token is required'}, status=400)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logged out successfully"}, status=200)

        except Exception as e:
            return Response({"error": f"Invalid token {e}"}, status=400)


class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.data.get('query')

        if not query:
            return Response('Query Required', status=400)

        input_ids = tokenizer(query, return_tensors='pt').input_ids

        with torch.no_grad():
            output = model.generate(input_ids, max_length=200, do_sample=True, top_p=0.9)

        # Decode the generated response
        response_text = tokenizer.decode(output[0], skip_special_tokens=True)

        return Response({"response": response_text})
