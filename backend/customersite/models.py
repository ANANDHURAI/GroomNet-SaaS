from django.db import models
from authservice.models import User
from adminsite.models import ServiceModel , Coupon
from barbersite.models import BarberSlot
from profileservice.models import Address
from django.conf import settings


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

    TRAVEL_STATUS_CHOICES = [
        ("NOT_STARTED", "Not Started"),
        ("STARTED", "Started"),
        ("ON_THE_WAY", "On the Way"),
        ("ALMOST_NEAR", "Almost Near"),
        ("ARRIVED", "Arrived"),
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
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    
    travel_status = models.CharField(max_length=20,choices=TRAVEL_STATUS_CHOICES,default="NOT_STARTED")
    address = models.ForeignKey(Address, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=BOOKING_STATUS, default="PENDING")
    booking_type = models.CharField(max_length=20 , choices=BOOKING_TYPE_CHOICES , default="INSTANT_BOOKING")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_payment_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    service_started_at = models.DateTimeField(null=True, blank=True)

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
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
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
        return self.final_amount

class CustomerWallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user_wallet")
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    account_total_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name}'s Wallet - Balance: ₹{self.account_total_balance}"


class Complaints(models.Model):
    COMPLAINT_STATUS = [
        ("PENDING", "Pending"),                   
        ("UNDER_REVIEW", "Under Review"),          
        ("ACTION_TAKEN", "Action Taken"),           
        ("RESOLVED", "Resolved"),                  
        ("REJECTED", "Rejected"),                  
        ("CLOSED", "Closed by Admin")   
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='complaints'
    )
    complaint_name = models.CharField(max_length=255)
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='complaint', unique=True ,null=True, blank=True )
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='complaints/', blank=True, null=True)
    complaint_status = models.CharField(
        max_length=20,
        choices=COMPLAINT_STATUS,
        default="PENDING"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.complaint_name} ({self.user.name}) - {self.complaint_status}"

class Rating(models.Model):
    RATING_CHOICES = [(i, i) for i in range(1, 6)]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    booking = models.ForeignKey(
        'Booking',
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    barber = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='barber_ratings',
        limit_choices_to={'user_type': 'barber'},
        null=True,
        blank=True
    )
    comment = models.TextField(blank=True)
    image = models.ImageField(upload_to='rating_images/', null=True, blank=True)
    rating = models.PositiveIntegerField(choices=RATING_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'booking')

    def save(self, *args, **kwargs):
        if self.booking and not self.barber:
            self.barber = self.booking.barber
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.name} → {self.barber.name if self.barber else 'No Barber'} → Booking #{self.booking.id} ({self.rating})"

