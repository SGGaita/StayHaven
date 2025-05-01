'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Typography, Box, Button, Grid, Paper, CircularProgress, TextField, InputAdornment } from '@mui/material';
import { Search, LocationOn, DateRange, Group } from '@mui/icons-material';
import { setProperties, setLoading } from '@/redux/features/propertySlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const dispatch = useDispatch();
  const { properties = [], loading = false } = useSelector((state) => state.property || {});

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch('/api/properties/featured');
        const data = await response.json();
        dispatch(setProperties(data));
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      }
    };

    fetchFeaturedProperties();
  }, [dispatch]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      
      {/* Hero Section */}
      <Box sx={{ position: 'relative', height: '80vh', minHeight: '600px' }}>
        <Image
          src="/hero-image.jpg"
          alt="Beautiful vacation rental"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Typography variant="h1" sx={{ 
                mb: 3, 
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                Find Your Dream Getaway
              </Typography>
              <Typography variant="h5" sx={{ 
                mb: 6,
                fontWeight: 400,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Discover unique stays and experiences worldwide
              </Typography>

              {/* Search Bar */}
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  maxWidth: '800px',
                  margin: '0 auto',
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      placeholder="Where to?"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      placeholder="Check in - Check out"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRange color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      placeholder="Guests"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Group color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<Search />}
                      sx={{ 
                        height: '56px',
                        borderRadius: '8px',
                        backgroundColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        }
                      }}
                    >
                      Search
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Featured Properties */}
      <Container sx={{ py: 8 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ 
            mb: 2,
            fontWeight: 700,
          }}>
            Featured Stays
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Handpicked properties for your perfect vacation
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : Array.isArray(properties) && properties.length > 0 ? (
          <Grid container spacing={3}>
            {properties.slice(0, 6).map((property) => (
              <Grid item key={property.id} xs={12} sm={6} md={4}>
                <Paper
                  component={Link}
                  href={`/properties/${property.id}`}
                  elevation={0}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      '& .property-image': {
                        transform: 'scale(1.05)',
                      },
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', height: 260, overflow: 'hidden' }}>
                    <Image
                      src={property.photos?.[0] || '/placeholder.jpg'}
                      alt={property.name}
                      fill
                      className="property-image"
                      style={{ 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease-in-out'
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" sx={{ 
                      mb: 1,
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}>
                      {property.name}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                      {property.location}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        ${property.price} <Box component="span" color="text.secondary" sx={{ fontWeight: 400 }}>/ night</Box>
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderRadius: '8px',
                          textTransform: 'none',
                          minWidth: '100px'
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No properties available at the moment.</Typography>
          </Box>
        )}
      </Container>

      {/* Categories Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container>
          <Typography variant="h4" component="h2" align="center" sx={{ mb: 6, fontWeight: 700 }}>
            Explore StayHaven
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: 'Beachfront Villas',
                description: 'Wake up to stunning ocean views',
                icon: '🏖️'
              },
              {
                title: 'Mountain Retreats',
                description: 'Escape to serene mountain hideaways',
                icon: '⛰️'
              },
              {
                title: 'City Apartments',
                description: 'Stay in the heart of vibrant cities',
                icon: '🌆'
              }
            ].map((category, index) => (
              <Grid item key={index} xs={12} md={4}>
                <Paper
                  sx={{
                    p: 4,
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    {category.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {category.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {category.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Trust Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', height: 400, borderRadius: '16px', overflow: 'hidden' }}>
              <Image
                src="/trust-image.jpg"
                alt="Happy travelers"
                fill
                style={{ objectFit: 'cover' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
              Why Choose StayHaven
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  title: '24/7 Support',
                  description: 'Round-the-clock assistance for peace of mind'
                },
                {
                  title: 'Verified Properties',
                  description: 'Every listing is verified for quality and authenticity'
                },
                {
                  title: 'Best Price Guarantee',
                  description: 'Find the best deals for your perfect stay'
                }
              ].map((feature, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Paper
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        bgcolor: 'primary.light',
                        flexShrink: 0
                      }}
                    >
                      <Box sx={{ width: 24, height: 24, bgcolor: 'primary.main', borderRadius: '6px' }} />
                    </Paper>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
} 