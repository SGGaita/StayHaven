'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Container,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Hotel as HotelIcon,
  Group as GroupIcon,
  Bathtub as BathtubIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';

export default function FavoritesPage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingFavorite, setRemovingFavorite] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/favorites', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      
      // Handle both array responses and error responses with fallback data
      if (Array.isArray(data)) {
        setFavorites(data);
      } else if (data.error && data.favorites) {
        // API returned error but provided fallback data
        setFavorites(data.favorites);
        setError(data.error);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId) => {
    try {
      setRemovingFavorite(propertyId);
      
      const response = await fetch(`/api/dashboard/favorites?propertyId=${propertyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove from local state
        setFavorites(prev => prev.filter(fav => fav.property?.id !== propertyId));
      } else {
        throw new Error('Failed to remove favorite');
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError(err.message);
    } finally {
      setRemovingFavorite(null);
    }
  };

  const handleViewProperty = (propertyId) => {
    router.push(`/properties/${propertyId}`);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <Alert severity="warning">
            Please sign in to view your favorites.
          </Alert>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  color: '#FF385C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <FavoriteIcon fontSize="large" />
                My Favorites
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Properties you've saved for future stays
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchFavorites}
              disabled={loading}
              sx={{ 
                borderColor: '#FF385C',
                color: '#FF385C',
                '&:hover': {
                  borderColor: '#E61E4D',
                  backgroundColor: alpha('#FF385C', 0.04),
                },
              }}
            >
              Refresh
            </Button>
          </Box>
          
          {favorites.length > 0 && (
            <Chip 
              label={`${favorites.length} saved properties`}
              sx={{ 
                backgroundColor: alpha('#FF385C', 0.1),
                color: '#FF385C',
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {error && (
          <Alert 
            severity="warning" 
            sx={{ mb: 4 }}
            action={
              <Button color="inherit" size="small" onClick={fetchFavorites}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : favorites.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              background: `linear-gradient(135deg, ${alpha('#FF385C', 0.05)} 0%, ${alpha('#FF385C', 0.02)} 100%)`,
              border: `2px dashed ${alpha('#FF385C', 0.2)}`,
              borderRadius: 3,
            }}
          >
            <Box sx={{ mb: 3, fontSize: '4rem' }}>💔</Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              No favorites yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
              Start exploring properties and save the ones you love by clicking the heart icon. 
              Your saved properties will appear here for easy access.
            </Typography>
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
                background: '#FF385C',
                boxShadow: `0 4px 16px ${alpha('#FF385C', 0.3)}`,
                '&:hover': {
                  background: '#E61E4D',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${alpha('#FF385C', 0.4)}`,
                },
              }}
            >
              Explore Properties
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {favorites.map((favorite) => {
              const property = favorite.property;
              if (!property) return null;

              return (
                <Grid item key={favorite.id} xs={12} sm={6} md={4}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                        '& .property-image': {
                          transform: 'scale(1.05)',
                        },
                      },
                    }}
                  >
                    {/* Property Image */}
                    <Box sx={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                      <Image
                        src={property.photos?.[0] || '/placeholder-property.jpg'}
                        alt={property.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="property-image"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Remove Favorite Button */}
                      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                        <Tooltip title="Remove from favorites">
                          <IconButton
                            onClick={() => handleRemoveFavorite(property.id)}
                            disabled={removingFavorite === property.id}
                            sx={{
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                              backdropFilter: 'blur(10px)',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            {removingFavorite === property.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon sx={{ color: theme.palette.error.main }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Price Badge */}
                      <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
                        <Chip
                          label={`$${property.price}/night`}
                          sx={{
                            backgroundColor: alpha(theme.palette.background.paper, 0.95),
                            backdropFilter: 'blur(10px)',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                          }}
                        />
                      </Box>

                      {/* Favorite Badge */}
                      <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                        <Chip
                          icon={<FavoriteIcon />}
                          label="Saved"
                          size="small"
                          sx={{
                            backgroundColor: alpha('#FF385C', 0.9),
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              color: 'white',
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      {/* Property Name */}
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        gutterBottom
                        sx={{ 
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {property.name}
                      </Typography>

                      {/* Location */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {property.location}
                        </Typography>
                      </Box>

                      {/* Property Features */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip 
                          size="small" 
                          icon={<HotelIcon />}
                          label={`${property.bedrooms || 1} beds`} 
                        />
                        <Chip 
                          size="small" 
                          icon={<BathtubIcon />}
                          label={`${property.bathrooms || 1} baths`} 
                        />
                        <Chip 
                          size="small" 
                          icon={<GroupIcon />}
                          label={`${property.maxGuests || 1} guests`} 
                        />
                      </Stack>

                      {/* Rating */}
                      {property.averageRating > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ color: '#FFD700', fontSize: '1rem' }} />
                          <Typography variant="body2" fontWeight="medium">
                            {property.averageRating.toFixed(1)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({property.totalReviews || 0} reviews)
                          </Typography>
                        </Box>
                      )}

                      {/* Date Added */}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Saved on {new Date(favorite.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewProperty(property.id)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          background: '#FF385C',
                          '&:hover': {
                            background: '#E61E4D',
                          },
                        }}
                      >
                        View Property
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Quick Actions */}
        {favorites.length > 0 && (
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Ready to book?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Browse more amazing properties to add to your favorites
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/properties')}
              sx={{
                borderColor: '#FF385C',
                color: '#FF385C',
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                '&:hover': {
                  borderColor: '#E61E4D',
                  backgroundColor: alpha('#FF385C', 0.04),
                },
              }}
            >
              Explore More Properties
            </Button>
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
} 