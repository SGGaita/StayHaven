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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Collapse,
  Menu,
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
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Hotel as HotelIcon,
  FlightTakeoff as CheckInIcon,
  FlightLand as CheckOutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DateRange as DateRangeIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import Image from 'next/image';
import moment from 'moment';

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

const BookingCard = ({ booking, onStatusChange, onViewDetails, onContactGuest, onCancel }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'COMPLETED':
        return 'info';
      case 'CHECKED_IN':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircleIcon fontSize="small" />;
      case 'PENDING':
        return <ScheduleIcon fontSize="small" />;
      case 'CANCELLED':
        return <CancelIcon fontSize="small" />;
      case 'COMPLETED':
        return <CheckIcon fontSize="small" />;
      case 'CHECKED_IN':
        return <HotelIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const isCheckInToday = () => {
    return moment(booking.startDate).isSame(moment(), 'day');
  };

  const isCheckOutToday = () => {
    return moment(booking.endDate).isSame(moment(), 'day');
  };

  const daysUntilCheckIn = () => {
    return moment(booking.startDate).diff(moment(), 'days');
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          borderColor: alpha('#FF385C', 0.3),
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {booking.property?.name}
                </Typography>
                {isCheckInToday() && (
                  <Chip
                    label="Check-in Today"
                    size="small"
                    color="primary"
                    icon={<CheckInIcon fontSize="small" />}
                  />
                )}
                {isCheckOutToday() && (
                  <Chip
                    label="Check-out Today"
                    size="small"
                    color="secondary"
                    icon={<CheckOutIcon fontSize="small" />}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Booking #{booking.id?.slice(0, 8)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={booking.status}
                color={getStatusColor(booking.status)}
                icon={getStatusIcon(booking.status)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <IconButton onClick={handleMenuOpen} size="small">
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Guest Information */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha('#FF385C', 0.1),
                color: '#FF385C',
                width: 40,
                height: 40,
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="600">
                {booking.customer?.firstName} {booking.customer?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {booking.customer?.email}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#FF385C' }}>
                ${booking.totalPrice?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {booking.nights} nights
              </Typography>
            </Box>
          </Box>

          {/* Dates */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              p: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Check-in
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {moment(booking.startDate).format('MMM DD, YYYY')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {moment(booking.startDate).format('dddd')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Check-out
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {moment(booking.endDate).format('MMM DD, YYYY')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {moment(booking.endDate).format('dddd')}
              </Typography>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ViewIcon />}
              onClick={() => onViewDetails(booking)}
            >
              Details
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MessageIcon />}
              onClick={() => onContactGuest(booking)}
            >
              Contact
            </Button>
            {booking.status === 'CONFIRMED' && daysUntilCheckIn() <= 1 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckInIcon />}
                onClick={() => onStatusChange(booking.id, 'CHECKED_IN')}
                sx={{ bgcolor: '#28A745', '&:hover': { bgcolor: '#218838' } }}
              >
                Check In
              </Button>
            )}
            {booking.status === 'CHECKED_IN' && (
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckOutIcon />}
                onClick={() => onStatusChange(booking.id, 'COMPLETED')}
                sx={{ bgcolor: '#17A2B8', '&:hover': { bgcolor: '#138496' } }}
              >
                Check Out
              </Button>
            )}
          </Box>

          {/* Expandable Details */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Guest Information
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {booking.customer?.phone || 'Not provided'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {booking.guests} guests
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Booking Details
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Base price:
                    </Typography>
                    <Typography variant="body2">
                      ${booking.basePrice?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Service fee:
                    </Typography>
                    <Typography variant="body2">
                      ${booking.serviceFee?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Taxes:
                    </Typography>
                    <Typography variant="body2">
                      ${booking.taxes?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Collapse>

          <Button
            variant="text"
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </Stack>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); onViewDetails(booking); }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); onContactGuest(booking); }}>
          <MessageIcon sx={{ mr: 1 }} fontSize="small" />
          Contact Guest
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); /* handle edit */ }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Booking
        </MenuItem>
        <Divider />
        {booking.status !== 'CANCELLED' && (
          <MenuItem onClick={() => { handleMenuClose(); onCancel(booking); }} sx={{ color: 'error.main' }}>
            <CancelIcon sx={{ mr: 1 }} fontSize="small" />
            Cancel Booking
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [properties, setProperties] = useState([]);
  const [quickStats, setQuickStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    monthlyRevenue: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
  });

  // Dialog states
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [contactDialog, setContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/auth/signin');
      return;
    }

    fetchBookings();
    fetchProperties();
    fetchQuickStats();
  }, [user, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/bookings', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Bookings API response:', data); // Debug log
        setBookings(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch bookings:', response.status, response.statusText);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/dashboard/properties', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const response = await fetch('/api/dashboard/bookings/stats', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setQuickStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/dashboard/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings();
        fetchQuickStats();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsDialog(true);
  };

  const handleContactGuest = (booking) => {
    setSelectedBooking(booking);
    setContactMessage(`Hi ${booking.customer?.firstName}, regarding your upcoming stay at ${booking.property?.name}...`);
    setContactDialog(true);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(`/api/dashboard/bookings/${selectedBooking.id}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        fetchBookings();
        fetchQuickStats();
        setCancelDialogOpen(false);
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedBooking || !contactMessage.trim()) return;

    try {
      const response = await fetch(`/api/dashboard/bookings/${selectedBooking.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: contactMessage }),
      });

      if (response.ok) {
        setContactDialog(false);
        setContactMessage('');
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const processPayment = async () => {
    if (!selectedBooking) return;

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
          amount: selectedBooking.price || selectedBooking.totalPrice,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const result = await response.json();
      
      // Update the booking in the list
      setBookings(prev => 
        prev.map(booking => 
          booking.id === selectedBooking.id 
            ? { ...booking, status: 'CONFIRMED' }
            : booking
        )
      );

      setPaymentDialogOpen(false);
      setSelectedBooking(null);
      setPaymentMethod('card');
      
      // Refresh data
      fetchBookings();
      fetchQuickStats();
      
      // Show success message
      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
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
                  <BookingCard
                    booking={booking}
                    onStatusChange={handleStatusChange}
                    onViewDetails={handleViewDetails}
                    onContactGuest={handleContactGuest}
                    onCancel={handleCancelBooking}
                  />
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
              onClick={confirmCancelBooking} 
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

        {/* Booking Details Dialog */}
        <Dialog
          open={detailsDialog}
          onClose={() => setDetailsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Booking Details
            <Typography variant="body2" color="text.secondary">
              {selectedBooking?.property?.name} • #{selectedBooking?.id?.slice(0, 8)}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedBooking && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Guest Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">
                        {selectedBooking.customer?.firstName} {selectedBooking.customer?.lastName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedBooking.customer?.email}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">
                        {selectedBooking.customer?.phone || 'Not provided'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Number of Guests</Typography>
                      <Typography variant="body1">{selectedBooking.guests}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Booking Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Check-in</Typography>
                      <Typography variant="body1">
                        {moment(selectedBooking.startDate).format('MMMM DD, YYYY')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Check-out</Typography>
                      <Typography variant="body1">
                        {moment(selectedBooking.endDate).format('MMMM DD, YYYY')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Nights</Typography>
                      <Typography variant="body1">{selectedBooking.nights}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Price</Typography>
                      <Typography variant="h6" sx={{ color: '#FF385C' }}>
                        ${selectedBooking.totalPrice?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog(false)}>Close</Button>
            {selectedBooking && (
              <Button
                variant="contained"
                startIcon={<MessageIcon />}
                onClick={() => {
                  setDetailsDialog(false);
                  handleContactGuest(selectedBooking);
                }}
              >
                Contact Guest
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Contact Guest Dialog */}
        <Dialog
          open={contactDialog}
          onClose={() => setContactDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Contact Guest
            <Typography variant="body2" color="text.secondary">
              {selectedBooking?.customer?.firstName} {selectedBooking?.customer?.lastName}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              multiline
              rows={6}
              fullWidth
              label="Message"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Type your message here..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!contactMessage.trim()}
              startIcon={<EmailIcon />}
            >
              Send Message
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
} 