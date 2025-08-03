from django.urls import path
from . import views

urlpatterns = [

    path('reports/bookings/', views.download_bookings_report, name='download_bookings_report'),
    path('reports/revenue/', views.download_revenue_report, name='download_revenue_report'),
    path('reports/users/', views.download_users_report, name='download_users_report'),
    path('reports/services/', views.download_services_report, name='download_services_report'),
    
    path('reports/barber-performance/', views.download_barber_performance_report, name='download_barber_performance_report'),
    path('reports/customer-analysis/', views.download_customer_analysis_report, name='download_customer_analysis_report'),
    path('reports/financial-summary/', views.download_financial_summary_report, name='download_financial_summary_report'),
]