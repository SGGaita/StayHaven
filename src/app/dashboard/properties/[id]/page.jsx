'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  HotelOutlined as BedIcon,
  WcOutlined as BathroomIcon,
  VerifiedUser as VerifiedIcon,
  PendingActions as PendingIcon,
  Block as BlockedIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';

// Status icon mapping
const statusIcons = {
  'ACTIVE': <VerifiedIcon color="success" />,
  'PENDING': <PendingIcon color="warning" />,
  'MAINTENANCE': <BlockedIcon color="error" />,
  'ARCHIVED': <ArchiveIcon color="default" />
};

// Status label mapping
const statusLabels = {
  'ACTIVE': 'Active',
  'PENDING': 'Pending',
  'MAINTENANCE': 'Maintenance',
  'ARCHIVED': 'Archived'
};

export default function PropertyDetails({ params }) {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/properties/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${user?.id || ''}`,
          'X-User-Role': user?.role || ''
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch property');
      }
      
      const data = await response.json();
      setProperty(data);
    } catch (err) {
      console.error('Error fetching property:', err);
      setError(err.message || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);
  
  useEffect(() => {
    if (user) {
      fetchProperty();
    }
  }, [fetchProperty, user]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleEditProperty = () => {
    router.push(`/dashboard/properties/${params.id}/edit`);
  };
  
  const handleViewPublicPage = () => {
    window.open(`/properties/${params.id}`, '_blank');
  };
  
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteProperty = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id || ''}`,
          'X-User-Role': user?.role || ''
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete property');
      }
      
      // Redirect to properties list
      router.push('/dashboard/properties');
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the property');
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <Container>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/properties')}
          >
            Back to Properties
          </Button>
        </Container>
      </DashboardLayout>
    );
  }
  
  // No property found
  if (!property) {
    return (
      <DashboardLayout>
        <Container>
          <Alert severity="warning">
            Property not found or you don't have permission to view it.
          </Alert>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/properties')}
            sx={{ mt: 2 }}
          >
            Back to Properties
          </Button>
        </Container>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard/properties')}
              sx={{ mb: 2 }}
            >
              Back to Properties
            </Button>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {property.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body1" color="text.secondary">
                {property.location}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleViewPublicPage}
            >
              View Public Page
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditProperty}
            >
              Edit Property
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteDialogOpen}
            >
              Delete
            </Button>
          </Box>
        </Box>
        
        {/* Property Overview */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Property Image */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ position: 'relative', height: 300, width: '100%', overflow: 'hidden', borderRadius: 2 }}>
              {property.photos && property.photos.length > 0 ? (
                <Image
                  src={property.photos[property.coverPhotoIndex || 0] || property.photos[0]}
                  alt={property.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/images/property-placeholder.jpg';
                  }}
                />
              ) : (
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  bgcolor: 'grey.200'
                }}>
                  <Typography variant="body1" color="text.secondary">
                    No image available
                  </Typography>
                </Box>
              )}
              
              <Box sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                padding: '6px 12px',
                borderRadius: 1,
                bgcolor: property.status === 'ACTIVE' ? 'success.main' : 
                         property.status === 'PENDING' ? 'warning.main' :
                         property.status === 'MAINTENANCE' ? 'error.main' : 'grey.500',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}>
                {statusIcons[property.status]}
                <Typography variant="body2" fontWeight="bold">
                  {statusLabels[property.status]}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Property Info */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Property Details
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon><HomeIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Property Type" 
                    secondary={property.propertyType} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon><MoneyIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Price per Night" 
                    secondary={`$${property.price.toLocaleString()}`} 
                  />
                </ListItem>
                
                {property.bedrooms && (
                  <ListItem>
                    <ListItemIcon><BedIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Bedrooms" 
                      secondary={property.bedrooms}
                    />
                  </ListItem>
                )}
                
                {property.bathrooms && (
                  <ListItem>
                    <ListItemIcon><BathroomIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Bathrooms" 
                      secondary={property.bathrooms} 
                    />
                  </ListItem>
                )}
              </List>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Status Information
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {property.status === 'ACTIVE' ? 'This property is active and visible to the public.' :
                   property.status === 'PENDING' ? 'This property is pending approval and not visible to the public yet.' :
                   property.status === 'MAINTENANCE' ? 'This property is under maintenance and not available for booking.' :
                   'This property is archived and not visible to the public.'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Tabs and Content */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Description" />
            <Tab label="Amenities" />
            <Tab label="Photos" />
            <Tab label="Bookings" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {/* Description Tab */}
            {activeTab === 0 && (
              <div>
                <Typography variant="subtitle1" gutterBottom>
                  About this property
                </Typography>
                <Typography variant="body1" paragraph>
                  {property.description}
                </Typography>
                
                {property.spaceDescription && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      The Space
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {property.spaceDescription}
                    </Typography>
                  </>
                )}
                
                {property.guestAccess && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Guest Access
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {property.guestAccess}
                    </Typography>
                  </>
                )}
                
                {property.neighborhood && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      The Neighborhood
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {property.neighborhood}
                    </Typography>
                  </>
                )}
              </div>
            )}
            
            {/* Amenities Tab */}
            {activeTab === 1 && (
              <div>
                <Typography variant="subtitle1" gutterBottom>
                  Amenities
                </Typography>
                
                {property.amenities && property.amenities.length > 0 ? (
                  <Grid container spacing={1}>
                    {property.amenities.map((amenity) => (
                      <Grid item key={amenity}>
                        <Chip 
                          label={amenity} 
                          variant="outlined" 
                          sx={{ m: 0.5 }} 
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No amenities listed for this property.
                  </Typography>
                )}
              </div>
            )}
            
            {/* Photos Tab */}
            {activeTab === 2 && (
              <div>
                <Typography variant="subtitle1" gutterBottom>
                  Photos
                </Typography>
                
                {property.photos && property.photos.length > 0 ? (
                  <Grid container spacing={2}>
                    {property.photos.map((photo, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper 
                          sx={{ 
                            position: 'relative',
                            height: 200,
                            overflow: 'hidden',
                            borderRadius: 1,
                            border: index === (property.coverPhotoIndex || 0) ? '2px solid' : 'none',
                            borderColor: 'primary.main',
                          }}
                        >
                          <Image 
                            src={photo} 
                            alt={`Photo ${index + 1}`} 
                            fill
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = '/images/property-placeholder.jpg';
                            }}
                          />
                          
                          {index === (property.coverPhotoIndex || 0) && (
                            <Box sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              bgcolor: 'primary.main',
                              color: 'white',
                              p: 0.5,
                              textAlign: 'center',
                            }}>
                              <Typography variant="caption" fontWeight="bold">
                                Cover Photo
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No photos available for this property.
                  </Typography>
                )}
              </div>
            )}
            
            {/* Bookings Tab */}
            {activeTab === 3 && (
              <div>
                <Typography variant="subtitle1" gutterBottom>
                  Bookings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Booking information will be displayed here. This feature is coming soon.
                </Typography>
              </div>
            )}
          </Box>
        </Paper>
      </Container>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>
          Delete Property
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this property? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteProperty} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 