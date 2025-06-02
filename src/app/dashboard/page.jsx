'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Badge,
  Divider,
  Container,
  Stack,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  BookOnline as BookingIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';

const StatCard = ({ title, value, icon, color, trend, onClick, description }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: theme.palette.background.paper,
        border: '1px solid',
        borderColor: alpha('#FF385C', 0.1),
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: '#FF385C',
          opacity: 0.8,
        },
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha('#FF385C', 0.15)}`,
          borderColor: alpha('#FF385C', 0.3),
          '& .stat-icon': {
            transform: 'scale(1.05)',
          },
          '& .stat-value': {
            color: '#FF385C',
          },
          '& .view-more': {
            opacity: 1,
            transform: 'translateX(0)',
          },
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ height: '100%', p: 3, position: 'relative' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{ 
                  mb: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h4" 
                component="div" 
                className="stat-value"
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  transition: 'all 0.3s ease-in-out',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {value}
              </Typography>
              {description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.7rem',
                    opacity: 0.8,
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                className="stat-icon"
                sx={{ 
                  width: 48,
                  height: 48,
                  background: alpha('#FF385C', 0.1),
                  color: '#FF385C',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `2px solid ${alpha('#FF385C', 0.1)}`,
                }}
              >
                {icon}
              </Avatar>
              {trend && (
                <Chip
                  size="small"
                  icon={<TrendingUpIcon fontSize="small" />}
                  label={trend}
                  color="success"
                  sx={{ 
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    background: theme.palette.success.main,
                    color: 'white',
                    border: `2px solid ${theme.palette.background.paper}`,
                    '& .MuiChip-label': {
                      px: 0.5,
                    },
                  }}
                />
              )}
            </Box>
          </Box>
          
          {onClick && (
            <Box 
              className="view-more"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: 0.7,
                transform: 'translateX(-10px)',
                transition: 'all 0.3s ease-in-out',
                mt: 'auto !important',
              }}
            >
              <Typography 
                variant="button" 
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#FF385C',
                  textTransform: 'none',
                }}
              >
                View Details
              </Typography>
              <ArrowForwardIcon 
                fontSize="small" 
                sx={{ 
                  color: '#FF385C',
                  transition: 'transform 0.2s ease-in-out',
                }}
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const BookingStatus = {
  PENDING: { color: 'warning', label: 'Pending', icon: '⏳' },
  CONFIRMED: { color: 'success', label: 'Confirmed', icon: '✅' },
  CANCELLED: { color: 'error', label: 'Cancelled', icon: '❌' },
  REJECTED: { color: 'error', label: 'Rejected', icon: '❌' },
  COMPLETED: { color: 'info', label: 'Completed', icon: '🏁' },
  DEFAULT: { color: 'default', label: 'Unknown', icon: '❓' },
};

// Helper function to get booking status with fallback
const getBookingStatus = (status) => {
  return BookingStatus[status] || BookingStatus.DEFAULT;
};

const RoleBasedStats = {
  SUPER_ADMIN: [
    { 
      title: 'Total Users', 
      icon: <PersonIcon fontSize="large" />, 
      color: 'primary', 
      path: '/dashboard/users',
      description: 'Platform members'
    },
    { 
      title: 'Properties', 
      icon: <ApartmentIcon fontSize="large" />, 
      color: 'info', 
      path: '/dashboard/properties',
      description: 'Listed properties'
    },
    { 
      title: 'Total Revenue', 
      icon: <MoneyIcon fontSize="large" />, 
      color: 'success', 
      path: '/dashboard/revenue',
      description: 'This month'
    },
    { 
      title: 'Avg. Rating', 
      icon: <StarIcon fontSize="large" />, 
      color: 'warning', 
      path: '/dashboard/reviews',
      description: 'Platform rating'
    },
  ],
  PROPERTY_MANAGER: [
    { 
      title: 'My Properties', 
      icon: <ApartmentIcon fontSize="large" />, 
      color: 'primary', 
      path: '/dashboard/properties',
      description: 'Active listings'
    },
    { 
      title: 'Active Bookings', 
      icon: <BookingIcon fontSize="large" />, 
      color: 'success', 
      path: '/dashboard/bookings',
      description: 'Current reservations'
    },
    { 
      title: 'Monthly Revenue', 
      icon: <MoneyIcon fontSize="large" />, 
      color: 'info', 
      path: '/dashboard/revenue',
      description: 'This month'
    },
    { 
      title: 'Avg. Rating', 
      icon: <StarIcon fontSize="large" />, 
      color: 'warning', 
      path: '/dashboard/reviews',
      description: 'Property ratings'
    },
  ],
  CUSTOMER: [
    { 
      title: 'Active Bookings', 
      icon: <BookingIcon fontSize="large" />, 
      color: 'primary', 
      path: '/dashboard/bookings',
      description: 'Current & upcoming'
    },
    { 
      title: 'Total Spent', 
      icon: <MoneyIcon fontSize="large" />, 
      color: 'success', 
      path: '/dashboard/spending',
      description: 'All time'
    },
    { 
      title: 'Saved Properties', 
      icon: <ViewIcon fontSize="large" />, 
      color: 'info', 
      path: '/dashboard/favorites',
      description: 'Wishlist items'
    },
    { 
      title: 'Stay Reviews', 
      icon: <StarIcon fontSize="large" />, 
      color: 'warning', 
      path: '/dashboard/reviews',
      description: 'Your reviews'
    },
  ],
};

export default function Dashboard() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    savedProperties: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [error, setError] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/auth/signin');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        let statsData = defaultStats;
        let bookingsData = [];
        let statsError = null;
        let bookingsError = null;

        // Fetch stats
        try {
          const statsResponse = await fetch('/api/dashboard/stats', {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          const statsResponseData = await statsResponse.json();

          if (!statsResponse.ok) {
            throw new Error(statsResponseData.error || 'Failed to fetch dashboard statistics');
          }

          // If we received an error response with default stats, use them but show the error
          if (statsResponseData.error && statsResponseData.stats) {
            statsData = statsResponseData.stats;
            statsError = statsResponseData.error;
          } else {
            statsData = statsResponseData;
          }
        } catch (statsErr) {
          console.error('Error fetching stats:', statsErr);
          statsError = statsErr.message || 'An error occurred while fetching statistics';
        }

        // Set stats regardless of subsequent requests
        setStats(statsData);
        
        // Fetch recent bookings
        try {
          const bookingsResponse = await fetch('/api/dashboard/recent-bookings', {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          const bookingsResponseData = await bookingsResponse.json();

          if (!bookingsResponse.ok) {
            throw new Error(bookingsResponseData.error || 'Failed to fetch recent bookings');
          }

          bookingsData = bookingsResponseData;
          setRecentBookings(bookingsData);
        } catch (bookingsErr) {
          console.error('Error fetching bookings:', bookingsErr);
          bookingsError = bookingsErr.message || 'An error occurred while fetching recent bookings';
        }

        // Fetch favorites count for customers
        if (user?.role === 'CUSTOMER') {
          try {
            const favoritesResponse = await fetch('/api/dashboard/favorites', {
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });

            if (favoritesResponse.ok) {
              const favoritesData = await favoritesResponse.json();
              const favoritesCount = Array.isArray(favoritesData) ? favoritesData.length : 0;
              
              // Update stats with actual favorites count
              setStats(prevStats => ({
                ...statsData,
                savedProperties: favoritesCount
              }));
            }
          } catch (favoritesErr) {
            console.error('Error fetching favorites:', favoritesErr);
            // Keep the stats as they are if favorites fetch fails
          }
        }

        // Set overall error message if either request failed
        if (statsError || bookingsError) {
          let errorMessage = '';
          if (statsError) errorMessage += statsError;
          if (bookingsError) {
            if (errorMessage) errorMessage += ' | ';
            errorMessage += bookingsError;
          }
          setError(errorMessage);
        } else {
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, user]);

  const defaultStats = {
    totalProperties: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    savedProperties: 0
  };

  if (!user || !user.id) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          gap: 2,
        }}>
          <CircularProgress size={48} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const roleStats = RoleBasedStats[user?.role || 'CUSTOMER'];

  const getStatValue = (title) => {
    switch (title) {
      case 'My Properties':
      case 'Total Properties':
        return stats.totalProperties;
      case 'Active Bookings':
      case 'Active Bookings':
        return stats.activeBookings;
      case 'Monthly Revenue':
      case 'Total Revenue':
      case 'Total Spent':
        return `$${stats.monthlyRevenue.toLocaleString()}`;
      case 'Properties Viewed':
      case 'Saved Properties':
        return stats.savedProperties || 0;
      case 'Reviews Given':
      case 'Stay Reviews':
        return Math.floor(stats.activeBookings * 0.8); // Simulated data
      case 'Total Users':
        return stats.totalProperties * 3; // Simulated data
      case 'Avg. Rating':
        return stats.averageRating.toFixed(1);
      default:
        return '0';
    }
  };

  const getRoleWelcome = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return { 
          title: `Welcome back, ${user?.firstName}! 👋`, 
          subtitle: "Here's your platform overview and key metrics for today." 
        };
      case 'PROPERTY_MANAGER':
        return { 
          title: `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user?.firstName}! 🏠`, 
          subtitle: "Here's what's happening with your properties today." 
        };
      case 'CUSTOMER':
        return { 
          title: `Welcome back, ${user?.firstName}! ✈️`, 
          subtitle: "Ready for your next getaway? Manage your bookings and discover amazing places to stay." 
        };
      default:
        return { 
          title: `Welcome back, ${user?.firstName}!`, 
          subtitle: "Here's your dashboard overview." 
        };
    }
  };

  const welcomeMessage = getRoleWelcome();

  const handlePayment = (booking) => {
    setSelectedBooking(booking);
    setPaymentDialogOpen(true);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleViewBooking = (bookingId) => {
    router.push(`/dashboard/bookings/${bookingId}`);
  };

  const handleMessageHost = (booking) => {
    // TODO: Navigate to messages with host
    router.push(`/dashboard/messages?propertyId=${booking.propertyId}`);
  };

  const processPayment = async () => {
    if (!selectedBooking) return;

    // Validate M-Pesa phone number
    if (paymentMethod === 'mpesa') {
      const phoneRegex = /^254[17]\d{8}$/;
      if (!mpesaPhoneNumber || !phoneRegex.test(mpesaPhoneNumber)) {
        alert('Please enter a valid M-Pesa phone number (format: 254XXXXXXXXX)');
        return;
      }
    }

    try {
      setProcessing(true);
      const response = await fetch(`/api/dashboard/bookings/${selectedBooking.id}/payment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod,
          amount: selectedBooking.price,
          phoneNumber: paymentMethod === 'mpesa' ? mpesaPhoneNumber : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const result = await response.json();
      
      if (paymentMethod === 'mpesa' && result.checkoutRequestId) {
        alert('STK Push sent to your phone. Please check your phone and enter your M-Pesa PIN to complete the payment.');
        
        // Poll for payment status
        pollPaymentStatus(result.checkoutRequestId, selectedBooking.id);
      } else {
        // Update the booking in the list for other payment methods
        setRecentBookings(prev => 
          prev.map(booking => 
            booking.id === selectedBooking.id 
              ? { ...booking, status: 'CONFIRMED' }
              : booking
          )
        );

        setPaymentDialogOpen(false);
        setSelectedBooking(null);
        setPaymentMethod('mpesa');
        setMpesaPhoneNumber('');
        
        // Show success message
        alert('Payment processed successfully!');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId, bookingId) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (10 seconds * 30)
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/mpesa/status`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkoutRequestId,
            bookingId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const result = await response.json();
        
        if (result.status === 'COMPLETED') {
          // Payment successful
          setRecentBookings(prev => 
            prev.map(booking => 
              booking.id === selectedBooking.id 
                ? { ...booking, status: 'CONFIRMED' }
                : booking
            )
          );

          setPaymentDialogOpen(false);
          setSelectedBooking(null);
          setPaymentMethod('mpesa');
          setMpesaPhoneNumber('');
          setProcessing(false);
          
          alert('Payment completed successfully! Your booking is now confirmed.');
        } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
          // Payment failed or cancelled
          setProcessing(false);
          alert('Payment was cancelled or failed. Please try again.');
        } else if (result.status === 'PENDING' && attempts < maxAttempts) {
          // Continue polling
          attempts++;
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          // Timeout
          setProcessing(false);
          alert('Payment timeout. Please check your M-Pesa messages or try again.');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setProcessing(false);
        alert('Error checking payment status. Please contact support if payment was deducted.');
      }
    };
    
    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  };

  const processCancellation = async () => {
    if (!selectedBooking || !cancellationReason.trim()) return;

    try {
      setProcessing(true);
      const response = await fetch(`/api/dashboard/bookings/${selectedBooking.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: cancellationReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Cancellation failed');
      }

      const result = await response.json();
      
      // Update the booking in the list
      setRecentBookings(prev => 
        prev.map(booking => 
          booking.id === selectedBooking.id 
            ? { ...booking, status: 'CANCELLED' }
            : booking
        )
      );

      setCancelDialogOpen(false);
      setSelectedBooking(null);
      setCancellationReason('');
      
      // Show success message
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Cancellation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getBookingActions = (booking) => {
    const actions = [];
    
    switch (booking.status) {
      case 'PENDING':
        actions.push('pay', 'cancel', 'view');
        break;
      case 'CONFIRMED':
        actions.push('cancel', 'view', 'message');
        break;
      case 'COMPLETED':
        actions.push('view', 'message');
        break;
      case 'CANCELLED':
      case 'REJECTED':
        actions.push('view');
        break;
      default:
        actions.push('view');
    }
    
    return actions;
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Hero Section */}
        <Box sx={{ 
          mb: 6,
          p: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha('#FF385C', 0.05)} 0%, ${alpha('#FF385C', 0.02)} 100%)`,
          border: `1px solid ${alpha('#FF385C', 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 50%, ${alpha('#FF385C', 0.08)} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${alpha('#FF385C', 0.06)} 0%, transparent 50%)`,
            pointerEvents: 'none',
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: '#FF385C',
                mb: 2,
              }}
            >
              {welcomeMessage.title}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                fontWeight: 400,
                maxWidth: '600px',
                lineHeight: 1.6,
              }}
            >
              {welcomeMessage.subtitle}
            </Typography>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {roleStats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <StatCard
                title={stat.title}
                value={getStatValue(stat.title)}
                icon={stat.icon}
                color={stat.color}
                description={stat.description}
                trend={index === 0 ? '+12.5%' : null}
                onClick={() => router.push(stat.path)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Customer Features Section */}
        {user?.role === 'CUSTOMER' && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4,
              borderRadius: 4,
              background: theme.palette.background.paper,
              border: `1px solid ${alpha('#FF385C', 0.1)}`,
              mb: 4,
            }}
          >
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                mb: 3,
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              🎯 Quick Actions
            </Typography>
            
            <Grid container spacing={3}>
              {/* Search & Discovery */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    border: `1px solid ${alpha('#FF385C', 0.1)}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 32px ${alpha('#FF385C', 0.15)}`,
                      borderColor: alpha('#FF385C', 0.3),
                    },
                  }}
                  onClick={() => router.push('/properties')}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: '2rem', mb: 2 }}>🔍</Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Explore Properties
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Discover amazing places to stay with advanced filters
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Manage Bookings */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    border: `1px solid ${alpha('#FF385C', 0.1)}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 32px ${alpha('#FF385C', 0.15)}`,
                      borderColor: alpha('#FF385C', 0.3),
                    },
                  }}
                  onClick={() => router.push('/dashboard/bookings')}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: '2rem', mb: 2 }}>📅</Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      My Bookings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage reservations, payments, and cancellations
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Favorites */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    border: `1px solid ${alpha('#FF385C', 0.1)}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 32px ${alpha('#FF385C', 0.15)}`,
                      borderColor: alpha('#FF385C', 0.3),
                    },
                  }}
                  onClick={() => router.push('/dashboard/favorites')}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: '2rem', mb: 2 }}>❤️</Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Saved Properties
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your wishlist and favorite places
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Messages */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    border: `1px solid ${alpha('#FF385C', 0.1)}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 32px ${alpha('#FF385C', 0.15)}`,
                      borderColor: alpha('#FF385C', 0.3),
                    },
                  }}
                  onClick={() => router.push('/dashboard/messages')}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: '2rem', mb: 2 }}>💬</Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Messages
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chat with hosts and support
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Stay Insights */}
            <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha('#FF385C', 0.1)}` }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                🌟 Stay Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#FF385C' }}>
                      {stats.activeBookings || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Bookings
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#FF385C' }}>
                      ${stats.monthlyRevenue?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Spent
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#FF385C' }}>
                      {stats.averageRating?.toFixed(1) || '0.0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Stay Rating
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}

        {/* Recent Activity Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4,
            background: theme.palette.background.paper,
            border: `1px solid ${alpha('#FF385C', 0.1)}`,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 4, 
            background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
            borderBottom: `1px solid ${alpha('#FF385C', 0.1)}`,
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Recent {user?.role === 'CUSTOMER' ? 'Bookings' : 'Activity'} 📊
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role === 'CUSTOMER' 
                    ? 'Your latest reservation updates and booking details'
                    : 'Latest bookings and property activity'
                  }
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/dashboard/bookings')}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  background: '#FF385C',
                  boxShadow: `0 4px 16px ${alpha('#FF385C', 0.3)}`,
                  '&:hover': {
                    background: '#E61E4D',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha('#FF385C', 0.4)}`,
                  },
                }}
              >
                View All
              </Button>
            </Stack>
          </Box>
          
          {/* Content */}
          <Box sx={{ p: 4 }}>
            {recentBookings.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
                borderRadius: 3,
                border: `2px dashed ${alpha('#FF385C', 0.2)}`,
              }}>
                <Box sx={{ mb: 2, fontSize: '3rem' }}>
                  {user?.role === 'CUSTOMER' ? '🎒' : '📈'}
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No recent activity
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {user?.role === 'CUSTOMER' 
                    ? 'Start exploring properties to see your booking history here'
                    : 'New bookings and activity will appear here'
                  }
                </Typography>
                {user?.role === 'CUSTOMER' && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/properties')}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      background: '#FF385C',
                      boxShadow: `0 4px 16px ${alpha('#FF385C', 0.3)}`,
                      '&:hover': {
                        background: '#E61E4D',
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha('#FF385C', 0.4)}`,
                      },
                    }}
                  >
                    Explore Properties
                  </Button>
                )}
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {recentBookings.map((booking, index) => (
                  <ListItem
                    key={booking.id}
                    sx={{
                      px: 3,
                      py: 3,
                      borderRadius: 3,
                      mb: 2,
                      background: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                        backgroundColor: theme.palette.background.paper,
                      },
                      '&:last-child': {
                        mb: 0,
                      },
                    }}
                    onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={getBookingStatus(booking.status).icon}
                        sx={{
                          '& .MuiBadge-badge': {
                            right: -2,
                            top: -2,
                            fontSize: '0.75rem',
                            minWidth: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        <Avatar 
                          src={booking.property.photos?.[0]} 
                          alt={booking.property.name}
                          variant="rounded"
                          sx={{ 
                            width: 64, 
                            height: 64,
                            borderRadius: 2,
                            border: `2px solid ${alpha('#FF385C', 0.1)}`,
                          }}
                        >
                          <ApartmentIcon fontSize="large" />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                          {booking.property.name}
                        </Typography>
                      }
                      secondary={
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(booking.startDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })} - {new Date(booking.endDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Box>
                          {user?.role !== 'CUSTOMER' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {booking.customer.firstName} {booking.customer.lastName}
                              </Typography>
                            </Box>
                          )}
                          {user?.role === 'CUSTOMER' && booking.bookingRef && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AssessmentIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                Ref: {booking.bookingRef}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      }
                    />
                    <Stack alignItems="flex-end" spacing={2}>
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        sx={{ 
                          color: theme.palette.success.main,
                          fontFamily: 'monospace',
                        }}
                      >
                        ${booking.price.toLocaleString()}
                      </Typography>
                      <Chip
                        label={getBookingStatus(booking.status).label}
                        color={getBookingStatus(booking.status).color}
                        size="medium"
                        sx={{ 
                          borderRadius: 2,
                          fontWeight: 600,
                          minWidth: 90,
                        }}
                      />
                      
                      {/* Action Buttons for Customer */}
                      {user?.role === 'CUSTOMER' && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          {getBookingActions(booking).includes('pay') && (
                            <Tooltip title="Pay Now">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePayment(booking);
                                }}
                                sx={{
                                  backgroundColor: alpha('#FF385C', 0.1),
                                  color: '#FF385C',
                                  '&:hover': {
                                    backgroundColor: alpha('#FF385C', 0.2),
                                  },
                                }}
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {getBookingActions(booking).includes('cancel') && (
                            <Tooltip title="Cancel Booking">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelBooking(booking);
                                }}
                                sx={{
                                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                                  color: theme.palette.error.main,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                                  },
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {getBookingActions(booking).includes('message') && (
                            <Tooltip title="Message Host">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMessageHost(booking);
                                }}
                                sx={{
                                  backgroundColor: alpha('#FF385C', 0.1),
                                  color: '#FF385C',
                                  '&:hover': {
                                    backgroundColor: alpha('#FF385C', 0.2),
                                  },
                                }}
                              >
                                <MessageIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewBooking(booking.id);
                              }}
                              sx={{
                                backgroundColor: alpha('#FF385C', 0.1),
                                color: '#FF385C',
                                '&:hover': {
                                  backgroundColor: alpha('#FF385C', 0.2),
                                },
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => !processing && setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Complete Payment
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedBooking.property.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#FF385C' }}>
                ${selectedBooking.price.toLocaleString()}
              </Typography>
            </Box>
          )}
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="mpesa">M-Pesa</MenuItem>
              <MenuItem value="credit_card" disabled>Credit Card (Coming Soon)</MenuItem>
              <MenuItem value="debit_card" disabled>Debit Card (Coming Soon)</MenuItem>
              <MenuItem value="paypal" disabled>PayPal (Coming Soon)</MenuItem>
              <MenuItem value="bank_transfer" disabled>Bank Transfer (Coming Soon)</MenuItem>
            </Select>
          </FormControl>

          {paymentMethod === 'mpesa' && (
            <TextField
              fullWidth
              label="M-Pesa Phone Number"
              placeholder="254XXXXXXXXX"
              value={mpesaPhoneNumber}
              onChange={(e) => setMpesaPhoneNumber(e.target.value)}
              sx={{ mb: 3 }}
              helperText="Enter your M-Pesa registered phone number in format: 254XXXXXXXXX"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    🇰🇪 +
                  </InputAdornment>
                ),
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPaymentDialogOpen(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={processPayment}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <PaymentIcon />}
            sx={{
              background: '#FF385C',
              '&:hover': {
                background: '#E61E4D',
              },
            }}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={() => !processing && setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancel Booking
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedBooking.property.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for cancellation"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Please provide a reason for cancelling this booking..."
            sx={{ mb: 2 }}
          />
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cancelling within 24 hours of check-in may not be allowed. A refund will be processed within 3-5 business days.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialogOpen(false)}
            disabled={processing}
          >
            Keep Booking
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={processCancellation}
            disabled={processing || !cancellationReason.trim()}
            startIcon={processing ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {processing ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 