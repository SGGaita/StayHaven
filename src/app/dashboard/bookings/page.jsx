'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  Divider,
  useTheme,
  alpha,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Message as MessageIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import Image from 'next/image';

const BookingStatusConfig = {
  PENDING: { 
    color: 'warning', 
    label: 'Pending', 
    icon: '⏳',
    description: 'Awaiting confirmation',
    actions: ['pay', 'cancel', 'view']
  },
  CONFIRMED: { 
    color: 'success', 
    label: 'Confirmed', 
    icon: '✅',
    description: 'Booking confirmed',
    actions: ['cancel', 'view', 'message', 'receipt']
  },
  CANCELLED: { 
    color: 'error', 
    label: 'Cancelled', 
    icon: '❌',
    description: 'Booking cancelled',
    actions: ['view', 'receipt']
  },
  REJECTED: { 
    color: 'error', 
    label: 'Rejected', 
    icon: '❌',
    description: 'Booking rejected',
    actions: ['view']
  },
  COMPLETED: { 
    color: 'info', 
    label: 'Completed', 
    icon: '🏁',
    description: 'Stay completed',
    actions: ['view', 'receipt', 'review']
  },
  DEFAULT: { 
    color: 'default', 
    label: 'Unknown', 
    icon: '❓',
    description: 'Status unknown',
    actions: ['view']
  },
};

const getBookingStatus = (status) => {
  return BookingStatusConfig[status] || BookingStatusConfig.DEFAULT;
};

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`booking-tabpanel-${index}`}
    aria-labelledby={`booking-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export default function BookingsPage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/auth/signin');
      return;
    }

    fetchBookings();
  }, [user, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/bookings', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateNights = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const filterBookingsByStatus = (status) => {
    switch (status) {
      case 'active':
        return bookings.filter(b => ['CONFIRMED', 'PENDING'].includes(b.status));
      case 'pending':
        return bookings.filter(b => b.status === 'PENDING');
      case 'completed':
        return bookings.filter(b => b.status === 'COMPLETED');
      case 'cancelled':
        return bookings.filter(b => ['CANCELLED', 'REJECTED'].includes(b.status));
      default:
        return bookings;
    }
  };

  const getTabBookings = () => {
    const tabs = ['all', 'active', 'pending', 'completed', 'cancelled'];
    return filterBookingsByStatus(tabs[tabValue]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewBooking = (bookingId) => {
    router.push(`/dashboard/bookings/${bookingId}`);
  };

  const handleViewProperty = (propertyId) => {
    router.push(`/properties/${propertyId}`);
  };

  const handlePayment = (booking) => {
    setSelectedBooking(booking);
    setPaymentDialogOpen(true);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleDownloadReceipt = (bookingId) => {
    // TODO: Implement receipt download
    console.log('Download receipt:', bookingId);
  };

  const handleMessageHost = (booking) => {
    // TODO: Navigate to messages with host
    console.log('Message host for booking:', booking.id);
  };

  const processPayment = async () => {
    try {
      setProcessing(true);
      
      const response = await fetch(`/api/dashboard/bookings/${selectedBooking.id}/payment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: paymentMethod,
          amount: selectedBooking.price
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchBookings();
        setPaymentDialogOpen(false);
        setSelectedBooking(null);
        setError(null);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(`Payment failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const confirmCancellation = async () => {
    if (!cancellationReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(`/api/dashboard/bookings/${selectedBooking.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: cancellationReason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchBookings();
        setCancelDialogOpen(false);
        setSelectedBooking(null);
        setCancellationReason('');
        setError(null);
        // Show success message
        alert(data.message || 'Booking cancelled successfully!');
      } else {
        throw new Error('Cancellation processing failed');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(`Cancellation failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const getTabCounts = () => {
    return {
      all: bookings.length,
      active: filterBookingsByStatus('active').length,
      pending: filterBookingsByStatus('pending').length,
      completed: filterBookingsByStatus('completed').length,
      cancelled: filterBookingsByStatus('cancelled').length,
    };
  };

  if (!user || !user.id) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
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
            Loading your bookings...
          </Typography>
        </Box>
        </Container>
      </DashboardLayout>
    );
  }

  const tabCounts = getTabCounts();
  const currentBookings = getTabBookings();

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
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            My Bookings 🏠
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
            Manage your reservations, make payments, and track your travel history
          </Typography>
        </Box>

        {/* Tabs */}
          <Paper 
            elevation={0} 
            sx={{ 
            borderRadius: 3,
            background: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: 'hidden',
            mb: 4,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                py: 2,
              },
            }}
          >
            <Tab 
              label={
                <Badge badgeContent={tabCounts.all} color="primary" max={99}>
                  <Box sx={{ px: 1 }}>All Bookings</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={tabCounts.active} color="success" max={99}>
                  <Box sx={{ px: 1 }}>Active</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={tabCounts.pending} color="warning" max={99}>
                  <Box sx={{ px: 1 }}>Pending</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={tabCounts.completed} color="info" max={99}>
                  <Box sx={{ px: 1 }}>Completed</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={tabCounts.cancelled} color="error" max={99}>
                  <Box sx={{ px: 1 }}>Cancelled</Box>
                </Badge>
              } 
            />
          </Tabs>

          {/* Tab Panels */}
          {[0, 1, 2, 3, 4].map((index) => (
            <TabPanel key={index} value={tabValue} index={index}>
              {currentBookings.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.grey[100], 0.3)} 0%, ${alpha(theme.palette.grey[50], 0.8)} 100%)`,
                  borderRadius: 3,
              border: `2px dashed ${alpha(theme.palette.grey[300], 0.5)}`,
                  mx: 3,
                  mb: 3,
                }}>
                  <Box sx={{ mb: 2, fontSize: '4rem' }}>
                    {index === 1 ? '🏠' : index === 2 ? '⏳' : index === 3 ? '🎉' : index === 4 ? '❌' : '📋'}
                  </Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No {['', 'active', 'pending', 'completed', 'cancelled'][index]} bookings found
            </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {index === 0 && "Start exploring properties to make your first booking"}
                    {index === 1 && "No active bookings at the moment"}
                    {index === 2 && "No pending bookings requiring action"}
                    {index === 3 && "No completed stays yet"}
                    {index === 4 && "No cancelled bookings"}
            </Typography>
                  {index === 0 && (
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
              }}
            >
              Explore Properties
            </Button>
                  )}
                </Box>
        ) : (
                <Grid container spacing={3} sx={{ px: 3, pb: 3 }}>
                  {currentBookings.map((booking) => {
                    const statusConfig = getBookingStatus(booking.status);
                    const nights = calculateNights(booking.startDate, booking.endDate);
                    
                    return (
                <Grid item xs={12} md={6} lg={4} key={booking.id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                              boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.1)}`,
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                      },
                    }}
                  >
                    {/* Property Image */}
                          <Box sx={{ position: 'relative', height: 200 }}>
                            <CardMedia
                              component="img"
                              height="200"
                              image={booking.property.photos?.[0] || '/placeholder-property.jpg'}
                        alt={booking.property.name}
                              sx={{ 
                                objectFit: 'cover',
                                borderRadius: '12px 12px 0 0',
                              }}
                      />
                      
                      {/* Status Badge */}
                            <Chip
                              label={statusConfig.label}
                              color={statusConfig.color}
                              size="small"
                              icon={<span style={{ fontSize: '0.875rem' }}>{statusConfig.icon}</span>}
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                fontWeight: 600,
                                backdropFilter: 'blur(10px)',
                                backgroundColor: alpha(theme.palette[statusConfig.color].main, 0.9),
                                color: 'white',
                              }}
                            />

                            {/* Booking Reference */}
                        <Chip
                              label={booking.bookingRef}
                          size="small"
                          sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                            backdropFilter: 'blur(10px)',
                                backgroundColor: alpha(theme.palette.common.black, 0.7),
                                color: 'white',
                          }}
                        />
                    </Box>

                          <CardContent sx={{ p: 3, height: 'calc(100% - 200px)', display: 'flex', flexDirection: 'column' }}>
                      {/* Property Name */}
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        sx={{ 
                                mb: 1,
                          overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                        }}
                      >
                        {booking.property.name}
                      </Typography>

                      {/* Location */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {booking.property.location}
                        </Typography>
                      </Box>

                      {/* Dates */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </Typography>
                      </Box>

                            {/* Duration & Guests */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {nights} night{nights !== 1 ? 's' : ''}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PersonIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Price */}
                            <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                                {formatCurrency(booking.price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total amount
                        </Typography>
                      </Box>

                      {/* Action Buttons */}
                      <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                              {statusConfig.actions.includes('pay') && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<PaymentIcon />}
                                  onClick={() => handlePayment(booking)}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    flex: 1,
                                    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                                  }}
                                >
                                  Pay Now
                                </Button>
                              )}
                              
                              {statusConfig.actions.includes('cancel') && (
                                <Tooltip title="Cancel Booking">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCancelBooking(booking)}
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

                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewBooking(booking.id)}
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                              {statusConfig.actions.includes('message') && (
                                <Tooltip title="Message Host">
                          <IconButton
                            size="small"
                                    onClick={() => handleMessageHost(booking)}
                            sx={{
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.info.main, 0.2),
                              },
                            }}
                          >
                            <MessageIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                              )}

                              {statusConfig.actions.includes('receipt') && (
                        <Tooltip title="Download Receipt">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadReceipt(booking.id)}
                            sx={{
                              backgroundColor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.warning.main, 0.2),
                              },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                    );
                  })}
            </Grid>
              )}
            </TabPanel>
          ))}
        </Paper>

        {/* Payment Dialog */}
        <Dialog 
          open={paymentDialogOpen} 
          onClose={() => setPaymentDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 'bold',
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}>
            Complete Payment
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedBooking && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedBooking.property.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatDate(selectedBooking.startDate)} - {formatDate(selectedBooking.endDate)}
                </Typography>
                <Typography variant="h5" color="success.main" sx={{ mb: 3 }}>
                  {formatCurrency(selectedBooking.price)}
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <MenuItem value="card">Credit/Debit Card</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                    <MenuItem value="bank">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>

                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Your payment will be processed securely. You will receive a confirmation email once the payment is complete.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <Button 
              onClick={() => setPaymentDialogOpen(false)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                color: theme.palette.text.secondary,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={processPayment} 
              variant="contained"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : <PaymentIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {processing ? 'Processing...' : `Pay ${selectedBooking ? formatCurrency(selectedBooking.price) : ''}`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog 
          open={cancelDialogOpen} 
          onClose={() => setCancelDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 'bold',
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}>
            Cancel Booking
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedBooking && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to cancel your booking for:
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                  {selectedBooking.property.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatDate(selectedBooking.startDate)} - {formatDate(selectedBooking.endDate)}
                </Typography>
                
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  This action cannot be undone. Please review the cancellation policy for potential fees.
                </Alert>

                <TextField
                  label="Cancellation Reason"
                  multiline
                  rows={4}
                  fullWidth
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <Button 
              onClick={() => setCancelDialogOpen(false)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                color: theme.palette.text.secondary,
              }}
            >
              Keep Booking
            </Button>
            <Button 
              onClick={confirmCancellation} 
              variant="contained"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : <CancelIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {processing ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
} 