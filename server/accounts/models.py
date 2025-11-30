from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
)
from django.db import models


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, save=True):
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)
        user = self.model(email=email)
        user.set_password(password)

        if save:
            user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None):
        user = self.create_user(email, password, save=False)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user


class CustomUser(AbstractBaseUser):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return True


class UserProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="profile"
    )
