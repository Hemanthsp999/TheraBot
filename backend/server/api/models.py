from django.db import models


class User(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=10, unique=True, null=True, blank=True)

    def __str__(self) -> str:
        return self.username
