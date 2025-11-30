from django.urls import include, path

from accounts.views import UserProfileDetailView

urlpatterns = [
    path("", include("allauth.urls")),
    path("_allauth/", include("allauth.headless.urls")),
    path("profile/", UserProfileDetailView.as_view(), name="user-profile"),
]
