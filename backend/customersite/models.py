from django.db import models
from authservice.models import User
from adminsite.models import ServiceModel
from barbersite.models import BarberSlot
from profileservice.models import Address


class Booking(models.Model):
    BOOKING_TYPE_CHOICES = [
        ("INSTANT_BOOKING" , "instant_booking"),
        ("SCHEDULE_BOOKING","schedule_booking")
    ]
    BOOKING_STATUS = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
        ("COMPLETED", "Completed")
    ]
    customer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="customer_bookings", 
        limit_choices_to={'user_type': 'customer'}
    )
    barber = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="barber_bookings", 
        limit_choices_to={'user_type': 'barber'},
        null=True, blank=True
    )
    service = models.ForeignKey(ServiceModel, on_delete=models.CASCADE)
    slot = models.ForeignKey(BarberSlot, on_delete=models.CASCADE, null=True, blank=True)

    address = models.ForeignKey(Address, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=BOOKING_STATUS, default="PENDING")
    booking_type = models.CharField(max_length=20 , choices=BOOKING_TYPE_CHOICES , default="INSTANT_BOOKING")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_payment_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        barber_name = self.barber.name if self.barber else "No Barber Assigned"
        return f"{self.customer.name} - {self.service.name} - {barber_name}"

class PaymentModel(models.Model):
    PAYMENT_METHODS = [
        ("STRIPE", "stripe"), 
        ("COD" , "cod"),
        ('WALLET','wallet')
    ]
    
    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'), 
        ('FAILED', 'Failed'),
    ]
    
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default="stripe")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    service_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_released_to_barber = models.BooleanField(default=False)
    released_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for {self.booking} - {self.payment_status}"

    @property
    def total_amount(self):
        return self.service_amount + self.platform_fee


