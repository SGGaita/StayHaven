'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Avatar,
  Rating,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Badge,
  Container,
  useTheme,
  alpha,
  Skeleton,
  ListItemIcon,
  ListItemText,
  Divider,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Flag as FlagIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Apartment as ApartmentIcon,
  Villa as VillaIcon,
  Business as BusinessIcon,
  Pending as PendingIcon,
  Verified as VerifiedIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  PhotoLibrary as PhotoIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const propertyStatusConfig = {
  ACTIVE: { 
    color: 'success', 
    icon: <VerifiedIcon />, 
    label: 'Active',
    description: 'Live and bookable'
  },
  PENDING: { 
    color: 'warning', 
    icon: <PendingIcon />, 
    label: 'Pending',
    description: 'Awaiting approval'
  },
  REJECTED: { 
    color: 'error', 
    icon: <ErrorIcon />, 
    label: 'Rejected',
    description: 'Not approved'
  },
  MAINTENANCE: { 
    color: 'info', 
    icon: <BusinessIcon />, 
    label: 'Maintenance',
    description: 'Under maintenance'
  },
  ARCHIVED: { 
    color: 'default', 
    icon: <FlagIcon />, 
    label: 'Archived',
    description: 'No longer active'
  },
};

const propertyTypeIcons = {
  'Apartment': <ApartmentIcon />,
  'House': <HomeIcon />,
  'Villa': <VillaIcon />,
  'Condo': <ApartmentIcon />,
  'Cabin': <HomeIcon />,
  'Beach House': <HomeIcon />,
  'Mountain Retreat': <HomeIcon />,
};

const propertyTypes = [
  'All Types',
  'Apartment',
  'House',
  'Villa',
  'Condo',
  'Cabin',
  'Beach House',
  'Mountain Retreat',
];

// Statistics Card Component
const StatCard = ({ title, value, icon, color, trend, description, onClick }) => {
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
        } : {},
      }}
      onClick={onClick}
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
          </Box>
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                icon={<TrendingUpIcon fontSize="small" />}
                label={trend}
                color="success"
                sx={{ 
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                vs last month
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Enhanced Property Card Component
const PropertyCard = ({ property, onActionClick, onViewClick, onApprove, onReject }) => {
  const theme = useTheme();
  const statusInfo = propertyStatusConfig[property.status] || propertyStatusConfig.PENDING;
  
  return (
    <Card 
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha('#FF385C', 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha('#FF385C', 0.15)}`,
          borderColor: alpha('#FF385C', 0.3),
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={property.photos?.[0] || '/placeholder-property.jpg'}
          alt={property.name}
          sx={{ 
            borderRadius: '12px 12px 0 0',
            objectFit: 'cover',
          }}
        />
        <Box sx={{ 
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 1,
        }}>
          <Chip
            icon={statusInfo.icon}
            label={statusInfo.label}
            size="small"
            color={statusInfo.color}
            sx={{ 
              fontWeight: 600,
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(8px)',
            }}
          />
        </Box>
        <Box sx={{ 
          position: 'absolute',
          bottom: 12,
          left: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
        }}>
          {propertyTypeIcons[property.propertyType] || <HomeIcon />}
          <Typography variant="caption" fontWeight="medium">
            {property.propertyType}
          </Typography>
        </Box>
      </Box>
      
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                cursor: 'pointer',
                '&:hover': { color: '#FF385C' },
                transition: 'color 0.2s ease-in-out',
              }}
              onClick={() => onViewClick(property)}
            >
              {property.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {property.location}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography 
                variant="body2" 
                color="primary"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {`${property.manager?.firstName || 'Unknown'} ${property.manager?.lastName || 'Manager'}`}
              </Typography>
            </Box>
          </Box>
          
          {property.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={property.rating} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                ({property.reviewCount || 0} reviews)
              </Typography>
            </Box>
          )}
          
          {property.pricePerNight && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon fontSize="small" color="action" />
              <Typography variant="h6" fontWeight="bold" color="success.main">
                ${property.pricePerNight}/night
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
      
      <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onViewClick(property)}
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
          
          {property.status === 'PENDING' && (
            <>
              <Tooltip title="Approve Property">
                <IconButton
                  size="small"
                  onClick={() => onApprove(property)}
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.success.main, 0.2),
                    },
                  }}
                >
                  <ApproveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject Property">
                <IconButton
                  size="small"
                  onClick={() => onReject(property)}
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.2),
                    },
                  }}
                >
                  <RejectIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
        
        <Tooltip title="More Actions">
          <IconButton
            size="small"
            onClick={(e) => onActionClick(e, property)}
            sx={{
              '&:hover': {
                backgroundColor: alpha('#FF385C', 0.1),
                color: '#FF385C',
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

// Enhanced Property Detail Dialog
const PropertyDetailDialog = ({ open, property, onClose }) => {
  const theme = useTheme();
  
  if (!property) return null;

  const statusInfo = propertyStatusConfig[property.status] || propertyStatusConfig.PENDING;

  return (
    <Dialog 
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme.palette.background.paper,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
        borderBottom: `1px solid ${alpha('#FF385C', 0.1)}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={property.photos?.[0]}
              variant="rounded"
              sx={{ 
                width: 56, 
                height: 56,
                borderRadius: 2,
                border: `2px solid ${alpha('#FF385C', 0.1)}`,
              }}
            >
              <HomeIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {property.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {property.location}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Property Images */}
          {property.photos && property.photos.length > 0 && (
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${alpha('#FF385C', 0.1)}`,
                  background: alpha('#FF385C', 0.01),
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhotoIcon color="primary" />
                  Property Photos
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                  {property.photos.map((photo, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={photo}
                      alt={`${property.name} - Photo ${index + 1}`}
                      sx={{
                        width: 120,
                        height: 80,
                        borderRadius: 2,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: `1px solid ${alpha('#FF385C', 0.1)}`,
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: `1px solid ${alpha('#FF385C', 0.1)}`,
                background: alpha('#FF385C', 0.01),
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeIcon color="primary" />
                Property Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Property Type</Typography>
                  <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {propertyTypeIcons[property.propertyType] || <HomeIcon />}
                    <Typography variant="body2">{property.propertyType}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      icon={statusInfo.icon}
                      label={statusInfo.label}
                      color={statusInfo.color}
                      size="small"
                    />
                  </Box>
                </Box>
                {property.pricePerNight && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Price per Night</Typography>
                    <Typography variant="h6" sx={{ mt: 0.5, color: 'success.main', fontWeight: 'bold' }}>
                      ${property.pricePerNight}
                    </Typography>
                  </Box>
                )}
                {property.rating && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Rating</Typography>
                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={property.rating} readOnly size="small" />
                      <Typography variant="body2">
                        {property.rating} ({property.reviewCount || 0} reviews)
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Property Manager */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: `1px solid ${alpha('#FF385C', 0.1)}`,
                background: alpha('#FF385C', 0.01),
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Property Manager
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 48, 
                      height: 48,
                      background: `linear-gradient(135deg, #FF385C, #E61E4D)`,
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {property.manager?.firstName?.[0]}{property.manager?.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {property.manager?.firstName} {property.manager?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {property.manager?.email}
                    </Typography>
                  </Box>
                </Box>
                {property.createdAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Listed Date</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {new Date(property.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Description */}
          {property.description && (
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${alpha('#FF385C', 0.1)}`,
                  background: alpha('#FF385C', 0.01),
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {property.description}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          startIcon={<ViewIcon />}
          onClick={() => window.open(`/properties/${property.id}`, '_blank')}
          sx={{ borderRadius: 2 }}
        >
          View Public Page
        </Button>
        <Button
          startIcon={<EditIcon />}
          color="primary"
          sx={{ borderRadius: 2 }}
        >
          Edit Property
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: 2,
            background: '#FF385C',
            '&:hover': {
              background: '#E61E4D',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function PropertiesManagement() {
  const theme = useTheme();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    newThisMonth: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, [page, rowsPerPage, searchQuery, filterType, filterStatus]);

  const fetchProperties = async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        search: searchQuery,
      });

      if (filterType !== 'All Types') {
        params.append('type', filterType);
      }
      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/admin/properties?${params}`, { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err) {
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats for now - replace with actual API call
      setStats({
        total: 156,
        active: 142,
        pending: 8,
        rejected: 6,
        newThisMonth: 23,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleActionClick = (event, property) => {
    setSelectedProperty(property);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
  };

  const handleViewClick = (property) => {
    setSelectedProperty(property);
    setViewDialogOpen(true);
    setActionMenuAnchor(null);
  };

  const handleDeleteClick = () => {
    setActionMenuAnchor(null);
    setDeleteDialogOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleApproveProperty = async (property) => {
    try {
      const response = await fetch(`/api/admin/properties/${property.id}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve property');
      }

      await fetchProperties();
      await fetchStats();
      showSnackbar('Property approved successfully', 'success');
    } catch (err) {
      showSnackbar(err.message || 'Failed to approve property', 'error');
    }
    setActionMenuAnchor(null);
  };

  const handleRejectProperty = async (property) => {
    try {
      const response = await fetch(`/api/admin/properties/${property.id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject property');
      }

      await fetchProperties();
      await fetchStats();
      showSnackbar('Property rejected successfully', 'success');
    } catch (err) {
      showSnackbar(err.message || 'Failed to reject property', 'error');
    }
    setActionMenuAnchor(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={500} height={24} />
          </Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            {[...Array(8)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#FF385C' }}>
            Property Management 🏠
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Oversee and manage all property listings on the platform
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Properties"
              value={stats.total.toLocaleString()}
              icon={<HomeIcon />}
              description="All listings"
              trend="+8.2%"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Active Properties"
              value={stats.active.toLocaleString()}
              icon={<VerifiedIcon />}
              description="Live & bookable"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Pending Approval"
              value={stats.pending.toLocaleString()}
              icon={<PendingIcon />}
              description="Awaiting review"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="New This Month"
              value={stats.newThisMonth.toLocaleString()}
              icon={<TrendingUpIcon />}
              description="Recent listings"
              trend="+15.3%"
            />
          </Grid>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchProperties}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Filters and Search */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha('#FF385C', 0.1)}`,
            background: alpha('#FF385C', 0.01),
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search properties..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={handleFilterChange}
                  label="Property Type"
                  sx={{ borderRadius: 2 }}
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={handleStatusFilterChange}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title="Refresh">
                  <IconButton 
                    onClick={fetchProperties}
                    sx={{
                      backgroundColor: alpha('#FF385C', 0.1),
                      color: '#FF385C',
                      '&:hover': {
                        backgroundColor: alpha('#FF385C', 0.2),
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton 
                    sx={{
                      backgroundColor: alpha('#FF385C', 0.1),
                      color: '#FF385C',
                      '&:hover': {
                        backgroundColor: alpha('#FF385C', 0.2),
                      },
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Properties Grid */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha('#FF385C', 0.1)}`,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
            borderBottom: `1px solid ${alpha('#FF385C', 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Properties ({properties.length.toLocaleString()})
              </Typography>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {properties.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
                borderRadius: 3,
                border: `2px dashed ${alpha('#FF385C', 0.2)}`,
              }}>
                <HomeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No properties found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria or filters
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {properties.map((property) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
                    <PropertyCard
                      property={property}
                      onActionClick={handleActionClick}
                      onViewClick={handleViewClick}
                      onApprove={handleApproveProperty}
                      onReject={handleRejectProperty}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Pagination */}
          {properties.length > 0 && (
            <Box sx={{ 
              p: 2, 
              borderTop: `1px solid ${alpha('#FF385C', 0.1)}`,
              background: alpha('#FF385C', 0.01),
            }}>
              <TablePagination
                component="div"
                count={stats.total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[8, 12, 24, 48]}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                }}
              />
            </Box>
          )}
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 200,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            }
          }}
        >
          <MenuItem onClick={() => handleViewClick(selectedProperty)}>
            <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit Property</ListItemText>
          </MenuItem>
          {selectedProperty?.status === 'PENDING' && (
            <>
              <Divider />
              <MenuItem 
                onClick={() => handleApproveProperty(selectedProperty)}
                sx={{ color: 'success.main' }}
              >
                <ListItemIcon><ApproveIcon fontSize="small" color="success" /></ListItemIcon>
                <ListItemText>Approve Property</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => handleRejectProperty(selectedProperty)}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon><RejectIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Reject Property</ListItemText>
              </MenuItem>
            </>
          )}
          <Divider />
          <MenuItem 
            onClick={handleDeleteClick}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete Property</ListItemText>
          </MenuItem>
        </Menu>

        {/* Property Detail Dialog */}
        <PropertyDetailDialog
          open={viewDialogOpen}
          property={selectedProperty}
          onClose={() => setViewDialogOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>Delete Property</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this property? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              sx={{ borderRadius: 2 }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
} 