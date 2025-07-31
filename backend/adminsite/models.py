from django.db import models
from django.utils import timezone
from django.conf import settings
from authservice.models import User
from decimal import Decimal


class CategoryModel(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='categories/')
    is_blocked = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class ServiceModel(models.Model):
    category = models.ForeignKey(CategoryModel, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=7, decimal_places=2)
    duration_minutes = models.PositiveIntegerField()
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    is_blocked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} → {self.category.name}"
    


class CouponUsage(models.Model):
    """Track coupon usage per customer"""
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    coupon = models.ForeignKey('Coupon', on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['customer', 'coupon']

class Coupon(models.Model):
    code = models.CharField(max_length=20, unique=True)
    expiry_date = models.DateTimeField()
    service = models.ForeignKey(ServiceModel, on_delete=models.CASCADE, related_name='coupons')
    discount_percentage = models.PositiveIntegerField(null=True, blank=True)
    max_usage_per_customer = models.PositiveIntegerField(default=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} for {self.service.name}"

    def is_valid(self):
        return timezone.now() < self.expiry_date and self.is_active

    def can_user_use_coupon(self, user):
        """Check if user can still use this coupon"""
        usage_count = CouponUsage.objects.filter(customer=user, coupon=self).count()
        return usage_count < self.max_usage_per_customer

    def get_discount_amount(self, total_amount):
        """Calculate discount amount from total"""
        if self.discount_percentage:
            discount = (total_amount * Decimal(str(self.discount_percentage)) / Decimal('100'))
            return discount.quantize(Decimal('0.01'))
        return Decimal('0.00')



class AdminWallet(models.Model):
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Admin Wallet - ₹{self.total_earnings}"
    

class AdminWalletTransaction(models.Model):
    wallet = models.ForeignKey(AdminWallet, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_credit(self):
        return self.amount >= 0

    def __str__(self):
        direction = "+" if self.amount >= 0 else "-"
        return f"{direction}₹{abs(self.amount)} on {self.created_at.strftime('%Y-%m-%d')} - {self.note or 'No note'}"
