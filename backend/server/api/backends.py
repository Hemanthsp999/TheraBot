from django.contrib.auth.backends import BaseBackend
from api.models import Therapist


class TherapistBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            therapist = Therapist.objects.get(email=email)
            if therapist.check_password(password):
                return therapist
        except Therapist.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return Therapist.objects.get(pk=user_id)
        except Therapist.DoesNotExist:
            return None

