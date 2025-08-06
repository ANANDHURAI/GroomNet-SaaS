import csv
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum, Avg, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from authservice.models import User
from adminsite.models import ServiceModel, AdminWallet
from barbersite.models import  BarberWallet
from customersite.models import (
    Booking, PaymentModel, CustomerWallet
)
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_bookings_report(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="bookings_report.pdf"'

    p = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, height - 40, "Bookings Report")

    data = [[
        'Booking ID', 'Customer Name', 'Customer Email', 'Barber Name', 'Service Name',
        'Booking Type', 'Status', 'Travel Status', 'Total Amount', 'Payment Done',
        'Created Date', 'Completed Date', 'Service Started', 'Has Coupon'
    ]]
    
    bookings = Booking.objects.select_related(
        'customer', 'barber', 'service', 'coupon'
    ).order_by('created_at')
    
    for booking in bookings:
        data.append([
            str(booking.id),
            booking.customer.name if booking.customer else 'N/A',
            booking.customer.email if booking.customer else 'N/A',
            booking.barber.name if booking.barber else 'Not Assigned',
            booking.service.name if booking.service else 'N/A',
            booking.get_booking_type_display(),
            booking.get_status_display(),
            booking.get_travel_status_display(),
            f"{float(booking.total_amount):.2f}",
            'Yes' if booking.is_payment_done else 'No',
            booking.created_at.strftime('%Y-%m-%d %H:%M'),
            booking.completed_at.strftime('%Y-%m-%d %H:%M') if booking.completed_at else 'N/A',
            booking.service_started_at.strftime('%Y-%m-%d %H:%M') if booking.service_started_at else 'N/A',
            'Yes' if booking.coupon else 'No'
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
    ]))

    table.wrapOn(p, width, height)
    table.drawOn(p, 30, height - 80 - 15 * len(data))

    p.showPage()
    p.save()

    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_revenue_report(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="revenue_report.pdf"'

    p = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, height - 40, "Revenue Report (Last 30 Days)")

    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)

    daily_revenue = Booking.objects.filter(
        created_at__date__range=[start_date, end_date]
    ).extra(
        select={'day': 'date(customersite_booking.created_at)'}
    ).values('day').annotate(
        total_bookings=Count('id'),
        completed_bookings=Count('id', filter=Q(status='COMPLETED')),
        total_revenue=Sum('total_amount', filter=Q(status='COMPLETED')),
        avg_booking_value=Avg('total_amount', filter=Q(status='COMPLETED')),
        total_platform_fees=Sum('payment__platform_fee', filter=Q(status='COMPLETED')),
        stripe_payments=Count('payment', filter=Q(payment__payment_method='STRIPE')),
        cod_payments=Count('payment', filter=Q(payment__payment_method='COD')),
        wallet_payments=Count('payment', filter=Q(payment__payment_method='WALLET'))
    ).order_by('day')

    data = [[
        'Date', 'Total Bookings', 'Completed', 'Revenue',
        'Platform Fee', 'Barber Earnings', 'Avg Value',
        'Stripe', 'COD', 'Wallet'
    ]]

    for day_data in daily_revenue:
        total_revenue = float(day_data['total_revenue'] or 0)
        platform_fee = float(day_data['total_platform_fees'] or 0)
        barber_earnings = total_revenue - platform_fee

        data.append([
            str(day_data['day']),
            day_data['total_bookings'],
            day_data['completed_bookings'],
            f"{total_revenue:.2f}",
            f"{platform_fee:.2f}",
            f"{barber_earnings:.2f}",
            f"{(day_data['avg_booking_value'] or 0):.2f}",
            day_data['stripe_payments'],
            day_data['cod_payments'],
            day_data['wallet_payments']
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
    ]))

    table.wrapOn(p, width, height)
    table.drawOn(p, 30, height - 80 - 20 * len(data)) 

    p.showPage()
    p.save()

    return response



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_users_report(request):
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="users_report.pdf"'

    p = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, height - 40, "Users Report")

    data = [[
        'User ID', 'Name', 'Email', 'Phone', 'User Type', 'Gender',
        'Registration Date', 'Is Active', 'Is Blocked', 'Is Verified',
        'Total Bookings', 'Profile Image', 'Last Updated'
    ]]
    
    users = User.objects.annotate(
        total_customer_bookings=Count('customer_bookings'),
        total_barber_bookings=Count('barber_bookings')
    ).order_by('created_at')
    
    for user in users:
        total_bookings = user.total_customer_bookings + user.total_barber_bookings
        
        data.append([
            str(user.id),
            user.name,
            user.email,
            user.phone or 'N/A',
            user.get_user_type_display(),
            user.get_gender_display() if user.gender else 'N/A',
            user.created_at.strftime('%Y-%m-%d'),
            'Yes' if user.is_active else 'No',
            'Yes' if user.is_blocked else 'No',
            'Yes' if user.is_verified else 'No',
            str(total_bookings),
            'Yes' if user.profileimage else 'No',
            user.updated_at.strftime('%Y-%m-%d %H:%M')
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
    ]))

    table.wrapOn(p, width, height)
    table.drawOn(p, 30, height - 80 - 15 * len(data))

    p.showPage()
    p.save()

    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_services_report(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="services_report.pdf"'

    p = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, height - 40, "Services Report")

    data = [[
        'Service ID', 'Service Name', 'Category', 'Total Bookings',
        'Total Revenue (₹)', 'Active Barbers'
    ]]

    services = ServiceModel.objects.annotate(
        total_bookings=Count('booking'),
        completed_bookings=Count('booking', filter=Q(booking__status='completed')),
        total_revenue=Sum('booking__payment__final_amount'),
        active_barbers=Count('barber_services', filter=Q(barber_services__is_active=True))
    ).select_related('category').order_by('total_bookings')

    for service in services:
        data.append([
            str(service.id),
            service.name,
            service.category.name if service.category else '',
            str(service.total_bookings or 0),
            str(service.completed_bookings or 0),
            f"{service.total_revenue or 0:.2f}",
            str(service.active_barbers or 0),
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
    ]))

    table.wrapOn(p, width, height)
    table.drawOn(p, 30, height - 80 - 20 * len(data))

    p.showPage()
    p.save()

    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_barber_performance_report(request):
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="barber_performance_report.pdf"'

    p = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, height - 40, "Barber Performance Report")

    data = [[
        'Barber ID', 'Barber Name', 'Email', 'Phone', 'Expert At', 'Experience Years',
        'Current Location', 'Travel Radius', 'Is Available', 'Total Bookings',
        'Completed Bookings', 'Cancelled Bookings', 'Total Earnings', 'Wallet Balance',
        'Average Rating', 'Total Reviews', 'Active Services', 'Registration Date'
    ]]
    
    barbers = User.objects.filter(user_type='barber').annotate(
        total_bookings=Count('barber_bookings'),
        completed_bookings=Count('barber_bookings', filter=Q(barber_bookings__status='COMPLETED')),
        cancelled_bookings=Count('barber_bookings', filter=Q(barber_bookings__status='CANCELLED')),
        total_earnings=Sum('barber_bookings__total_amount', filter=Q(barber_bookings__status='COMPLETED')),
        avg_rating=Avg('barber_ratings__rating'),
        total_reviews=Count('barber_ratings'),
        active_services=Count('barber_services', filter=Q(barber_services__is_active=True))
    ).select_related('portfolio').prefetch_related('barberwallet')
    
    for barber in barbers:
        portfolio = getattr(barber, 'portfolio', None)
        wallet = getattr(barber, 'barberwallet', None)
        
        data.append([
            str(barber.id),
            barber.name,
            barber.email,
            barber.phone or 'N/A',
            portfolio.expert_at if portfolio else 'N/A',
            str(portfolio.experience_years) if portfolio else 'N/A',
            portfolio.current_location if portfolio else 'N/A',
            str(portfolio.travel_radius_km) if portfolio else 'N/A',
            'Yes' if portfolio and portfolio.is_available else 'No',
            str(barber.total_bookings or 0),
            str(barber.completed_bookings or 0),
            str(barber.cancelled_bookings or 0),
            f"{float(barber.total_earnings or 0):.2f}",
            f"{float(wallet.balance if wallet else 0):.2f}",
            f"{round(float(barber.avg_rating or 0), 2)}",
            str(barber.total_reviews or 0),
            str(barber.active_services or 0),
            barber.created_at.strftime('%Y-%m-%d')
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
    ]))

    table.wrapOn(p, width, height)
    table.drawOn(p, 30, height - 80 - 15 * len(data))

    p.showPage()
    p.save()

    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_customer_analysis_report(request):
   
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="customer_analysis_report.pdf"'

    p = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, height - 40, "Customer Analysis Report")

    data = [[
        'Customer ID', 'Customer Name', 'Email', 'Phone', 'Gender',
        'Total Bookings', 'Completed Bookings', 'Cancelled Bookings',
        'Total Spent', 'Wallet Balance', 'Favorite Service', 'Favorite Barber',
        'Last Booking Date', 'Total Ratings Given', 'Average Rating Given',
        'Total Complaints', 'Registration Date'
    ]]
    
    customers = User.objects.filter(user_type='customer').annotate(
        total_bookings=Count('customer_bookings'),
        completed_bookings=Count('customer_bookings', filter=Q(customer_bookings__status='COMPLETED')),
        cancelled_bookings=Count('customer_bookings', filter=Q(customer_bookings__status='CANCELLED')),
        total_spent=Sum('customer_bookings__total_amount', filter=Q(customer_bookings__status='COMPLETED')),
        total_ratings=Count('ratings'),
        avg_rating_given=Avg('ratings__rating'),
        total_complaints=Count('complaints')
    ).prefetch_related('user_wallet')
    
    for customer in customers:
        favorite_service = customer.customer_bookings.values('service__name').annotate(
            count=Count('service')
        ).order_by('-count').first()
        
        favorite_barber = customer.customer_bookings.values('barber__name').annotate(
            count=Count('barber')
        ).order_by('-count').first()
        
        last_booking = customer.customer_bookings.order_by('-created_at').first()
        
        wallet = getattr(customer, 'user_wallet', None)
        
        data.append([
            str(customer.id),
            customer.name,
            customer.email,
            customer.phone or 'N/A',
            customer.get_gender_display() if customer.gender else 'N/A',
            str(customer.total_bookings or 0),
            str(customer.completed_bookings or 0),
            str(customer.cancelled_bookings or 0),
            f"{float(customer.total_spent or 0):.2f}",
            f"{float(wallet.account_total_balance if wallet else 0):.2f}",
            favorite_service['service__name'] if favorite_service else 'N/A',
            favorite_barber['barber__name'] if favorite_barber else 'N/A',
            last_booking.created_at.strftime('%Y-%m-%d') if last_booking else 'N/A',
            str(customer.total_ratings or 0),
            f"{round(float(customer.avg_rating_given or 0), 2)}",
            str(customer.total_complaints or 0),
            customer.created_at.strftime('%Y-%m-%d')
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
    ]))

    table.wrapOn(p, width, height)
    table.drawOn(p, 30, height - 80 - 15 * len(data))

    p.showPage()
    p.save()

    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_financial_summary_report(request):
   
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="financial_summary_report.pdf"'

    p = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, height - 40, "Financial Summary Report")

    data = [[
        'Metric', 'Value', 'Description'
    ]]
    
    total_bookings = Booking.objects.count()
    completed_bookings = Booking.objects.filter(status='COMPLETED').count()
    total_revenue = Booking.objects.filter(status='COMPLETED').aggregate(
        Sum('total_amount'))['total_amount__sum'] or 0
    
    total_platform_fees = PaymentModel.objects.filter(
        booking__status='COMPLETED').aggregate(
        Sum('platform_fee'))['platform_fee__sum'] or 0
    
    admin_wallet = AdminWallet.objects.first()
    admin_balance = admin_wallet.total_earnings if admin_wallet else 0
    
    total_customer_wallet = CustomerWallet.objects.aggregate(
        Sum('account_total_balance'))['account_total_balance__sum'] or 0
    
    total_barber_wallet = BarberWallet.objects.aggregate(
        Sum('balance'))['balance__sum'] or 0
    
    payment_methods = PaymentModel.objects.values('payment_method').annotate(
        count=Count('id')).order_by('count')
    
    metrics = [
        ('Total Bookings', str(total_bookings), 'Total number of bookings created'),
        ('Completed Bookings', str(completed_bookings), 'Successfully completed bookings'),
        ('Total Revenue', f"{float(total_revenue):.2f}", 'Total amount from completed bookings'),
        ('Platform Fees Collected', f"{float(total_platform_fees):.2f}", 'Total platform commission'),
        ('Admin Wallet Balance', f"{float(admin_balance):.2f}", 'Current admin wallet balance'),
        ('Customer Wallet Total', f"{float(total_customer_wallet):.2f}", 'Total balance in all customer wallets'),
        ('Barber Wallet Total', f"{float(total_barber_wallet):.2f}", 'Total balance in all barber wallets'),
        ('Completion Rate %', f"{round((completed_bookings/total_bookings*100) if total_bookings > 0 else 0, 2)}", 'Percentage of completed bookings'),
    ]
    
    for metric, value, description in metrics:
        data.append([metric, value, description])
    
    data.append(['', '', ''])
    data.append(['Payment Method Distribution', '', ''])
    for pm in payment_methods:
        data.append([pm['payment_method'], str(pm['count']), f"Number of {pm['payment_method']} payments"])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
    ]))

    table.wrapOn(p, width, height)
    table.drawOn(p, 30, height - 80 - 20 * len(data))

    p.showPage()
    p.save()

    return response