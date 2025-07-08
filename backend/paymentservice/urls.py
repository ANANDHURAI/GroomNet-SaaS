from django.urls import path
from .views import CreateStripeCheckoutSession, VerifyPayment, CreateWalletStripeCheckoutSession,VerifyPaymentAndAddToWallet

urlpatterns = [
    path('create-checkout-session/', CreateStripeCheckoutSession.as_view(), name='create_checkout_session'),
    path('verify-payment/', VerifyPayment.as_view()),
    path('wallet/stripe-checkout/', CreateWalletStripeCheckoutSession.as_view(), name="wallet_stripe_checkout"),
    path('wallet/verify-payment/', VerifyPaymentAndAddToWallet.as_view(), name="verify_wallet_payment"),
]
