from django.db import models
from django.utils import timezone
from django.conf import settings


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
        

class Coupon(models.Model):
    code = models.CharField(max_length=20, unique=True)
    expiry_date = models.DateTimeField()
    service = models.ForeignKey(ServiceModel, on_delete=models.CASCADE, related_name='coupons')
    discount_percentage = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.code} for {self.service.name}"

    def is_valid(self):
        return timezone.now() < self.expiry_date

    def get_discounted_price(self, original_price):
        if self.discount_percentage:
            return original_price - (original_price * self.discount_percentage / 100)
        return original_price

    

# class Complaints(models.Model):

#     COMPLAINT_STATUS = [
#         ("REESOLVED" , "resolved"),
#         ("UNDER_REVIEW","under_review"),
#         ("PENDING","pending")
#     ]
#     complaint_name = models.TextField()
#     image = models.ImageField()
#     complaint_status = models.CharField(max_length=20 , choices=COMPLAINT_STATUS , default="PENDING")






class AdminWallet(models.Model):
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Admin Wallet - ₹{self.total_earnings}"
    
