'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  Divider,
  useTheme,
  Container,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Message as MessageIcon,
  Warning as WarningIcon,
  CheckCircle as ResolveIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BookingDisputePage() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [bookingReference, setBookingReference] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(null);
  const [resolution, setResolution] = useState('');
  const [resolutionType, setResolutionType] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const searchBooking = async () => {
    if (!bookingReference.trim()) {
      setError('Please enter a booking reference number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/bookings/${bookingReference}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Booking not found');
        } else {
          throw new Error('Failed to fetch booking');
        }
        return;
      }
      
      const data = await response.json();
      setBooking(data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!resolution.trim() || !resolutionType) {
      setError('Please provide resolution details and type');
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution,
          resolutionType,
          refundAmount: refundAmount ? parseFloat(refundAmount) : null,
        }),
      });

      if (response.ok) {
        // Refresh booking data
        searchBooking();
        setResolution('');
        setResolutionType('');
        setRefundAmount('');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      setError('Failed to resolve dispute');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'info';
      case 'DISPUTED': return 'error';
      default: return 'default';
    }
  };

  const getDisputeStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'error';
      case 'IN_PROGRESS': return 'warning';
      case 'RESOLVED': return 'success';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Booking Dispute Resolution
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search and resolve booking disputes by reference number
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Search Booking
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Booking Reference Number"
                placeholder="Enter booking reference (e.g., BK-2024-001)"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchBooking();
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={searchBooking}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                {loading ? 'Searching...' : 'Search Booking'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Disputes Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Disputes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Quick access to recently reported disputes
          </Typography>
          
          {/* Mock recent disputes - replace with actual data */}
          <Grid container spacing={2}>
            {[
              { ref: 'BK-2024-001', guest: 'John Doe', property: 'Sunset Villa', status: 'OPEN', date: '2024-01-15' },
              { ref: 'BK-2024-002', guest: 'Jane Smith', property: 'Ocean View Apt', status: 'IN_PROGRESS', date: '2024-01-14' },
              { ref: 'BK-2024-003', guest: 'Mike Johnson', property: 'Mountain Cabin', status: 'RESOLVED', date: '2024-01-13' },
            ].map((dispute, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      boxShadow: 2,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => {
                    setBookingReference(dispute.ref);
                    searchBooking();
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {dispute.ref}
                      </Typography>
                      <Chip
                        label={dispute.status}
                        color={getDisputeStatusColor(dispute.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Guest: {dispute.guest}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Property: {dispute.property}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reported: {formatDate(dispute.date)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Booking Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          {booking && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">
                      Booking Details - {booking.bookingRef}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {booking.property.name}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      icon={<AssignmentIcon />}
                    />
                    {booking.dispute && (
                      <Chip
                        label={`Dispute: ${booking.dispute.status}`}
                        color={getDisputeStatusColor(booking.dispute.status)}
                        icon={<WarningIcon />}
                      />
                    )}
                  </Stack>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab label="Overview" />
                  <Tab label="Guest & Property" />
                  <Tab label="Dispute Details" />
                  <Tab label="Resolution" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Booking Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Booking Reference</Typography>
                              <Typography variant="body2">{booking.bookingRef}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Check-in Date</Typography>
                              <Typography variant="body2">{formatDate(booking.startDate)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Check-out Date</Typography>
                              <Typography variant="body2">{formatDate(booking.endDate)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Guests</Typography>
                              <Typography variant="body2">{booking.guests} guests</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Status</Typography>
                              <Chip
                                label={booking.status}
                                color={getStatusColor(booking.status)}
                                size="small"
                              />
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Payment Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                              <Typography variant="h6" color="primary">
                                {formatCurrency(booking.price)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                              <Typography variant="body2">{booking.paymentStatus || 'PAID'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                              <Typography variant="body2">{booking.paymentMethod || 'Credit Card'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Booked On</Typography>
                              <Typography variant="body2">{formatDate(booking.createdAt)}</Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Guest Information
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ width: 56, height: 56 }}>
                              {booking.customer.firstName[0]}{booking.customer.lastName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">
                                {booking.customer.firstName} {booking.customer.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {booking.customer.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" />
                              <Typography variant="body2">{booking.customer.email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" />
                              <Typography variant="body2">{booking.customer.phone || 'Not provided'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" />
                              <Typography variant="body2">Member since {formatDate(booking.customer.createdAt)}</Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Property Information
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {booking.property.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {booking.property.address}
                            </Typography>
                          </Box>
                          <Stack spacing={1}>
                            <Typography variant="body2">
                              {booking.property.bedrooms} bedrooms • {booking.property.bathrooms} bathrooms
                            </Typography>
                            <Typography variant="body2">
                              Host: {booking.property.host.firstName} {booking.property.host.lastName}
                            </Typography>
                            <Typography variant="body2">
                              {booking.property.host.email}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  {booking.dispute ? (
                    <Box>
                      <Card sx={{ mb: 3 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                              Dispute Details
                            </Typography>
                            <Chip
                              label={booking.dispute.status}
                              color={getDisputeStatusColor(booking.dispute.status)}
                              icon={<WarningIcon />}
                            />
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" color="text.secondary">Reported by</Typography>
                              <Typography variant="body2">{booking.dispute.reportedBy}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" color="text.secondary">Reported on</Typography>
                              <Typography variant="body2">{formatDateTime(booking.dispute.reportedAt)}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">Issue Category</Typography>
                              <Typography variant="body2">{booking.dispute.category}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">Description</Typography>
                              <Typography variant="body2">{booking.dispute.description}</Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>

                      {booking.dispute.messages && booking.dispute.messages.length > 0 && (
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Communication History
                            </Typography>
                            <List>
                              {booking.dispute.messages.map((message, index) => (
                                <ListItem key={index} alignItems="flex-start">
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: message.sender === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main }}>
                                      {message.sender === 'admin' ? 'A' : message.sender[0].toUpperCase()}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle2">
                                          {message.sender === 'admin' ? 'Admin' : message.senderName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {formatDateTime(message.timestamp)}
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={message.content}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="info">
                      No dispute reported for this booking.
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  {booking.dispute && booking.dispute.status !== 'RESOLVED' ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Resolve Dispute
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Resolution Type</InputLabel>
                            <Select
                              value={resolutionType}
                              label="Resolution Type"
                              onChange={(e) => setResolutionType(e.target.value)}
                            >
                              <MenuItem value="FULL_REFUND">Full Refund</MenuItem>
                              <MenuItem value="PARTIAL_REFUND">Partial Refund</MenuItem>
                              <MenuItem value="NO_REFUND">No Refund</MenuItem>
                              <MenuItem value="REBOOKING">Rebooking</MenuItem>
                              <MenuItem value="COMPENSATION">Compensation</MenuItem>
                              <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          {(resolutionType === 'PARTIAL_REFUND' || resolutionType === 'COMPENSATION') && (
                            <TextField
                              fullWidth
                              label="Refund/Compensation Amount"
                              type="number"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              }}
                            />
                          )}
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Resolution Details"
                            placeholder="Provide detailed explanation of the resolution..."
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={handleResolveDispute}
                            startIcon={<ResolveIcon />}
                            disabled={!resolution.trim() || !resolutionType}
                          >
                            Resolve Dispute
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : booking.dispute?.resolution ? (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="success.main">
                          Dispute Resolved
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="caption" color="text.secondary">Resolution Type</Typography>
                            <Typography variant="body2">{booking.dispute.resolution.type}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="caption" color="text.secondary">Resolved on</Typography>
                            <Typography variant="body2">{formatDateTime(booking.dispute.resolution.resolvedAt)}</Typography>
                          </Grid>
                          {booking.dispute.resolution.amount && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" color="text.secondary">Amount</Typography>
                              <Typography variant="body2">{formatCurrency(booking.dispute.resolution.amount)}</Typography>
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Resolution Details</Typography>
                            <Typography variant="body2">{booking.dispute.resolution.details}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ) : (
                    <Alert severity="info">
                      No dispute to resolve for this booking.
                    </Alert>
                  )}
                </TabPanel>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </DashboardLayout>
  );
} 