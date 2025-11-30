from django.contrib.auth import get_user_model
from django.db import models

UserModel = get_user_model()


class Subscription(models.Model):
    user = models.OneToOneField(
        UserModel, on_delete=models.CASCADE, related_name="subscription"
    )
    stripe_customer_id = models.CharField(max_length=255, unique=True)
    stripe_subscription_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
