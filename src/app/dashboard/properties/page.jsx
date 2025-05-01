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
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { selectCurrentUser } from '@/redux/features/authSlice';

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

export default function PropertiesPage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [bulkActionAnchor, setBulkActionAnchor] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/properties');
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const data = await response.json();
      
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
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
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Properties
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {selectedProperties.length > 0 && (
              <Button
                variant="outlined"
                onClick={handleBulkActionOpen}
                startIcon={<FilterListIcon />}
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
                  borderRadius: '8px',
                  textTransform: 'none',
                  py: 1,
                  px: 3,
                }}
              >
                Add New Property
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                input={<OutlinedInput label="Property Type" />}
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                input={<OutlinedInput label="Status" />}
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                input={<OutlinedInput label="Sort By" />}
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
      </Box>

      {filteredProperties.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No properties found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || filterType || filterStatus ? 'Try adjusting your filters' : 'Start by adding a new property'}
          </Typography>
          {user?.role === 'PROPERTY_MANAGER' && !searchTerm && !filterType && !filterStatus && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/properties/new')}
              sx={{ mt: 2 }}
            >
              Add New Property
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => (
            <Grid item key={property.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                {user?.role === 'PROPERTY_MANAGER' && (
                  <Checkbox
                    checked={selectedProperties.includes(property.id)}
                    onChange={() => handlePropertySelect(property.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'background.paper' },
                    }}
                  />
                )}
                <CardMedia
                  component="img"
                  height="200"
                  image={property.photos[0] || '/placeholder.jpg'}
                  alt={property.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {property.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {property.location}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, property)}
                      sx={{ mt: -1, mr: -1 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={property.propertyType}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                    <Chip
                      label={propertyStatuses.find(s => s.value === property.status)?.label || property.status}
                      size="small"
                      color={propertyStatuses.find(s => s.value === property.status)?.color || 'default'}
                      sx={{ borderRadius: 1 }}
                    />
                    {property.avgRating && (
                      <Chip
                        label={`${property.avgRating.toFixed(1)} ★`}
                        size="small"
                        color="primary"
                        sx={{ borderRadius: 1 }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      ${property.price.toLocaleString()}/night
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push(`/properties/${property.id}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
    </DashboardLayout>
  );
} 