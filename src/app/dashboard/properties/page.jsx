'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  CircularProgress,
  Alert,
  Checkbox,
  Divider,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Analytics as AnalyticsIcon,
  CalendarMonth as CalendarIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Apartment as ApartmentIcon,
  House as HouseIcon,
  Villa as VillaIcon,
  Home as HomeIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  SortByAlpha as SortIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  EventAvailable as AvailableIcon,
  EventBusy as BusyIcon,
  TrendingUp as TrendingUpIcon,
  BookOnline as BookingIcon,
  CorporateFare as CorporateFareIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { selectCurrentUser } from '@/redux/features/authSlice';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'rating', label: 'Rating' },
];

const propertyTypes = [
  'Apartment',
  'House',
  'Villa',
  'Condo',
  'Cabin',
  'Beach House',
  'Mountain Retreat',
];

const propertyStatuses = [
  { value: 'ACTIVE', label: 'Active', color: 'success' },
  { value: 'PENDING', label: 'Pending', color: 'warning' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'error' },
  { value: 'ARCHIVED', label: 'Archived', color: 'default' },
];

const PropertyCard = ({ property, onEdit, onDelete, onViewAnalytics, onManageCalendar }) => {
  const router = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [imageError, setImageError] = useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getPropertyIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'apartment':
        return <ApartmentIcon />;
      case 'house':
        return <HouseIcon />;
      case 'villa':
        return <VillaIcon />;
      case 'loft':
        return <CorporateFareIcon />;
      default:
        return <HomeIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'success', bg: '#e8f5e8', text: '#2e7d32' };
      case 'INACTIVE':
        return { color: 'error', bg: '#ffebee', text: '#d32f2f' };
      case 'PENDING':
        return { color: 'warning', bg: '#fff3e0', text: '#f57c00' };
      default:
        return { color: 'default', bg: '#f5f5f5', text: '#757575' };
    }
  };

  const statusConfig = getStatusColor(property.status);
  const propertyImage = (property.photos && property.photos.length > 0) 
    ? property.photos[0] 
    : '/api/placeholder/400/300';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
          borderColor: alpha('#FF385C', 0.4),
          '& .property-image': {
            transform: 'scale(1.05)',
          },
          '& .property-overlay': {
            opacity: 1,
          },
          '& .quick-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
      onClick={(e) => {
        if (!anchorEl) {
          router.push(`/dashboard/properties/${property.id}`);
        }
      }}
    >
      {/* Image Section */}
      <Box sx={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          className="property-image"
          height="220"
          image={imageError ? '/api/placeholder/400/300' : propertyImage}
          alt={property.name}
          onError={() => setImageError(true)}
          sx={{
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />
        
        {/* Gradient Overlay */}
        <Box
          className="property-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha('#000', 0.1)} 0%, ${alpha('#FF385C', 0.1)} 100%)`,
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />

        {/* Status Badge */}
        <Chip
          label={property.status || 'ACTIVE'}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            fontWeight: 700,
            fontSize: '0.75rem',
            backgroundColor: statusConfig.bg,
            color: statusConfig.text,
            border: 'none',
            boxShadow: `0 4px 12px ${alpha(statusConfig.text, 0.2)}`,
            '& .MuiChip-label': {
              px: 1.5,
            },
          }}
        />

        {/* Price Tag */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: `linear-gradient(135deg, ${alpha('#FF385C', 0.95)}, ${alpha('#E31E24', 0.95)})`,
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            px: 2,
            py: 1,
            boxShadow: `0 4px 16px ${alpha('#FF385C', 0.3)}`,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', fontSize: '1rem' }}>
            ${property.price || property.pricePerNight || 0}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem' }}>
            /night
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Box
          className="quick-actions"
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            gap: 1,
            opacity: 0,
            transform: 'translateY(10px)',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Tooltip title="View Analytics">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onViewAnalytics(property);
              }}
              sx={{
                backgroundColor: alpha('#fff', 0.9),
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: '#fff', transform: 'scale(1.1)' },
              }}
            >
              <AnalyticsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Calendar">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onManageCalendar(property);
              }}
              sx={{
                backgroundColor: alpha('#fff', 0.9),
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: '#fff', transform: 'scale(1.1)' },
              }}
            >
              <CalendarIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Actions">
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: alpha('#fff', 0.9),
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: '#fff', transform: 'scale(1.1)' },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Property Type Icon */}
        <Avatar
          sx={{
            position: 'absolute',
            bottom: -24,
            left: 20,
            bgcolor: `linear-gradient(135deg, #FF385C, #E31E24)`,
            color: 'white',
            border: '4px solid white',
            width: 48,
            height: 48,
            boxShadow: `0 4px 16px ${alpha('#FF385C', 0.3)}`,
          }}
        >
          {getPropertyIcon(property.propertyType)}
        </Avatar>
      </Box>

      <CardContent sx={{ pt: 4, pb: 3, px: 3 }}>
        <Stack spacing={2.5}>
          {/* Property Header */}
          <Box>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                color: theme.palette.text.primary,
                fontSize: '1.1rem',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {property.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <LocationIcon fontSize="small" sx={{ color: '#FF385C' }} />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {property.location || property.address || 'Location not specified'}
              </Typography>
            </Box>
          </Box>

          {/* Property Features */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BedIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" fontWeight="600">
                {property.bedrooms || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                beds
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BathtubIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" fontWeight="600">
                {property.bathrooms || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                baths
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" fontWeight="600">
                {property.maxGuests || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                guests
              </Typography>
            </Box>
          </Box>

          {/* Rating and Reviews */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon fontSize="small" sx={{ color: '#FFD700' }} />
                <Typography variant="body2" fontWeight="700" sx={{ color: theme.palette.text.primary }}>
                  {property.averageRating?.toFixed(1) || '0.0'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                ({property.totalReviews || property.reviewCount || 0} reviews)
              </Typography>
            </Box>
            <Chip
              label={property.propertyType || 'Property'}
              size="small"
              sx={{
                backgroundColor: alpha('#FF385C', 0.1),
                color: '#FF385C',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: `1px solid ${alpha('#FF385C', 0.2)}`,
              }}
            />
          </Box>

          {/* Performance Metrics */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              pt: 2,
              borderTop: `2px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#FF385C', fontSize: '1rem' }}>
                {property.totalBookings !== undefined ? property.totalBookings : 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Bookings
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#28A745', fontSize: '1rem' }}>
                ${property.monthlyRevenue !== undefined ? property.monthlyRevenue.toLocaleString() : '0'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Revenue
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#17A2B8', fontSize: '1rem' }}>
                {property.occupancyRate !== undefined ? property.occupancyRate : 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Occupancy
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            mt: 1,
          },
        }}
      >
        <MenuItem 
          onClick={() => { 
            handleMenuClose(); 
            router.push(`/properties/${property.id}`); 
          }}
          sx={{ borderRadius: 2, mx: 1, my: 0.5 }}
        >
          <ViewIcon sx={{ mr: 2, color: '#FF385C' }} fontSize="small" />
          <Typography fontWeight="600">View Public Page</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            handleMenuClose(); 
            onEdit(property); 
          }}
          sx={{ borderRadius: 2, mx: 1, my: 0.5 }}
        >
          <EditIcon sx={{ mr: 2, color: theme.palette.info.main }} fontSize="small" />
          <Typography fontWeight="600">Edit Property</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            handleMenuClose(); 
            onViewAnalytics(property); 
          }}
          sx={{ borderRadius: 2, mx: 1, my: 0.5 }}
        >
          <AnalyticsIcon sx={{ mr: 2, color: theme.palette.success.main }} fontSize="small" />
          <Typography fontWeight="600">View Analytics</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            handleMenuClose(); 
            onManageCalendar(property); 
          }}
          sx={{ borderRadius: 2, mx: 1, my: 0.5 }}
        >
          <CalendarIcon sx={{ mr: 2, color: theme.palette.warning.main }} fontSize="small" />
          <Typography fontWeight="600">Manage Calendar</Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem 
          onClick={() => { 
            handleMenuClose(); 
            onDelete(property); 
          }} 
          sx={{ 
            borderRadius: 2, 
            mx: 1, 
            my: 0.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <DeleteIcon sx={{ mr: 2 }} fontSize="small" />
          <Typography fontWeight="600">Delete Property</Typography>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default function PropertiesPage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [quickStats, setQuickStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalRevenue: 0,
    averageOccupancy: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchQuickStats();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/dashboard/properties', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const data = await response.json();
      
      // Handle the new API response structure
      if (data.success && data.properties) {
        setProperties(data.properties);
      } else if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const response = await fetch('/api/dashboard/properties/stats', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Handle the new API response structure
        if (data.success && data.stats) {
          setQuickStats(data.stats);
        } else {
          setQuickStats(data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMenuOpen = (event, property) => {
    setAnchorEl(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProperty(null);
  };

  const handlePropertyAction = async (action) => {
    if (!selectedProperty) return;

    switch (action) {
      case 'edit':
        router.push(`/dashboard/properties/${selectedProperty.id}/edit`);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this property?')) {
          try {
            await fetch(`/api/properties/${selectedProperty.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${user?.id || ''}`,
                'X-User-Role': user?.role || ''
              },
              credentials: 'include'
            });
            fetchProperties();
          } catch (error) {
            console.error('Error deleting property:', error);
          }
        }
        break;
      case 'view':
        router.push(`/properties/${selectedProperty.id}`);
        break;
      default:
        break;
    }
    handleMenuClose();
  };

  const handleBulkActionOpen = (event) => {
    setBulkActionAnchor(event.currentTarget);
  };

  const handleBulkActionClose = () => {
    setBulkActionAnchor(null);
  };

  const handlePropertySelect = (propertyId) => {
    setSelectedProperties((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }
      return [...prev, propertyId];
    });
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map((p) => p.id));
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      setLoading(true);
      const promises = selectedProperties.map((propertyId) =>
        fetch(`/api/properties/${propertyId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id || ''}`,
            'X-User-Role': user?.role || ''
          },
          body: JSON.stringify({ status }),
          credentials: 'include'
        })
      );

      await Promise.all(promises);
      await fetchProperties();
      setSelectedProperties([]);
    } catch (error) {
      setError('Failed to update property statuses');
    } finally {
      setLoading(false);
      handleBulkActionClose();
    }
  };

  const handleEdit = (property) => {
    router.push(`/dashboard/properties/${property.id}/edit`);
  };

  const handleDelete = (property) => {
    setSelectedProperty(property);
    setDeleteDialog(true);
  };

  const handleViewAnalytics = (property) => {
    router.push(`/dashboard/properties/analytics?propertyId=${property.id}`);
  };

  const handleManageCalendar = (property) => {
    router.push(`/dashboard/properties/calendar?propertyId=${property.id}`);
  };

  const confirmDelete = async () => {
    if (!selectedProperty) return;

    try {
      const response = await fetch(`/api/dashboard/properties/${selectedProperty.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setProperties(properties.filter(p => p.id !== selectedProperty.id));
        setDeleteDialog(false);
        setSelectedProperty(null);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Properties
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchProperties}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </DashboardLayout>
    );
  }

  const filteredProperties = properties
    .filter((property) => {
      const matchesSearch = !searchTerm || 
        (property.name && property.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = !filterType || property.propertyType === filterType;
      const matchesStatus = !filterStatus || property.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'rating':
          return (b.avgRating || 0) - (a.avgRating || 0);
        default:
          return 0;
      }
    });

  // Debug logging
  console.log('Properties data:', properties);
  console.log('Filter values:', { searchTerm, filterType, filterStatus });
  console.log('Filtered properties:', filteredProperties);

  return (
    <DashboardLayout>
      {/* Hero Header Section */}
      <Box 
        sx={{ 
          mb: 4,
          background: `linear-gradient(135deg, ${alpha('#FF385C', 0.05)} 0%, ${alpha('#E31E24', 0.08)} 100%)`,
          borderRadius: 4,
          p: 4,
          border: `1px solid ${alpha('#FF385C', 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              sx={{ 
                background: `linear-gradient(135deg, #FF385C, #E31E24)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Properties
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Manage your property portfolio with ease
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {selectedProperties.length > 0 && (
              <Button
                variant="outlined"
                onClick={handleBulkActionOpen}
                startIcon={<FilterIcon />}
                sx={{
                  borderRadius: 3,
                  borderColor: alpha('#FF385C', 0.3),
                  color: '#FF385C',
                  '&:hover': {
                    borderColor: '#FF385C',
                    backgroundColor: alpha('#FF385C', 0.05),
                  },
                }}
              >
                Bulk Actions ({selectedProperties.length})
              </Button>
            )}
            {user?.role === 'PROPERTY_MANAGER' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/properties/new')}
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, #FF385C, #E31E24)`,
                  textTransform: 'none',
                  py: 1.5,
                  px: 3,
                  fontWeight: 600,
                  boxShadow: `0 4px 16px ${alpha('#FF385C', 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, #E31E24, #C2185B)`,
                    boxShadow: `0 6px 20px ${alpha('#FF385C', 0.4)}`,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Add New Property
              </Button>
            )}
          </Box>
        </Box>

        {/* Quick Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${alpha('#FF385C', 0.1)}, ${alpha('#E31E24', 0.05)})`,
                border: `1px solid ${alpha('#FF385C', 0.2)}`,
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha('#FF385C', 0.15)}`,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: `linear-gradient(135deg, #FF385C, #E31E24)`,
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: `0 4px 16px ${alpha('#FF385C', 0.3)}`,
                }}
              >
                <HomeIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#FF385C', mb: 0.5 }}>
                {quickStats?.totalProperties || properties.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                Total Properties
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${alpha('#28A745', 0.1)}, ${alpha('#20C997', 0.05)})`,
                border: `1px solid ${alpha('#28A745', 0.2)}`,
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha('#28A745', 0.15)}`,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: `linear-gradient(135deg, #28A745, #20C997)`,
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: `0 4px 16px ${alpha('#28A745', 0.3)}`,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#28A745', mb: 0.5 }}>
                {quickStats?.activeProperties || properties.filter(p => p.status === 'ACTIVE').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                Active Listings
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${alpha('#17A2B8', 0.1)}, ${alpha('#6F42C1', 0.05)})`,
                border: `1px solid ${alpha('#17A2B8', 0.2)}`,
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha('#17A2B8', 0.15)}`,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: `linear-gradient(135deg, #17A2B8, #6F42C1)`,
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: `0 4px 16px ${alpha('#17A2B8', 0.3)}`,
                }}
              >
                <MoneyIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#17A2B8', mb: 0.5 }}>
                ${(quickStats?.monthlyRevenue / 1000)?.toFixed(1) || '24.5'}k
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                Monthly Revenue
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${alpha('#FFC107', 0.1)}, ${alpha('#FF9800', 0.05)})`,
                border: `1px solid ${alpha('#FFC107', 0.2)}`,
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha('#FFC107', 0.15)}`,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: `linear-gradient(135deg, #FFC107, #FF9800)`,
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: `0 4px 16px ${alpha('#FFC107', 0.3)}`,
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#FFC107', mb: 0.5 }}>
                {quickStats?.averageOccupancy || 82}%
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                Avg. Occupancy
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filters Section */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          mb: 4,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search properties by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: '#FF385C' }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#FF385C', 0.5),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FF385C',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  input={<OutlinedInput label="Property Type" />}
                  sx={{
                    borderRadius: 3,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FF385C',
                    },
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  input={<OutlinedInput label="Status" />}
                  sx={{
                    borderRadius: 3,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FF385C',
                    },
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {propertyStatuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  input={<OutlinedInput label="Sort By" />}
                  sx={{
                    borderRadius: 3,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FF385C',
                    },
                  }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            textAlign: 'center',
            py: 8,
            background: `linear-gradient(135deg, ${alpha('#F8F9FA', 0.8)}, ${alpha('#E9ECEF', 0.3)})`,
          }}
        >
          <Avatar
            sx={{
              bgcolor: alpha('#FF385C', 0.1),
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
            }}
          >
            <HomeIcon sx={{ fontSize: 40, color: '#FF385C' }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            No properties found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            {searchTerm || filterType || filterStatus 
              ? 'Try adjusting your search filters to find what you\'re looking for.' 
              : 'Start building your property portfolio by adding your first property.'
            }
          </Typography>
          {user?.role === 'PROPERTY_MANAGER' && !searchTerm && !filterType && !filterStatus && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/properties/new')}
              sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, #FF385C, #E31E24)`,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: `0 4px 16px ${alpha('#FF385C', 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, #E31E24, #C2185B)`,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Add Your First Property
            </Button>
          )}
        </Card>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="600" color="text.secondary">
              Showing {filteredProperties.length} of {properties.length} properties
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Grid View">
                <IconButton sx={{ color: '#FF385C' }}>
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="List View">
                <IconButton>
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Grid container spacing={4}>
            {filteredProperties.map((property) => (
              <Grid item key={property.id} xs={12} sm={6} lg={4}>
                <PropertyCard
                  property={property}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewAnalytics={handleViewAnalytics}
                  onManageCalendar={handleManageCalendar}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handlePropertyAction('view')}>View Details</MenuItem>
        {user?.role === 'PROPERTY_MANAGER' && (
          <>
            <MenuItem onClick={() => handlePropertyAction('edit')}>Edit Property</MenuItem>
            <MenuItem
              onClick={() => handlePropertyAction('delete')}
              sx={{ color: 'error.main' }}
            >
              Delete Property
            </MenuItem>
          </>
        )}
      </Menu>

      <Menu
        anchorEl={bulkActionAnchor}
        open={Boolean(bulkActionAnchor)}
        onClose={handleBulkActionClose}
      >
        <MenuItem onClick={handleSelectAll}>
          {selectedProperties.length === filteredProperties.length ? 'Unselect All' : 'Select All'}
        </MenuItem>
        <Divider />
        {propertyStatuses.map((status) => (
          <MenuItem
            key={status.value}
            onClick={() => handleBulkStatusUpdate(status.value)}
          >
            Set Status to {status.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All bookings, reviews, and data associated with this property will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete "{selectedProperty?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            startIcon={<DeleteIcon />}
          >
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 