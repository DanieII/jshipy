import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response
from stripe import SignatureVerificationError

from subscriptions.permissions import IsSubscribed
from subscriptions.serializers import SubscriptionSerializer

from .models import Subscription

stripe.api_key = settings.STRIPE_SECRET_KEY

UserModel = get_user_model()


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        price_id = request.data.get("price_id")

        try:
            session = stripe.checkout.Session.create(
                mode="subscription",
                line_items=[
                    {
                        "price": price_id,
                        "quantity": 1,
                    }
                ],
                customer_email=user.email,
                success_url=f"{settings.BASE_URL}/dashboard",
                cancel_url=f"{settings.BASE_URL}/",
                automatic_tax={"enabled": True},
                allow_promotion_codes=True,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        return Response({"url": session.url}, status=201)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, SignatureVerificationError):
        return HttpResponseBadRequest()

    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        customer_email = session.get("customer_email")
        stripe_customer_id = session.get("customer")
        stripe_subscription_id = session.get("subscription")

        user = UserModel.objects.filter(email=customer_email).first()
        if not user:
            return HttpResponse(status=400)

        Subscription.objects.update_or_create(
            user=user,
            defaults={
                "stripe_customer_id": stripe_customer_id,
                "stripe_subscription_id": stripe_subscription_id,
            },
        )

    elif (
        event_type == "customer.subscription.deleted"
        or event_type == "invoice.payment_failed"
    ):
        subscription = event["data"]["object"]
        subscription_id = subscription.get("id")

        Subscription.objects.filter(stripe_subscription_id=subscription_id).delete()

    return HttpResponse(status=200)


class SubscriptionView(RetrieveAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsSubscribed]

    def get_object(self):
        user = self.request.user

        return user.subscription
