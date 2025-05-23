import { Container, Typography, Box, Button, Grid, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PropertyCard from '@/components/property/PropertyCard';

const MotionGrid = motion(Grid);

export default function FeaturedProperties({ properties = [], loading = false, error = null }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Featured Properties
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: 'auto',
              mb: 4,
              fontWeight: 400,
            }}
          >
            Handpicked properties for your next getaway, each offering unique experiences and unforgettable moments
          </Typography>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200,
            }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                maxWidth: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {error}
            </Alert>
          </Box>
        ) : properties.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200,
            }}
          >
            <Alert 
              severity="info" 
              sx={{ 
                width: '100%', 
                maxWidth: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              No properties found. Check back soon for new listings!
            </Alert>
          </Box>
        ) : (
          <MotionGrid
            container
            spacing={4}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {properties.map((property) => (
              <MotionGrid
                item
                key={property.id}
                xs={12}
                sm={6}
                md={4}
                variants={itemVariants}
              >
                <PropertyCard property={property} />
              </MotionGrid>
            ))}
          </MotionGrid>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 8,
          }}
        >
          <Button
            component={Link}
            href="/properties"
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              transition: 'all 0.2s',
            }}
          >
            View All Properties
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 