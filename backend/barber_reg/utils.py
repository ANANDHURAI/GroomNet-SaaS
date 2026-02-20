import random
from django.core.cache import cache

OTP_EXPIRY = 300         
OTP_RESEND_COOLDOWN = 60  


def generate_otp():
    return str(random.randint(100000, 999999))


def store_otp(email, otp):
    cache.set(f"otp:{email}", otp, OTP_EXPIRY)
    cache.set(f"otp_cooldown:{email}", True, OTP_RESEND_COOLDOWN)


def verify_otp(email, otp):
    stored_otp = cache.get(f"otp:{email}")
    return stored_otp == otp


def clear_otp(email):
    cache.delete(f"otp:{email}")


def can_resend_otp(email):
    return cache.get(f"otp_cooldown:{email}") is None