from rest_framework import generics, permissions
from subscriptions.permissions import IsSubscribed

from accounts.serializers import UserProfileSerializer


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsSubscribed]

    def get_object(self):
        return self.request.user.profile
