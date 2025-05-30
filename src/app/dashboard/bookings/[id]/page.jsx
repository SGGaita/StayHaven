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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Message as MessageIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  Group as GroupIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import Image from 'next/image';

// Brand color theme - StayHaven Pink Theme
const brandColors = {
  primary: '#ec4899', // Pink-500
  secondary: '#f97316', // Orange-500
  accent: '#8b5cf6', // Violet-500
  success: '#10b981', // Green
  warning: '#f59e0b', // Amber
  error: '#ef4444', // Red
  info: '#06b6d4', // Cyan
  background: {
    light: '#fdf2f8', // Pink-50
    dark: '#831843', // Pink-900
    card: '#ffffff',
    overlay: 'rgba(236, 72, 153, 0.05)', // Pink with opacity
  },
  text: {
    primary: '#1f2937', // Gray-800
    secondary: '#6b7280', // Gray-500
    muted: '#9ca3af', // Gray-400
  }
};

const BookingStatusConfig = {
  PENDING: { 
    color: 'warning', 
    label: 'Pending', 
    icon: '⏳', 
    description: 'Waiting for host confirmation',
    bgColor: brandColors.warning,
    textColor: '#ffffff'
  },
  CONFIRMED: { 
    color: 'success', 
    label: 'Confirmed', 
    icon: '✅', 
    description: 'Booking confirmed by host',
    bgColor: brandColors.success,
    textColor: '#ffffff'
  },
  CANCELLED: { 
    color: 'error', 
    label: 'Cancelled', 
    icon: '❌', 
    description: 'Booking has been cancelled',
    bgColor: brandColors.error,
    textColor: '#ffffff'
  },
  REJECTED: { 
    color: 'error', 
    label: 'Rejected', 
    icon: '❌', 
    description: 'Booking was rejected by host',
    bgColor: brandColors.error,
    textColor: '#ffffff'
  },
  COMPLETED: { 
    color: 'info', 
    label: 'Completed', 
    icon: '🏁', 
    description: 'Stay completed successfully',
    bgColor: brandColors.info,
    textColor: '#ffffff'
  },
  DEFAULT: { 
    color: 'default', 
    label: 'Unknown', 
    icon: '❓', 
    description: 'Status unknown',
    bgColor: brandColors.text.secondary,
    textColor: '#ffffff'
  },
};

const getBookingStatus = (status) => {
  return BookingStatusConfig[status] || BookingStatusConfig.DEFAULT;
};

export default function BookingDetailsPage({ params }) {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/auth/signin');
      return;
    }

    fetchBookingDetails();
  }, [user, router, params.id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/bookings/${params.id}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }

      const data = await response.json();
      setBooking(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.message);
      // Set mock data for development
      const mockBooking = {
        id: params.id,
        bookingRef: 'BK-12345678',
        startDate: '2024-02-15T00:00:00.000Z',
        endDate: '2024-02-18T00:00:00.000Z', // 3 nights
        status: 'CONFIRMED',
        price: 34,
        guests: 2,
        subtotal: 102, // 34 * 3 nights
        cleaningFee: 25,
        serviceFee: 15,
        securityDeposit: 100,
        createdAt: '2024-01-15T10:30:00.000Z',
        property: {
          id: '1',
          name: 'Cozy Mountain Cabin',
          location: 'Aspen, Colorado',
          photos: ['/placeholder-property.jpg'],
          price: 34,
          propertyType: 'Cabin',
          bedrooms: 2,
          bathrooms: 1,
          maxGuests: 4,
          checkInTime: '3:00 PM',
          checkOutTime: '11:00 AM',
          manager: {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            phone: '+1-555-0123'
          }
        }
      };
      setBooking(mockBooking);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const getTotalAmount = () => {
    if (!booking) return 0;
    
    const subtotal = booking.subtotal || (booking.price * calculateNights()) || 0;
    const cleaningFee = booking.cleaningFee || 0;
    const serviceFee = booking.serviceFee || 0;
    
    return subtotal + cleaningFee + serviceFee;
  };

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      const response = await fetch(`/api/dashboard/bookings/${params.id}/cancel`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Refresh booking details
      await fetchBookingDetails();
      setCancelDialogOpen(false);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadReceipt = () => {
    // Create a new window for the receipt
    const receiptWindow = window.open('', '_blank');
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>StayHaven - Booking Receipt</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 40px;
          }
          
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 2px solid #ec4899;
            border-radius: 12px;
            overflow: hidden;
          }
          
          .receipt-header {
            background: linear-gradient(135deg, #ec4899, #f97316);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .receipt-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: bold;
          }
          
          .receipt-header p {
            font-size: 1.2rem;
            opacity: 0.9;
          }
          
          .receipt-body {
            padding: 40px;
          }
          
          .receipt-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
          }
          
          .info-section h3 {
            color: #ec4899;
            font-size: 1.2rem;
            margin-bottom: 15px;
            border-bottom: 2px solid #ec4899;
            padding-bottom: 8px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          
          .info-item strong {
            color: #1f2937;
          }
          
          .property-details {
            background: #fdf2f8;
            border: 1px solid #ec4899;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .property-details h3 {
            color: #ec4899;
            margin-bottom: 15px;
            font-size: 1.3rem;
          }
          
          .booking-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .detail-card {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          
          .detail-card .icon {
            font-size: 1.5rem;
            margin-bottom: 8px;
          }
          
          .detail-card .label {
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 5px;
          }
          
          .detail-card .value {
            color: #1f2937;
            font-weight: bold;
            font-size: 1.1rem;
          }
          
          .price-breakdown {
            background: #f0f9ff;
            border: 2px solid #06b6d4;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
          }
          
          .price-breakdown h3 {
            color: #0891b2;
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.3rem;
          }
          
          .price-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px dashed #cbd5e1;
          }
          
          .price-item:last-of-type {
            border-bottom: none;
            margin-bottom: 15px;
          }
          
          .total-amount {
            display: flex;
            justify-content: space-between;
            font-size: 1.3rem;
            font-weight: bold;
            color: #ec4899;
            border-top: 2px solid #ec4899;
            padding-top: 15px;
            margin-top: 15px;
          }
          
          .security-deposit {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            text-align: center;
          }
          
          .security-deposit .amount {
            color: #d97706;
            font-weight: bold;
            font-size: 1.1rem;
          }
          
          .security-deposit .note {
            color: #92400e;
            font-size: 0.9rem;
            margin-top: 5px;
          }
          
          .receipt-footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
          }
          
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9rem;
            margin-bottom: 20px;
            background: ${getBookingStatus(booking.status).bgColor};
            color: white;
          }
          
          @media print {
            body { margin: 0; padding: 20px; }
            .receipt-container { border: none; box-shadow: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <h1>🏠 StayHaven</h1>
            <p>Booking Receipt</p>
          </div>
          
          <div class="receipt-body">
            <div class="receipt-info">
              <div class="info-section">
                <h3>📋 Booking Information</h3>
                <div class="info-item">
                  <span>Booking Reference:</span>
                  <strong>${booking.bookingRef}</strong>
                </div>
                <div class="info-item">
                  <span>Booking Date:</span>
                  <strong>${formatDate(booking.createdAt)}</strong>
                </div>
                <div class="info-item">
                  <span>Status:</span>
                  <strong class="status-badge">${getBookingStatus(booking.status).label}</strong>
                </div>
              </div>
              
              <div class="info-section">
                <h3>👤 Guest Information</h3>
                <div class="info-item">
                  <span>Number of Guests:</span>
                  <strong>${booking.guests} guest${booking.guests !== 1 ? 's' : ''}</strong>
                </div>
                <div class="info-item">
                  <span>Duration:</span>
                  <strong>${calculateNights()} night${calculateNights() !== 1 ? 's' : ''}</strong>
                </div>
              </div>
            </div>
            
            <div class="property-details">
              <h3>🏡 Property Details</h3>
              <div style="margin-bottom: 15px;">
                <strong style="font-size: 1.2rem; color: #1f2937;">${booking.property.name}</strong>
              </div>
              <div style="margin-bottom: 10px;">
                <span style="color: #6b7280;">📍 Location:</span>
                <strong style="margin-left: 10px;">${booking.property.location}</strong>
              </div>
              <div style="margin-bottom: 10px;">
                <span style="color: #6b7280;">🏠 Type:</span>
                <strong style="margin-left: 10px;">${booking.property.propertyType || 'Property'}</strong>
              </div>
              ${booking.property.bedrooms ? `
              <div style="margin-bottom: 10px;">
                <span style="color: #6b7280;">🛏️ Bedrooms:</span>
                <strong style="margin-left: 10px;">${booking.property.bedrooms}</strong>
              </div>
              ` : ''}
              ${booking.property.bathrooms ? `
              <div style="margin-bottom: 10px;">
                <span style="color: #6b7280;">🚿 Bathrooms:</span>
                <strong style="margin-left: 10px;">${booking.property.bathrooms}</strong>
              </div>
              ` : ''}
            </div>
            
            <div class="booking-details">
              <div class="detail-card">
                <div class="icon">📅</div>
                <div class="label">Check-in</div>
                <div class="value">${formatDate(booking.startDate)}</div>
                <div style="color: #6b7280; font-size: 0.8rem; margin-top: 5px;">
                  ${booking.property.checkInTime || '3:00 PM'}
                </div>
              </div>
              
              <div class="detail-card">
                <div class="icon">📅</div>
                <div class="label">Check-out</div>
                <div class="value">${formatDate(booking.endDate)}</div>
                <div style="color: #6b7280; font-size: 0.8rem; margin-top: 5px;">
                  ${booking.property.checkOutTime || '11:00 AM'}
                </div>
              </div>
            </div>
            
            <div class="price-breakdown">
              <h3>💰 Price Breakdown</h3>
              
              <div class="price-item">
                <span>${formatCurrency(booking.price)} × ${calculateNights()} nights</span>
                <strong>${formatCurrency(booking.subtotal || (booking.price * calculateNights()))}</strong>
              </div>
              
              ${(booking.cleaningFee && booking.cleaningFee > 0) ? `
              <div class="price-item">
                <span>Cleaning fee</span>
                <strong>${formatCurrency(booking.cleaningFee)}</strong>
              </div>
              ` : ''}
              
              ${(booking.serviceFee && booking.serviceFee > 0) ? `
              <div class="price-item">
                <span>Service fee</span>
                <strong>${formatCurrency(booking.serviceFee)}</strong>
              </div>
              ` : ''}
              
              <div class="total-amount">
                <span>Total Amount</span>
                <span>${formatCurrency(getTotalAmount())}</span>
              </div>
              
              ${booking.securityDeposit > 0 ? `
              <div class="security-deposit">
                <div class="amount">Security Deposit: ${formatCurrency(booking.securityDeposit)}</div>
                <div class="note">Will be refunded after checkout</div>
              </div>
              ` : ''}
            </div>
            
            ${booking.property.manager ? `
            <div class="info-section">
              <h3>🏠 Host Information</h3>
              <div class="info-item">
                <span>Host:</span>
                <strong>${booking.property.manager.firstName} ${booking.property.manager.lastName}</strong>
              </div>
              <div class="info-item">
                <span>Email:</span>
                <strong>${booking.property.manager.email}</strong>
              </div>
              ${booking.property.manager.phone ? `
              <div class="info-item">
                <span>Phone:</span>
                <strong>${booking.property.manager.phone}</strong>
              </div>
              ` : ''}
            </div>
            ` : ''}
          </div>
          
          <div class="receipt-footer">
            <p><strong>Thank you for choosing StayHaven!</strong></p>
            <p>For support, contact us at support@stayhaven.com</p>
            <p style="margin-top: 10px; font-size: 0.8rem;">
              Generated on ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print(); setTimeout(() => window.close(), 100);" 
                  style="background: #ec4899; color: white; border: none; padding: 12px 24px; 
                         border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer;">
            📄 Download PDF
          </button>
          <button onclick="window.close();" 
                  style="background: #6b7280; color: white; border: none; padding: 12px 24px; 
                         border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; margin-left: 10px;">
            ✖️ Close
          </button>
        </div>
      </body>
      </html>
    `;
    
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    
    // Auto-focus the new window
    receiptWindow.focus();
  };

  const handleMessageHost = () => {
    router.push(`/dashboard/messages?conversation=${booking?.property?.manager?.id}`);
  };

  const handleViewProperty = () => {
    router.push(`/properties/${booking?.property?.id}`);
  };

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
            Loading booking details...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Booking not found or you don't have permission to view it.
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/bookings')}
            sx={{ mt: 2 }}
          >
            Back to Bookings
          </Button>
        </Container>
      </DashboardLayout>
    );
  }

  const statusConfig = getBookingStatus(booking.status);

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/bookings')}
          sx={{ 
            mb: 3,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Back to Bookings
        </Button>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ 
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${brandColors.background.overlay} 0%, ${alpha(brandColors.accent, 0.05)} 100%)`,
          border: `1px solid ${alpha(brandColors.primary, 0.15)}`,
          boxShadow: `0 4px 20px ${alpha(brandColors.primary, 0.08)}`,
        }}>
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.secondary})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                {booking.property.name}
              </Typography>
              
              <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ color: brandColors.primary, fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: brandColors.text.secondary, fontWeight: 500 }}>
                    {booking.property.location}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  backgroundColor: alpha(brandColors.primary, 0.1),
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  border: `1px solid ${alpha(brandColors.primary, 0.2)}`,
                }}>
                  <GroupIcon sx={{ color: brandColors.primary, fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: brandColors.primary, fontWeight: 600 }}>
                    {booking.guests} Guest{booking.guests !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Stack>
              
              <Typography variant="h6" sx={{ color: brandColors.text.secondary, mb: 1, fontSize: '1.1rem' }}>
                Booking Reference: <span style={{ color: brandColors.primary, fontWeight: 600 }}>{booking.bookingRef}</span>
              </Typography>
              
              <Typography variant="body2" sx={{ color: brandColors.text.muted }}>
                {statusConfig.description}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Chip
                label={statusConfig.label}
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 3,
                  py: 2,
                  height: 'auto',
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.textColor,
                  border: 'none',
                  boxShadow: `0 2px 8px ${alpha(statusConfig.bgColor, 0.3)}`,
                  '&:hover': {
                    backgroundColor: statusConfig.bgColor,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(statusConfig.bgColor, 0.4)}`,
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Property Images */}
            <Card elevation={0} sx={{ 
              mb: 4, 
              borderRadius: 3, 
              overflow: 'hidden',
              border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(brandColors.primary, 0.05)}`,
            }}>
              <Box sx={{ position: 'relative', height: 400 }}>
                <Image
                  src={booking.property.photos?.[0] || '/placeholder-property.jpg'}
                  alt={booking.property.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </Box>
            </Card>

            {/* Booking Details */}
            <Card elevation={0} sx={{ 
              mb: 4, 
              borderRadius: 3, 
              border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(brandColors.primary, 0.05)}`,
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
                  color: brandColors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  📅 Booking Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(brandColors.primary, 0.05),
                      border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
                    }}>
                      <CalendarIcon sx={{ color: brandColors.primary }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: brandColors.text.secondary }}>
                          Check-in
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: brandColors.text.primary }}>
                          {formatDate(booking.startDate)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: brandColors.text.muted }}>
                          {booking.property.checkInTime || '3:00 PM'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(brandColors.secondary, 0.05),
                      border: `1px solid ${alpha(brandColors.secondary, 0.1)}`,
                    }}>
                      <CalendarIcon sx={{ color: brandColors.secondary }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: brandColors.text.secondary }}>
                          Check-out
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: brandColors.text.primary }}>
                          {formatDate(booking.endDate)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: brandColors.text.muted }}>
                          {booking.property.checkOutTime || '11:00 AM'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(brandColors.accent, 0.05),
                      border: `1px solid ${alpha(brandColors.accent, 0.1)}`,
                    }}>
                      <ScheduleIcon sx={{ color: brandColors.accent }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: brandColors.text.secondary }}>
                          Duration
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: brandColors.text.primary }}>
                          {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(brandColors.primary, 0.05),
                      border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
                    }}>
                      <GroupIcon sx={{ color: brandColors.primary }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: brandColors.text.secondary }}>
                          Guests
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: brandColors.text.primary }}>
                          {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderColor: alpha(brandColors.primary, 0.1) }} />

                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: brandColors.text.primary }}>
                  📋 Booking Timeline
                </Typography>
                <Typography variant="body2" sx={{ color: brandColors.text.secondary }}>
                  Booked on {formatDate(booking.createdAt)} at {formatTime(booking.createdAt)}
                </Typography>
              </CardContent>
            </Card>

            {/* Host Information */}
            {booking.property.manager && (
              <Card elevation={0} sx={{ 
                mb: 4, 
                borderRadius: 3, 
                border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
                boxShadow: `0 4px 20px ${alpha(brandColors.primary, 0.05)}`,
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
                    color: brandColors.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    🏠 Your Host
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                    <Avatar sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: brandColors.primary,
                      color: 'white',
                      fontWeight: 'bold',
                    }}>
                      {booking.property.manager.firstName?.[0]}{booking.property.manager.lastName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: brandColors.text.primary }}>
                        {booking.property.manager.firstName} {booking.property.manager.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: brandColors.text.secondary }}>
                        Property Manager
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<MessageIcon />}
                      onClick={handleMessageHost}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: brandColors.primary,
                        color: brandColors.primary,
                        '&:hover': {
                          borderColor: brandColors.primary,
                          backgroundColor: alpha(brandColors.primary, 0.1),
                        },
                      }}
                    >
                      Message Host
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PhoneIcon />}
                      href={`tel:${booking.property.manager.phone}`}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: brandColors.secondary,
                        color: brandColors.secondary,
                        '&:hover': {
                          borderColor: brandColors.secondary,
                          backgroundColor: alpha(brandColors.secondary, 0.1),
                        },
                      }}
                    >
                      Call
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Price Breakdown */}
            <Card elevation={0} sx={{ 
              mb: 4, 
              borderRadius: 3, 
              border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(brandColors.primary, 0.05)}`,
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{
                  color: brandColors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  💰 Price Breakdown
                </Typography>
                
                <List disablePadding>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemText 
                      primary={`${formatCurrency(booking.price)} × ${calculateNights()} nights`}
                      sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontWeight: 500,
                          color: brandColors.text.secondary,
                        } 
                      }}
                    />
                    <Typography variant="body1" fontWeight="bold" sx={{ color: brandColors.text.primary }}>
                      {formatCurrency(booking.subtotal || (booking.price * calculateNights()))}
                    </Typography>
                  </ListItem>
                  
                  {(booking.cleaningFee && booking.cleaningFee > 0) && (
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText 
                        primary="Cleaning fee"
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontWeight: 500,
                            color: brandColors.text.secondary,
                          } 
                        }}
                      />
                      <Typography variant="body1" fontWeight="bold" sx={{ color: brandColors.text.primary }}>
                        {formatCurrency(booking.cleaningFee)}
                      </Typography>
                    </ListItem>
                  )}
                  
                  {(booking.serviceFee && booking.serviceFee > 0) && (
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText 
                        primary="Service fee"
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontWeight: 500,
                            color: brandColors.text.secondary,
                          } 
                        }}
                      />
                      <Typography variant="body1" fontWeight="bold" sx={{ color: brandColors.text.primary }}>
                        {formatCurrency(booking.serviceFee)}
                      </Typography>
                    </ListItem>
                  )}
                </List>

                <Divider sx={{ my: 2, borderColor: alpha(brandColors.primary, 0.1) }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: brandColors.text.primary }}>
                    Total
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: brandColors.primary }}>
                    {formatCurrency(getTotalAmount())}
                  </Typography>
                </Box>

                {booking.securityDeposit > 0 && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: alpha(brandColors.info, 0.1), 
                    borderRadius: 2,
                    border: `1px solid ${alpha(brandColors.info, 0.2)}`,
                  }}>
                    <Typography variant="body2" sx={{ color: brandColors.info, fontWeight: 600 }}>
                      Security Deposit: {formatCurrency(booking.securityDeposit)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: brandColors.text.muted }}>
                      Will be refunded after checkout
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card elevation={0} sx={{ 
              mb: 4, 
              borderRadius: 3, 
              border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(brandColors.primary, 0.05)}`,
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{
                  color: brandColors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  ⚡ Quick Actions
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={handleViewProperty}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      backgroundColor: brandColors.primary,
                      '&:hover': {
                        backgroundColor: brandColors.primary,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(brandColors.primary, 0.3)}`,
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    View Property
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadReceipt}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderColor: brandColors.accent,
                      color: brandColors.accent,
                      '&:hover': {
                        borderColor: brandColors.accent,
                        backgroundColor: alpha(brandColors.accent, 0.1),
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Download Receipt
                  </Button>
                  
                  {booking.status === 'CONFIRMED' && (
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => setCancelDialogOpen(true)}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                        borderColor: brandColors.error,
                        color: brandColors.error,
                        '&:hover': {
                          borderColor: brandColors.error,
                          backgroundColor: alpha(brandColors.error, 0.1),
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card elevation={0} sx={{ 
              borderRadius: 3, 
              border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(brandColors.primary, 0.05)}`,
              mb: 4,
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{
                  color: brandColors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  🏡 Property Details
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(brandColors.primary, 0.05),
                    border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
                  }}>
                    <HomeIcon sx={{ color: brandColors.primary }} />
                    <Typography variant="body2" sx={{ color: brandColors.text.primary, fontWeight: 500 }}>
                      {booking.property.propertyType || 'Property'}
                    </Typography>
                  </Box>
                  
                  {booking.property.bedrooms && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(brandColors.secondary, 0.05),
                      border: `1px solid ${alpha(brandColors.secondary, 0.1)}`,
                    }}>
                      <HotelIcon sx={{ color: brandColors.secondary }} />
                      <Typography variant="body2" sx={{ color: brandColors.text.primary, fontWeight: 500 }}>
                        {booking.property.bedrooms} bedroom{booking.property.bedrooms !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}
                  
                  {booking.property.bathrooms && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(brandColors.accent, 0.05),
                      border: `1px solid ${alpha(brandColors.accent, 0.1)}`,
                    }}>
                      <BathtubIcon sx={{ color: brandColors.accent }} />
                      <Typography variant="body2" sx={{ color: brandColors.text.primary, fontWeight: 500 }}>
                        {booking.property.bathrooms} bathroom{booking.property.bathrooms !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}
                  
                  {booking.property.maxGuests && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(brandColors.info, 0.05),
                      border: `1px solid ${alpha(brandColors.info, 0.1)}`,
                    }}>
                      <GroupIcon sx={{ color: brandColors.info }} />
                      <Typography variant="body2" sx={{ color: brandColors.text.primary, fontWeight: 500 }}>
                        Up to {booking.property.maxGuests} guests
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Property Location Map */}
            <Card elevation={0} sx={{ 
              borderRadius: 3, 
              border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(brandColors.primary, 0.05)}`,
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{
                  color: brandColors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  📍 Location
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(brandColors.primary, 0.05),
                  border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
                }}>
                  <LocationIcon sx={{ color: brandColors.primary }} />
                  <Typography variant="body1" sx={{ color: brandColors.text.primary, fontWeight: 500 }}>
                    {booking.property.location}
                  </Typography>
                </Box>
                
                {/* Interactive Map */}
                <Box sx={{ 
                  position: 'relative', 
                  height: 300, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
                  backgroundColor: alpha(brandColors.background.light, 0.5),
                }}>
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'demo'}&q=${encodeURIComponent(booking.property.location)}&zoom=14&maptype=roadmap`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onError={(e) => {
                      // Fallback to OpenStreetMap if Google Maps fails
                      e.target.src = `https://www.openstreetmap.org/export/embed.html?bbox=-104.99404,39.75621,-104.98404,39.76621&layer=mapnik&marker=39.76121,-104.98904`;
                    }}
                  />
                  
                  {/* Map overlay for demo purposes */}
                  {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'demo') && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: alpha(brandColors.background.light, 0.95),
                      gap: 2,
                    }}>
                      <LocationIcon sx={{ fontSize: 48, color: brandColors.primary }} />
                      <Typography variant="h6" sx={{ color: brandColors.text.primary, textAlign: 'center' }}>
                        Interactive Map
                      </Typography>
                      <Typography variant="body2" sx={{ color: brandColors.text.secondary, textAlign: 'center', maxWidth: 200 }}>
                        {booking.property.location}
                      </Typography>
                      <Typography variant="caption" sx={{ color: brandColors.text.muted, textAlign: 'center' }}>
                        Map integration available with API key
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Map Actions */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<LocationIcon />}
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.property.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: brandColors.primary,
                      color: brandColors.primary,
                      '&:hover': {
                        borderColor: brandColors.primary,
                        backgroundColor: alpha(brandColors.primary, 0.1),
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Open in Google Maps
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LocationIcon />}
                    href={`https://maps.apple.com/?q=${encodeURIComponent(booking.property.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: brandColors.secondary,
                      color: brandColors.secondary,
                      '&:hover': {
                        borderColor: brandColors.secondary,
                        backgroundColor: alpha(brandColors.secondary, 0.1),
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Open in Apple Maps
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Cancel Booking Dialog */}
        <Dialog 
          open={cancelDialogOpen} 
          onClose={() => setCancelDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: `1px solid ${alpha(brandColors.primary, 0.1)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            color: brandColors.text.primary,
            fontWeight: 'bold',
            borderBottom: `1px solid ${alpha(brandColors.primary, 0.1)}`,
          }}>
            Cancel Booking
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom sx={{ color: brandColors.text.primary }}>
              Are you sure you want to cancel this booking?
            </Typography>
            <Typography variant="body2" sx={{ color: brandColors.text.secondary }}>
              This action cannot be undone. Please review the cancellation policy for potential fees.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(brandColors.primary, 0.1)}` }}>
            <Button 
              onClick={() => setCancelDialogOpen(false)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                color: brandColors.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(brandColors.text.secondary, 0.1),
                },
              }}
            >
              Keep Booking
            </Button>
            <Button 
              onClick={handleCancelBooking} 
              variant="contained"
              disabled={cancelling}
              startIcon={cancelling ? <CircularProgress size={20} /> : <CancelIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: brandColors.error,
                '&:hover': {
                  backgroundColor: brandColors.error,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(brandColors.error, 0.3)}`,
                },
                '&:disabled': {
                  backgroundColor: alpha(brandColors.error, 0.6),
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
} 