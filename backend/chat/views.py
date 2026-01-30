from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from customersite.models import Booking
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from rest_framework.views import APIView
from django.db.models import Q

class ChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)

        if booking.customer != request.user and booking.barber != request.user:
            return Response(
                {'error': 'You do not have access to this chat'},
                status=status.HTTP_403_FORBIDDEN
            )

        messages = ChatMessage.objects.filter(
            booking=booking
        ).select_related('sender').order_by('timestamp')

        ChatMessage.objects.filter(
            booking=booking,
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)

        serializer = ChatMessageSerializer(messages, many=True, context={'request': request})

       
        if booking.slot:  
            booking_date = booking.slot.date
            booking_time = booking.slot.start_time
        else:  
            booking_date = booking.created_at.date()
            booking_time = booking.created_at.time()

        if request.user == booking.customer:
            other_user = booking.barber
        else:
            other_user = booking.customer

        booking_info = {
            'id': booking.id,
            'service_name': booking.service.name,
            'status': booking.status,
            'current_user_id': request.user.id,
            'booking_date': booking_date,
            'booking_time': booking_time,
            'other_user': {
                'id': other_user.id,
                'name': other_user.name,
                'profile_image': other_user.profile_image.url if hasattr(other_user, 'profile_image') and other_user.profile_image else None
            }
        }

        return Response({
            'messages': serializer.data,
            'booking_info': booking_info
        })
    
    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)

        if booking.customer != request.user and booking.barber != request.user:
            return Response(
                {'error': 'You do not have access to this chat'},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.status in ['COMPLETED', 'CANCELLED']:
            return Response(
                {'error': 'Cannot send messages to completed or cancelled bookings'},
                status=status.HTTP_400_BAD_REQUEST
            )

        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response(
                {'error': 'Message cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        message = ChatMessage.objects.create(
            booking=booking,
            sender=request.user,
            message=message_text
        )

        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        channel_layer = get_channel_layer()
        other_user = booking.barber if request.user == booking.customer else booking.customer
        
        async_to_sync(channel_layer.group_send)(
            f'notifications_{other_user.id}',
            {
                'type': 'notification_update',
                'update_type': 'message_received',
                'booking_id': str(booking_id)
            }
        )

        serializer = ChatMessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
  


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_total_unread_count(request):
    customer_messages = ChatMessage.objects.filter(
        booking__customer=request.user,
        booking__status__in=["PENDING", "CONFIRMED"],
        is_read=False
    ).exclude(sender=request.user)

    barber_messages = ChatMessage.objects.filter(
        booking__barber=request.user,
        booking__status__in=["PENDING", "CONFIRMED"],
        is_read=False
    ).exclude(sender=request.user)

    all_messages = customer_messages.union(barber_messages)

    total_unread = all_messages.count()

    booking_unread_counts = {}
    for message in all_messages:
        bid = str(message.booking_id)
        booking_unread_counts[bid] = booking_unread_counts.get(bid, 0) + 1

    return Response({
        'total_unread_count': total_unread,
        'booking_unread_counts': booking_unread_counts
    })
 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)

    if booking.status == "COMPLETED":
        return Response({'unread_count': 0})

    if booking.customer != request.user and booking.barber != request.user:
        return Response(
            {'error': 'You do not have access to this chat'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    unread_count = ChatMessage.objects.filter(
        booking=booking,
        is_read=False
    ).exclude(sender=request.user).count()

    return Response({'unread_count': unread_count})



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking_info(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)

    if booking.slot: 
        booking_date = booking.slot.date
        booking_time = booking.slot.start_time
    else:
        booking_date = booking.created_at.date()  
        booking_time = booking.created_at.time()  
        
    if request.user == booking.customer:
        other_user = booking.barber
    else:
        other_user = booking.customer

    booking_info = {
        'id': booking.id,
        'service_name': booking.service.name,
        'status': booking.status,
        'current_user_id': request.user.id,
        'booking_date': booking_date,
        'booking_time': booking_time,
        'other_user': {
            'id': other_user.id,
            'name': other_user.name,
            'profile_image': other_user.profile_image.url if hasattr(other_user, 'profile_image') and other_user.profile_image else None
        }
    }

    return Response(booking_info)