from django.contrib.auth import get_user_model
from api.models import BookingModel, UserTherapistChatModel, PatientHealthInfo
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
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


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTherapistChatModel
        fields = '__all__'


class PatientHealthSerializer(serializers.Serializer):
    class Meta:
        model = PatientHealthInfo
        fields = '__all__'

