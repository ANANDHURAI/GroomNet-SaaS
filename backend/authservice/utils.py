import ssl
import certifi
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings


ssl._create_default_https_context = lambda: ssl.create_default_context(cafile=certifi.where())

def send_otp(email, otp):
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=email,
        subject="Your OTP for Password Reset",
        plain_text_content=f"Your OTP is {otp}. Valid for 5 minutes."
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        return True
    except Exception as e:
        print(f"Error sending OTP: {e}")
        return False
