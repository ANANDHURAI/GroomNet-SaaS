from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path , include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authservice.urls')),
    path('auth/social/', include('allauth.socialaccount.urls')),
    path('adminsite/', include('adminsite.urls')),
    path('profile-service/', include('profileservice.urls')),
    path('barber-reg/', include('barber_reg.urls')),
    path('barbersite/', include('barbersite.urls')),
    path('customersite/', include('customersite.urls')),
    path('chat-service/', include('chat.urls')),
    path('payment-service/', include('paymentservice.urls')),
    path('instant-booking/', include('instantbooking.urls')),
    path('report-download-service/', include('reports.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
