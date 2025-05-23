'use client';

import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Chip, Button, Divider, Paper, IconButton, Tooltip, Stack } from '@mui/material';
import Image from 'next/image';
import {
  LocationOn,
  Hotel,
  Star,
  Pool,
  Wifi,
  LocalParking,
  Kitchen,
  AcUnit,
  Person,
  CalendarMonth,
  Edit as EditIcon,
  Home as HomeIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyAmenities from '@/components/property/PropertyAmenities';
import PropertyGallery from '@/components/property/PropertyGallery';
import PropertyBooking from '@/components/property/PropertyBooking';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

// Add ripple animation styles
const rippleStyles = `
  @keyframes ripple {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(2.5);
      opacity: 0;
    }
  }
`;

const RippleMarker = ({ position }) => {
  useEffect(() => {
    // Add styles to head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = rippleStyles;
    document.head.appendChild(styleSheet);

    // Cleanup
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 192, 203, 0.2)',
          animation: 'ripple 1.5s infinite',
        }}
      />
      <Marker
        position={position}
        icon={{
          url: 'data:image/svg+xml;utf-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
              <path fill="#FF1493" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(36, 36),
          anchor: new window.google.maps.Point(18, 36),
        }}
      />
    </>
  );
};

export default function PropertyPage({ params }) {
  const user = useSelector(selectCurrentUser);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/properties/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${user?.id || ''}`,
            'X-User-Role': user?.role || ''
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }
        
        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
        setError(error.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id, user]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${property.name} on StayHaven!`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        });
        break;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Typography>Loading...</Typography>
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5" color="error">Error loading property</Typography>
            <Typography>{error}</Typography>
            <Button variant="contained" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Typography>Property not found</Typography>
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: 'background.default', pb: 8 }}>
        <PropertyGallery photos={property.photos} propertyName={property.name} />
        
        <Container sx={{ mt: 4 }}>
          {/* Management Actions */}
          {user?.role === 'PROPERTY_MANAGER' && property.managerId === user.id && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => window.location.href = `/dashboard/properties/${params.id}/edit`}
              >
                Edit Property
              </Button>
            </Box>
          )}
          
          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {property.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="primary" />
                      <Typography color="text.secondary">{property.location}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      ${property.price}
                    </Typography>
                    <Typography color="text.secondary">per night</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Chip
                    icon={<Hotel />}
                    label={property.propertyType}
                    variant="outlined"
                  />
                  {property.avgRating && (
                    <Chip
                      icon={<Star sx={{ color: '#FFB400' }} />}
                      label={`${property.avgRating} (${property.reviewCount} reviews)`}
                      sx={{
                        bgcolor: 'rgba(255, 180, 0, 0.1)',
                        color: '#FFB400',
                        '& .MuiChip-icon': {
                          color: '#FFB400',
                        },
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* Host Information and Share */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Host Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      component="img"
                      src={property.manager?.profileInfo?.avatarUrl || '/default-avatar.png'}
                      alt={`${property.manager?.firstName} ${property.manager?.lastName}`}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid',
                        borderColor: 'primary.main',
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Hosted by {property.manager?.firstName} {property.manager?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Property Manager {property.manager?.profileInfo?.location && `· ${property.manager?.profileInfo?.location}`}
                      </Typography>
                      {property.manager?.profileInfo?.joinedDate && (
                        <Typography variant="caption" color="text.secondary">
                          Joined {new Date(property.manager?.profileInfo?.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Share Section */}
                  <Stack spacing={1} alignItems="flex-end">
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<ShareIcon />}
                      size="small"
                      onClick={() => setShowShareTooltip(!showShareTooltip)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        minWidth: 120,
                      }}
                    >
                      Share
                    </Button>
                    
                    {showShareTooltip && (
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          position: 'absolute',
                          mt: 5,
                          zIndex: 1000,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack spacing={1}>
                          <Button
                            fullWidth
                            startIcon={<FacebookIcon />}
                            onClick={() => handleShare('facebook')}
                            sx={{
                              color: 'primary.main',
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'primary.lighter' },
                            }}
                          >
                            Share on Facebook
                          </Button>
                          <Button
                            fullWidth
                            startIcon={<TwitterIcon />}
                            onClick={() => handleShare('twitter')}
                            sx={{
                              color: 'primary.main',
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'primary.lighter' },
                            }}
                          >
                            Share on Twitter
                          </Button>
                          <Button
                            fullWidth
                            startIcon={<WhatsAppIcon />}
                            onClick={() => handleShare('whatsapp')}
                            sx={{
                              color: 'primary.main',
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'primary.lighter' },
                            }}
                          >
                            Share on WhatsApp
                          </Button>
                          <Divider />
                          <Button
                            fullWidth
                            startIcon={<CopyIcon />}
                            onClick={() => handleShare('copy')}
                            sx={{
                              color: copySuccess ? 'success.main' : 'primary.main',
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'primary.lighter' },
                            }}
                          >
                            {copySuccess ? 'Link Copied!' : 'Copy Link'}
                          </Button>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Box>

                {property.manager?.profileInfo?.bio && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {property.manager?.profileInfo?.bio}
                  </Typography>
                )}
              </Box>

              {/* Property Description */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  About this property
                </Typography>
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    whiteSpace: 'pre-line',
                    textAlign: 'justify'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: property.description?.replace(/<[^>]*>/g, '') || 
                      `Experience luxury and comfort in this beautiful ${property.propertyType.toLowerCase()} located in ${property.location}. Perfect for both short and long stays, this property offers all the amenities you need for a memorable stay.`
                  }}
                />
              </Box>

              {/* Amenities Section */}
              <PropertyAmenities amenities={property.amenities} />

              {/* Map Section */}
              <Box sx={{ mt: 6, mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Location
                </Typography>
                <Paper elevation={2}>
                  <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={{
                        lat: property.lat || -1.2921,
                        lng: property.lng || 36.8219
                      }}
                      zoom={15}
                      options={{
                        styles: [
                          {
                            featureType: 'all',
                            elementType: 'all',
                            stylers: [{ saturation: -100 }]
                          }
                        ]
                      }}
                    >
                      <RippleMarker
                        position={{
                          lat: property.lat || -1.2921,
                          lng: property.lng || 36.8219
                        }}
                      />
                    </GoogleMap>
                  </LoadScript>
                </Paper>
              </Box>
            </Grid>

            {/* Booking Section */}
            <Grid item xs={12} md={4}>
              <PropertyBooking 
                price={property.price}
                rating={property.avgRating}
                reviewCount={property.reviewCount}
                propertyId={params.id}
                cleaningFee={property.cleaningFee || 0}
                securityDeposit={property.securityDeposit || 0}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </>
  );
} 