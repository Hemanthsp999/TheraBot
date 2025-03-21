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
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # ✅ Hash password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=100, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    gender = models.CharField(max_length=30, choices=[
        ("male", "Male"),
        ("female", "Female")
    ], default="N/A")
    age = models.PositiveIntegerField(default=0)
    phone_number = models.CharField(max_length=10, unique=True,
                                    null=True, blank=True)  # ✅ Fix missing field
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="user_groups",  # ✅ Fix conflict
        blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="user_permissions",  # ✅ Fix conflict
        blank=True
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone_number', 'gender', 'age']

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.email


class TherapistManager(BaseUserManager):
    def create_therapist(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        therapist = self.model(email=email, name=name, **extra_fields)
        therapist.set_password(password)  # ✅ Hash password
        therapist.save(using=self._db)
        return therapist


class Therapist(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    experience = models.PositiveIntegerField()
    desc = models.CharField(max_length=500, null=False, blank=False,
                            default="No description provided")
    availability = models.CharField(max_length=500, null=False, blank=False, default="N/A")
    phone_number = models.CharField(max_length=10, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="therapist_groups",  # ✅ Fix conflict
        blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="therapist_permissions",  # ✅ Fix conflict
        blank=True
    )

    objects = TherapistManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'specialization', 'experience', 'desc', 'phone_number']

    class Meta:
        db_table = 'therapist'

    def __str__(self):
        return self.email


class BookingModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    therapist_id = models.ForeignKey(Therapist, on_delete=models.CASCADE)
    note = models.TextField(blank=True, null=True)
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

