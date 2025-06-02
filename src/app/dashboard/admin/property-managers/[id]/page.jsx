'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  Divider,
  useTheme,
  alpha,
  Container,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as ApproveIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  VerifiedUser as VerifiedIcon,
  PendingActions as PendingIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
  RateReview as ReviewIcon,
  BookOnline as BookingIcon,
  AccountBalance as BankIcon,
  Description as DocumentIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-manager-tabpanel-${index}`}
      aria-labelledby={`property-manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const StatCard = ({ title, value, icon, color, description, trend }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        background: theme.palette.background.paper,
        border: '1px solid',
        borderColor: alpha(color || '#FF385C', 0.1),
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
          background: color || '#FF385C',
          opacity: 0.8,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
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
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
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
                sx={{ 
                  width: 48,
                  height: 48,
                  background: alpha(color || '#FF385C', 0.1),
                  color: color || '#FF385C',
                  border: `2px solid ${alpha(color || '#FF385C', 0.1)}`,
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
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function PropertyManagerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [manager, setManager] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPropertyManagerDetails();
    }
  }, [params.id]);

  const fetchPropertyManagerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/property-managers/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property manager details');
      }
      const data = await response.json();
      setManager(data);
    } catch (error) {
      console.error('Error fetching property manager details:', error);
      setError('Failed to load property manager details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus || !statusReason.trim()) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/property-managers/${params.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          reason: statusReason 
        }),
      });

      if (response.ok) {
        await fetchPropertyManagerDetails();
        setStatusDialogOpen(false);
        setNewStatus('');
        setStatusReason('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return theme.palette.success.main;
      case 'PENDING_APPROVAL': return theme.palette.warning.main;
      case 'SUSPENDED': return theme.palette.error.main;
      case 'PENDING_VERIFICATION': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <VerifiedIcon />;
      case 'PENDING_APPROVAL': return <PendingIcon />;
      case 'SUSPENDED': return <BlockIcon />;
      case 'PENDING_VERIFICATION': return <SecurityIcon />;
      default: return <PersonIcon />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
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

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={48} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !manager) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error || 'Property manager not found'}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/admin/property-managers')}
            sx={{ mt: 2 }}
          >
            Back to Property Managers
          </Button>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/admin/property-managers')}
            sx={{ mb: 2 }}
          >
            Back to Property Managers
          </Button>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#FF385C', 0.05)} 0%, ${alpha('#FF385C', 0.02)} 100%)`,
              border: `1px solid ${alpha('#FF385C', 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Avatar 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: getStatusColor(manager.status),
                        border: `2px solid ${theme.palette.background.paper}`,
                      }}
                    >
                      {getStatusIcon(manager.status)}
                    </Avatar>
                  }
                >
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80,
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      background: `linear-gradient(135deg, #FF385C 0%, #E61E4D 100%)`,
                      color: 'white',
                    }}
                  >
                    {manager.firstName?.[0]}{manager.lastName?.[0]}
                  </Avatar>
                </Badge>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {manager.firstName} {manager.lastName}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {manager.businessName || 'Individual Property Manager'}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    label={manager.status || 'PENDING'}
                    color={manager.status === 'ACTIVE' ? 'success' : manager.status === 'SUSPENDED' ? 'error' : 'warning'}
                    icon={getStatusIcon(manager.status)}
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Member since {formatDate(manager.createdAt)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setStatusDialogOpen(true)}
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<EmailIcon />}
                    sx={{
                      background: '#FF385C',
                      '&:hover': { background: '#E61E4D' },
                    }}
                  >
                    Contact Manager
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Properties"
              value={manager.properties?.total || 0}
              icon={<ApartmentIcon />}
              color={theme.palette.primary.main}
              description={`${manager.properties?.active || 0} active`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Monthly Revenue"
              value={formatCurrency(manager.monthlyRevenue)}
              icon={<MoneyIcon />}
              color={theme.palette.success.main}
              description="This month"
              trend="+12.5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bookings"
              value={manager.totalBookings || 0}
              icon={<BookingIcon />}
              color={theme.palette.info.main}
              description="All time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Rating"
              value={manager.averageRating ? manager.averageRating.toFixed(1) : 'N/A'}
              icon={<StarIcon />}
              color={theme.palette.warning.main}
              description="Property ratings"
            />
          </Grid>
        </Grid>

        {/* Detailed Information Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                },
              }}
            >
              <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
              <Tab icon={<ApartmentIcon />} label="Properties" iconPosition="start" />
              <Tab icon={<AssessmentIcon />} label="Analytics" iconPosition="start" />
              <Tab icon={<BookingIcon />} label="Bookings" iconPosition="start" />
              <Tab icon={<DocumentIcon />} label="Documents" iconPosition="start" />
              <Tab icon={<TimelineIcon />} label="Activity" iconPosition="start" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              {/* Contact Information */}
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="primary" />
                      Contact Information
                    </Typography>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Email Address
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body1">{manager.email}</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Phone Number
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body1">{manager.phone || 'Not provided'}</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Location
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body1">
                            {manager.address ? 
                              `${manager.address.city}, ${manager.address.state}, ${manager.address.country}` : 
                              'Not provided'
                            }
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Member Since
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body1">{formatDate(manager.createdAt)}</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Business Information */}
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="primary" />
                      Business Information
                    </Typography>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Business Name
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {manager.businessName || 'Individual'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Business Type
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {manager.businessType || 'Personal'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Tax ID
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {manager.taxId || 'Not provided'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Business License
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {manager.businessLicense || 'Not provided'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Verification Status */}
              <Grid item xs={12}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SecurityIcon color="primary" />
                      Verification Status
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Avatar sx={{ 
                            width: 48, 
                            height: 48, 
                            mx: 'auto', 
                            mb: 1,
                            bgcolor: manager.emailVerified ? 'success.main' : 'grey.300',
                            color: 'white'
                          }}>
                            <EmailIcon />
                          </Avatar>
                          <Typography variant="subtitle2">Email</Typography>
                          <Chip 
                            label={manager.emailVerified ? 'Verified' : 'Pending'} 
                            color={manager.emailVerified ? 'success' : 'default'}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Avatar sx={{ 
                            width: 48, 
                            height: 48, 
                            mx: 'auto', 
                            mb: 1,
                            bgcolor: manager.phoneVerified ? 'success.main' : 'grey.300',
                            color: 'white'
                          }}>
                            <PhoneIcon />
                          </Avatar>
                          <Typography variant="subtitle2">Phone</Typography>
                          <Chip 
                            label={manager.phoneVerified ? 'Verified' : 'Pending'} 
                            color={manager.phoneVerified ? 'success' : 'default'}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Avatar sx={{ 
                            width: 48, 
                            height: 48, 
                            mx: 'auto', 
                            mb: 1,
                            bgcolor: manager.documentsSubmitted ? 'success.main' : 'grey.300',
                            color: 'white'
                          }}>
                            <DocumentIcon />
                          </Avatar>
                          <Typography variant="subtitle2">Documents</Typography>
                          <Chip 
                            label={manager.documentsSubmitted ? 'Submitted' : 'Pending'} 
                            color={manager.documentsSubmitted ? 'success' : 'default'}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Avatar sx={{ 
                            width: 48, 
                            height: 48, 
                            mx: 'auto', 
                            mb: 1,
                            bgcolor: manager.backgroundCheckPassed ? 'success.main' : 'grey.300',
                            color: 'white'
                          }}>
                            <SecurityIcon />
                          </Avatar>
                          <Typography variant="subtitle2">Background</Typography>
                          <Chip 
                            label={manager.backgroundCheckPassed ? 'Passed' : 'Pending'} 
                            color={manager.backgroundCheckPassed ? 'success' : 'default'}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Properties ({manager.properties?.total || 0})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and view all properties owned by this property manager
              </Typography>
            </Box>
            
            {manager.properties?.list?.length > 0 ? (
              <Grid container spacing={3}>
                {manager.properties.list.map((property) => (
                  <Grid item xs={12} md={6} lg={4} key={property.id}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        border: 1, 
                        borderColor: 'divider', 
                        borderRadius: 3,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 200,
                          backgroundImage: property.photos?.[0] ? `url(${property.photos[0]})` : 'linear-gradient(135deg, #FF385C 0%, #E61E4D 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {!property.photos?.[0] && (
                          <HomeIcon sx={{ fontSize: 48, color: 'white', opacity: 0.7 }} />
                        )}
                        <Chip
                          label={property.status}
                          color={property.status === 'ACTIVE' ? 'success' : 'default'}
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {property.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {property.address}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <Typography variant="caption">
                            {property.bedrooms} bed
                          </Typography>
                          <Typography variant="caption">
                            {property.bathrooms} bath
                          </Typography>
                          <Typography variant="caption">
                            {property.guests} guests
                          </Typography>
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {formatCurrency(property.price)}/night
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => router.push(`/dashboard/admin/properties/${property.id}`)}
                          >
                            View
                          </Button>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {property.bookings || 0} total bookings
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                No properties found for this property manager.
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={4}>
              {/* Revenue Chart Placeholder */}
              <Grid item xs={12} lg={8}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Revenue Trends
                    </Typography>
                    <Box sx={{ 
                      height: 300, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Revenue chart will be displayed here
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance Metrics */}
              <Grid item xs={12} lg={4}>
                <Stack spacing={3}>
                  <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Performance Metrics
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Occupancy Rate</Typography>
                            <Typography variant="body2" fontWeight="bold">78%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={78} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Response Rate</Typography>
                            <Typography variant="body2" fontWeight="bold">92%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={92} 
                            color="success"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Guest Satisfaction</Typography>
                            <Typography variant="body2" fontWeight="bold">4.6/5</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={92} 
                            color="warning"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Quick Stats
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Total Revenue</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(manager.totalRevenue || 0)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Avg. Booking Value</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(manager.avgBookingValue || 0)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Repeat Guests</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {manager.repeatGuestRate || 0}%
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Latest booking activity for this property manager's properties
            </Typography>
            
            {/* Booking list placeholder */}
            <Alert severity="info">
              Booking history will be displayed here. This would show recent bookings, their status, and guest information.
            </Alert>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Verification Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review and manage submitted verification documents
            </Typography>
            
            <Grid container spacing={3}>
              {[
                { name: 'Business License', status: manager.documentsSubmitted ? 'Submitted' : 'Not submitted', type: 'PDF' },
                { name: 'Tax Documents', status: manager.documentsSubmitted ? 'Submitted' : 'Not submitted', type: 'PDF' },
                { name: 'Insurance Certificate', status: manager.documentsSubmitted ? 'Submitted' : 'Not submitted', type: 'PDF' },
                { name: 'ID Verification', status: manager.documentsSubmitted ? 'Submitted' : 'Not submitted', type: 'Image' },
              ].map((doc, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Avatar sx={{ 
                        width: 48, 
                        height: 48, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: doc.status === 'Submitted' ? 'success.main' : 'grey.300',
                        color: 'white'
                      }}>
                        <DocumentIcon />
                      </Avatar>
                      <Typography variant="subtitle2" gutterBottom>
                        {doc.name}
                      </Typography>
                      <Chip 
                        label={doc.status} 
                        color={doc.status === 'Submitted' ? 'success' : 'default'}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        {doc.type}
                      </Typography>
                      {doc.status === 'Submitted' && (
                        <Button size="small" sx={{ mt: 1 }}>
                          View Document
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Recent activity and important events for this property manager
            </Typography>
            
            <List>
              {[
                { action: 'Account created', date: manager.createdAt, icon: <PersonIcon /> },
                { action: 'Email verified', date: manager.createdAt, icon: <EmailIcon /> },
                { action: 'First property listed', date: manager.createdAt, icon: <HomeIcon /> },
                { action: 'Documents submitted', date: manager.createdAt, icon: <DocumentIcon /> },
              ].map((activity, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {activity.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.action}
                    secondary={formatDateTime(activity.date)}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>
        </Paper>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Property Manager Status</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                <MenuItem value="PENDING_VERIFICATION">Pending Verification</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason for status change"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Provide a reason for this status change..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleStatusChange}
              disabled={!newStatus || !statusReason.trim() || updating}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
} 