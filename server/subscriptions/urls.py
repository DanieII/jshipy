from django.urls import path

from .views import CreateCheckoutSessionView, SubscriptionView, stripe_webhook

urlpatterns = [
    path("checkout/", CreateCheckoutSessionView.as_view(), name="checkout"),
    path("stripe/webhook/", stripe_webhook, name="stripe-webhook"),
    path("subscription/", SubscriptionView.as_view(), name="subscription"),
]
