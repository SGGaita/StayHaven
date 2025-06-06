'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Message as MessageIcon,
  Support as SupportIcon,
  Home as HomeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
export const dynamic = 'force-dynamic'

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/auth/signin');
      return;
    }

    fetchConversations();
  }, [user, router]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // For now, we'll create mock conversations since the messages system isn't fully implemented
      const mockConversations = [
        {
          id: '1',
          type: 'HOST',
          participant: {
            id: 'host1',
            name: 'Sarah Johnson',
            avatar: null,
            role: 'PROPERTY_MANAGER',
          },
          property: {
            id: 'prop1',
            name: 'Sunset Villa',
          },
          lastMessage: {
            content: 'Thank you for booking! Looking forward to hosting you.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            isRead: true,
          },
          unreadCount: 0,
        },
        {
          id: '2',
          type: 'SUPPORT',
          participant: {
            id: 'support1',
            name: 'StayHaven Support',
            avatar: null,
            role: 'ADMIN',
          },
          lastMessage: {
            content: 'We\'ve received your inquiry about payment issues. Our team will get back to you within 24 hours.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            isRead: false,
          },
          unreadCount: 1,
        },
        {
          id: '3',
          type: 'HOST',
          participant: {
            id: 'host2',
            name: 'Michael Chen',
            avatar: null,
            role: 'PROPERTY_MANAGER',
          },
          property: {
            id: 'prop2',
            name: 'Mountain View Cabin',
          },
          lastMessage: {
            content: 'The check-in instructions have been sent to your email.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            isRead: true,
          },
          unreadCount: 0,
        },
      ];

      setConversations(mockConversations);
      
      // Auto-select conversation if propertyId is provided
      const propertyId = searchParams.get('propertyId');
      if (propertyId) {
        const conversation = mockConversations.find(c => c.property?.id === propertyId);
        if (conversation) {
          setSelectedConversation(conversation);
          fetchMessages(conversation.id);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // Mock messages for the selected conversation
      const mockMessages = [
        {
          id: '1',
          content: 'Hi! I have a question about the check-in process.',
          senderId: user.id,
          senderName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          isFromUser: true,
        },
        {
          id: '2',
          content: 'Hello! I\'d be happy to help you with that. Check-in is available from 3 PM onwards. You\'ll receive detailed instructions via email 24 hours before your arrival.',
          senderId: 'host1',
          senderName: 'Sarah Johnson',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          isFromUser: false,
        },
        {
          id: '3',
          content: 'Perfect! Thank you for the quick response. Looking forward to our stay!',
          senderId: user.id,
          senderName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isFromUser: true,
        },
        {
          id: '4',
          content: 'Thank you for booking! Looking forward to hosting you.',
          senderId: 'host1',
          senderName: 'Sarah Johnson',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isFromUser: false,
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      
      // Create new message object
      const message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        timestamp: new Date(),
        isFromUser: true,
      };

      // Add message to the list
      setMessages(prev => [...prev, message]);
      
      // Update conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { 
                ...conv, 
                lastMessage: {
                  content: message.content,
                  timestamp: message.timestamp,
                  isRead: true,
                }
              }
            : conv
        )
      );

      setNewMessage('');
      
      // TODO: Send message to API
      // await fetch('/api/messages', { ... });
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    
    // Mark as read
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.property?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
        </Box>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Messages 💬
          </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Connect with hosts and support for your bookings
          </Typography>

        <Paper 
          elevation={0}
          sx={{ 
            height: '70vh',
            display: 'flex',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          {/* Conversations List */}
          <Box 
            sx={{ 
              width: 350,
              borderRight: '1px solid',
              borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            }}
          >
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>

            {/* Conversations */}
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {filteredConversations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MessageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No conversations found
                  </Typography>
                </Box>
              ) : (
                filteredConversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                    button
                    selected={selectedConversation?.id === conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                  sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <ListItemAvatar>
                      <Avatar sx={{ bgcolor: conversation.type === 'SUPPORT' ? 'info.main' : 'primary.main' }}>
                        {conversation.type === 'SUPPORT' ? (
                          <SupportIcon />
                        ) : conversation.participant.avatar ? (
                          <img src={conversation.participant.avatar} alt={conversation.participant.name} />
                        ) : (
                          conversation.participant.name[0]
                        )}
                      </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {conversation.participant.name}
                      </Typography>
                          {conversation.unreadCount > 0 && (
                            <Chip 
                              label={conversation.unreadCount} 
                              size="small" 
                              color="primary"
                              sx={{ minWidth: 20, height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                    }
                    secondary={
                      <Box>
                          {conversation.property && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              <HomeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                              {conversation.property.name}
                            </Typography>
                          )}
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                              WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                              mt: 0.5,
                          }}
                        >
                            {conversation.lastMessage.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {formatMessageTime(conversation.lastMessage.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                ))
              )}
            </List>
          </Box>

          {/* Messages Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Header */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid', 
                    borderColor: 'divider',
                    backgroundColor: 'background.default',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: selectedConversation.type === 'SUPPORT' ? 'info.main' : 'primary.main' }}>
                      {selectedConversation.type === 'SUPPORT' ? (
                        <SupportIcon />
                      ) : (
                        selectedConversation.participant.name[0]
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="medium">
                        {selectedConversation.participant.name}
                      </Typography>
                      {selectedConversation.property && (
                        <Typography variant="body2" color="text.secondary">
                          <HomeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {selectedConversation.property.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  <Stack spacing={2}>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                          justifyContent: message.isFromUser ? 'flex-end' : 'flex-start',
                      }}
                    >
                        <Paper
                          elevation={0}
                        sx={{
                            p: 2,
                          maxWidth: '70%',
                            backgroundColor: message.isFromUser 
                            ? theme.palette.primary.main
                              : theme.palette.grey[100],
                            color: message.isFromUser 
                              ? theme.palette.primary.contrastText 
                              : theme.palette.text.primary,
                            borderRadius: 2,
                            border: message.isFromUser ? 'none' : '1px solid',
                            borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2">
                          {message.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{
                            display: 'block',
                            mt: 1,
                              opacity: 0.7,
                          }}
                        >
                            {formatMessageTime(message.timestamp)}
                        </Typography>
                        </Paper>
                    </Box>
                  ))}
                  </Stack>
                </Box>

                {/* Message Input */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderTop: '1px solid', 
                    borderColor: 'divider',
                    backgroundColor: 'background.default',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={3}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sending}
                    />
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '&:disabled': {
                          bgcolor: 'grey.300',
                        },
                      }}
                    >
                      {sending ? <CircularProgress size={20} /> : <SendIcon />}
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box 
                sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                  textAlign: 'center',
                  p: 4,
                }}
              >
                <MessageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a conversation from the list to start messaging
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </DashboardLayout>
  );
} 