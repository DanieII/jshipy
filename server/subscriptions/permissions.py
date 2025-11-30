from django.db.models import ObjectDoesNotExist
from rest_framework.permissions import BasePermission


class IsSubscribed(BasePermission):
    def has_permission(self, request, view):
        try:
            user = request.user
            subscription = user.subscription

            return subscription is not None
        except ObjectDoesNotExist:
            return False
