from django.db import models
from authservice.models import User


class BarberRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    REGISTRATION_STEPS = (
        ('personal_details', 'Personal Details'),
        ('otp_verified', 'OTP Verified'),
        ('documents_uploaded', 'Documents Uploaded'),
        ('under_review', 'Under Review'),
        ('completed', 'Completed'),
    )

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='barber_request')
    licence = models.FileField(
        upload_to='documents/licences/', null=True, blank=True)
    certificate = models.FileField(
        upload_to='documents/certificates/', null=True, blank=True)
    profile_image = models.ImageField(
        upload_to='barber_profiles/', null=True, blank=True)

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
    registration_step = models.CharField(
        max_length=20, choices=REGISTRATION_STEPS, default='personal_details')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    admin_comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.email} - {self.status}"

    @property
    def is_approved(self):
        return self.status == 'approved'

    @property
    def is_documents_complete(self):
        return bool(self.licence and self.certificate and self.profile_image)

    def mark_documents_uploaded(self):
        if self.is_documents_complete:
            self.registration_step = 'documents_uploaded'
            self.status = 'pending'
            self.save()

    def reset_for_resubmission(self):

        if self.status == 'rejected':
            self.status = 'pending'
            self.registration_step = 'documents_uploaded'
            self.admin_comment = ''
            self.save()


class OTPVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP for {self.user.email}"
