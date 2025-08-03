
from django.urls import path
from .views import ChatMessagesView, get_unread_count, get_booking_info , get_total_unread_count

urlpatterns = [
    path('chat/<int:booking_id>/messages/', ChatMessagesView.as_view(), name='chat-messages'),
    path('chat/<int:booking_id>/unread-count/', get_unread_count, name='unread-count'),
    path('chat/<int:booking_id>/info/', get_booking_info, name='booking-info'),
    path('chat/total-unread/', get_total_unread_count, name='total-unread-count'),
]