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


from django.db import models
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, role="user", **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", role)

        # Remove therapist-specific fields for users
        if role == "user":
            extra_fields.pop("specialization", None)
            extra_fields.pop("experience", None)
            extra_fields.pop("desc", None)
            extra_fields.pop("availability", None)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("user", "User"),
        ("therapist", "Therapist"),
        ("admin", "Admin"),
    ]

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")

    # Common fields
    name = models.CharField(max_length=250, null=False, blank=False)
    phone_number = models.CharField(max_length=10, unique=True, null=False, blank=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Fields for "user" only
    gender = models.CharField(max_length=30, choices=[(
        "male", "Male"), ("female", "Female")], null=False, blank=False)
    age = models.PositiveIntegerField(null=False, blank=False, default=0)

    # Fields for "therapist" only (now allow `null=True`)
    specialization = models.CharField(max_length=255, null=False, blank=False, default="N/A")
    experience = models.PositiveIntegerField(null=False, blank=False, default=0)
    desc = models.CharField(max_length=500, null=False, blank=False,
                            default="No description provided")
    availability = models.CharField(max_length=500, null=True, blank=True, default="N/A")

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["role", "name"]

    class Meta:
        db_table = "users"

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return f"{self.email} ({self.role})"


class BookingModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    therapist = models.ForeignKey(User, on_delete=models.CASCADE,
                                  related_name="appointments", limit_choices_to={'role': 'therapist'})
    note = models.TextField(blank=False, null=False, default="Not mentioned")
    session_type = models.CharField(max_length=255, choices=[
        ("video", "Video Call"),
        ("audio", "Audio Call"),
        ("chat", "Chat Session"),
    ])
    assign_date = models.DateField()
    assign_time = models.TimeField()
    is_valid = models.CharField(max_length=10, default="false", null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking: {self.user.email} -> {self.therapist.name} on {self.assigned_date} at {self.assigned_time}"

