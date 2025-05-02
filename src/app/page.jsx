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
import PropertyCard from '@/components/property/PropertyCard';

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
    <main>
      <Navbar />
      
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Image
          src="/hero-image.jpg"
          alt="Luxury vacation rental"
          fill
          priority
          style={{
            objectFit: 'cover',
            opacity: 0.7,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                mb: 2,
                color: 'common.white',
              }}
            >
              Find Your Perfect Vacation Home
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: 'common.white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              Discover unique stays and experiences around the world
            </Typography>

            {/* Search Bar */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                placeholder="Where are you going?"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                placeholder="Check-in - Check-out"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRange />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                placeholder="Guests"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Group />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<Search />}
                sx={{
                  minWidth: { xs: '100%', md: '120px' },
                  height: '56px',
                }}
              >
                Search
              </Button>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Featured Properties Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Featured Properties
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Handpicked properties for your next getaway
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid item key={property.id} xs={12} sm={6} md={4}>
                <PropertyCard property={property} />
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            component={Link}
            href="/properties"
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
            }}
          >
            View All Properties
          </Button>
        </Box>
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
    </main>
  );
} 