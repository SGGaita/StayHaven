'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  Stack,
  useTheme,
  alpha,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  Group as GroupIcon,
  FilterList as FilterListIcon,
  SortByAlpha as SortIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

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

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'popular', label: 'Most Popular' },
];

export default function PropertiesPage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('All Types');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favoritingProperty, setFavoritingProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
    if (user) {
      fetchUserFavorites();
    }
  }, [page, searchTerm, propertyType, sortBy, minPrice, maxPrice, user]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: searchTerm,
        type: propertyType !== 'All Types' ? propertyType : '',
        sortBy,
        minPrice: minPrice || '0',
        maxPrice: maxPrice || '999999',
      });

      const response = await fetch(`/api/properties?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties || data || []);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/dashboard/favorites', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const favoritesData = await response.json();
        const favoriteIds = new Set(
          (Array.isArray(favoritesData) ? favoritesData : [])
            .map(fav => fav.property?.id)
            .filter(Boolean)
        );
        setFavorites(favoriteIds);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const handleToggleFavorite = async (propertyId) => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    try {
      setFavoritingProperty(propertyId);
      const isFavorited = favorites.has(propertyId);

      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/dashboard/favorites?propertyId=${propertyId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(propertyId);
            return newFavorites;
          });
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/dashboard/favorites', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ propertyId }),
        });

        if (response.ok) {
          setFavorites(prev => new Set([...prev, propertyId]));
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setFavoritingProperty(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  };

  const handleViewProperty = (propertyId) => {
    router.push(`/properties/${propertyId}`);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            gutterBottom
            sx={{ 
              color: '#FF385C',
              textAlign: 'center',
              mb: 2,
            }}
          >
            Discover Amazing Places
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              textAlign: 'center',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Find the perfect accommodation for your next adventure
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            border: `1px solid ${alpha('#FF385C', 0.1)}`,
            borderRadius: 3,
          }}
        >
          <form onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search properties or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    label="Property Type"
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
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={1.5}>
                <TextField
                  fullWidth
                  label="Min Price"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={6} md={1.5}>
                <TextField
                  fullWidth
                  label="Max Price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={1}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    height: 56,
                    background: '#FF385C',
                    '&:hover': {
                      background: '#E61E4D',
                    },
                  }}
                >
                  <SearchIcon />
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : properties.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              border: `2px dashed ${alpha('#FF385C', 0.2)}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              No properties found
            </Typography>
            <Typography color="text.secondary">
              Try adjusting your search criteria or filters
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {properties.length} properties found
              </Typography>
              <Chip 
                label={`Page ${page} of ${totalPages}`} 
                variant="outlined" 
                sx={{ borderColor: '#FF385C', color: '#FF385C' }}
              />
            </Box>

            <Grid container spacing={3}>
              {properties.map((property) => (
                <Grid item key={property.id} xs={12} sm={6} md={4}>
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
                      
                      {/* Favorite Button */}
                      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                        <Tooltip title={favorites.has(property.id) ? 'Remove from favorites' : 'Add to favorites'}>
                          <IconButton
                            onClick={() => handleToggleFavorite(property.id)}
                            disabled={favoritingProperty === property.id}
                            sx={{
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                              backdropFilter: 'blur(10px)',
                              '&:hover': {
                                backgroundColor: theme.palette.background.paper,
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            {favoritingProperty === property.id ? (
                              <CircularProgress size={20} />
                            ) : favorites.has(property.id) ? (
                              <FavoriteIcon sx={{ color: '#FF385C' }} />
                            ) : (
                              <FavoriteBorderIcon />
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
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
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
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      '&.Mui-selected': {
                        backgroundColor: '#FF385C',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#E61E4D',
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
} 