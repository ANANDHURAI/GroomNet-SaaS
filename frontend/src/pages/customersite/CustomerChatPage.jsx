import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';

function CustomerChatPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const websocketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeChat();
    return cleanup;
  }, [bookingId]);

  const initializeChat = async () => {
    try {
      await Promise.all([
        fetchChatData(),
        connectWebSocket(),
        markAsRead()
      ]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setLoading(false);
    }
  };

  const fetchChatData = async () => {
    try {
      const [messagesRes, bookingRes] = await Promise.all([
        apiClient.get(`/chat-service/chat/${bookingId}/messages/`),
        apiClient.get(`/chat-service/chat/${bookingId}/info/`)
      ]);

      setMessages(messagesRes.data.messages || []);
      setBookingInfo(bookingRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat data:', error);
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = sessionStorage.getItem('access_token');
    const wsUrl = `${protocol}//localhost:8000/ws/chat/${bookingId}/?token=${token}`;

    if (websocketRef.current) {
      websocketRef.current.close();
    }

    websocketRef.current = new WebSocket(wsUrl);
    websocketRef.current.onopen = () => console.log('WebSocket connected');
    websocketRef.current.onmessage = handleWebSocketMessage;
    websocketRef.current.onclose = handleWebSocketClose;
    websocketRef.current.onerror = (error) => console.error('WebSocket error:', error);
  };

  const handleWebSocketMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          handleNewMessage(data.data);
          break;
        case 'user_status':
          setIsOnline(data.is_online);
          break;
        case 'typing':
          handleTypingIndicator(data.is_typing);
          break;
        case 'mark_as_read':
          window.dispatchEvent(new CustomEvent('unreadCountUpdate', {
            detail: { bookingId, count: 0 }
          }));
          break;
        case 'total_unread_update':
          window.dispatchEvent(new CustomEvent('totalUnreadUpdate', {
            detail: { 
              totalCount: data.total_count, 
              bookingCounts: data.booking_counts 
            }
          }));
          break;
        case 'unread_count_update':
          window.dispatchEvent(new CustomEvent('unreadCountUpdate', {
            detail: { bookingId: data.booking_id, count: data.unread_count }
          }));
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  const handleNewMessage = (messageData) => {
    setMessages(prev => {
      const filteredPrev = prev.filter(msg => 
        !(msg.id && msg.id.toString().startsWith('temp_') && msg.message === messageData.message)
      );
      
      const exists = filteredPrev.some(msg => msg.id === messageData.id);
      if (exists) return filteredPrev;
      
      return [...filteredPrev, messageData];
    });
  };

  const handleTypingIndicator = (isTyping) => {
    setIsTyping(isTyping);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const handleWebSocketClose = (event) => {
    console.log('WebSocket disconnected:', event.code);
    
    if (event.code !== 1000) {
      setTimeout(connectWebSocket, 3000);
    }
  };

  const markAsRead = async () => {
    try {
      await apiClient.post(`/chat-service/chat/${bookingId}/mark-as-read/`);
      window.dispatchEvent(new CustomEvent('unreadCountUpdate', {
        detail: { bookingId, count: 0 }
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleInputChange = (value) => {
    setNewMessage(value);
    
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      try {
        websocketRef.current.send(JSON.stringify({
          type: 'typing',
          is_typing: value.length > 0
        }));
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setSending(true);
    const tempMessage = createTempMessage(messageText);
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    try {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ 
          type: 'message',
          message: messageText 
        }));
      } else {
 
        const response = await apiClient.post(`/chat-service/chat/${bookingId}/messages/`, {
          message: messageText
        });
        
        setMessages(prev => 
          prev.map(msg => msg.id === tempMessage.id ? response.data : msg)
        );
      }
    } catch (error) {
      console.error('Send error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageText);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const createTempMessage = (messageText) => ({
    id: `temp_${Date.now()}`,
    message: messageText,
    sender: {
      id: bookingInfo?.current_user_id,
      name: 'You',
      email: ''
    },
    timestamp: new Date().toISOString(),
    is_read: false
  });

  const cleanup = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  const renderMessage = (message, index) => {
    const isCurrentUser = message.sender.id === bookingInfo?.current_user_id;
    const showDate = index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
    const isTemporary = message.id && message.id.toString().startsWith('temp_');

    return (
      <div key={message.id}>
        {showDate && (
          <div className="text-center text-gray-500 text-sm py-2">
            {formatDate(message.timestamp)}
          </div>
        )}
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-opacity ${
            isCurrentUser 
              ? `bg-blue-600 text-white ${isTemporary ? 'opacity-70' : ''}` 
              : 'bg-white text-gray-800 border'
          }`}>
            {!isCurrentUser && (
              <p className="text-xs text-gray-500 mb-1">{message.sender.name}</p>
            )}
            <p className="text-sm break-words">{message.message}</p>
            <div className="flex items-center justify-between mt-1">
              <p className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatTime(message.timestamp)}
              </p>
              {isTemporary && (
                <div className="text-xs text-blue-200 ml-2">Sending...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white hover:text-blue-200 mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Booking
        </button>

        {bookingInfo && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {bookingInfo.other_user.profile_image ? (
                <img
                  src={bookingInfo.other_user.profile_image}
                  alt={bookingInfo.other_user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{bookingInfo.other_user.name}</h2>
              <p className="text-sm text-blue-100">
                {bookingInfo.service_name} • {bookingInfo.booking_date} at {bookingInfo.booking_time}
              </p>
              <div className="flex items-center text-xs text-blue-100 mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${
                  isOnline ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg max-w-xs">
              <div className="flex space-x-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{bookingInfo?.other_user.name} is typing...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomerChatPage;