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

'''
from django.db import models


class User(models.Model):
    # user_id = models.AutoField(primary_key=True)  # ✅ Custom primary key with auto-increment
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=10, unique=True, null=True, blank=True)

    def __str__(self) -> str:
        return self.username

'''

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# ✅ Custom User Manager


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)

# ✅ Custom User Model


class User(AbstractBaseUser, PermissionsMixin):  # Inherit from AbstractBaseUser
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=10, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()  # ✅ Attach custom user manager

    USERNAME_FIELD = 'email'  # ✅ Use email as the unique login field
    REQUIRED_FIELDS = ['username']  # ✅ Required fields when creating superuser

    def __str__(self) -> str:
        return self.email


class Therapist(models.Model):
    # therapist_id = models.AutoField(primary_key=True)  # ✅ Custom primary key with auto-increment
    name = models.CharField(max_length=100)
    Type = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=10, unique=True, blank=True)

    def __str__(self):
        return self.name

