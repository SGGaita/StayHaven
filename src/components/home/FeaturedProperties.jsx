import { Container, Typography, Box, Button, Grid, CircularProgress, Alert, useTheme, alpha } from '@mui/material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowForward, Star } from '@mui/icons-material';
import PropertyCard from '@/components/property/PropertyCard';

const MotionGrid = motion.create(Grid);
const MotionBox = motion.create(Box);

export default function FeaturedProperties({ properties = [], loading = false, error = null }) {
  const theme = useTheme();

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 }, position: 'relative' }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '8%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, px: { xs: 3, sm: 4, md: 6 } }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Star sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: '0.1em',
                fontSize: '0.9rem',
              }}
            >
              HANDPICKED FOR YOU
            </Typography>
          </Box>
          
          <Typography
            component="h2"
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              color: 'text.primary',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.2,
            }}
          >
            Featured{' '}
            <Box
              component="span"
              sx={{
                color: 'primary.main',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '3px',
                  bgcolor: 'primary.main',
                  borderRadius: '2px',
                },
              }}
            >
              Properties
            </Box>
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: 'auto',
              mb: 4,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Handpicked properties for your next getaway, each offering unique experiences and unforgettable moments
          </Typography>
        </MotionBox>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
              gap: 3,
            }}
          >
            <CircularProgress 
              size={60} 
              thickness={4} 
              sx={{ color: 'primary.main' }}
            />
            <Typography variant="h6" color="text.secondary">
              Loading amazing properties...
            </Typography>
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
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: alpha(theme.palette.error.main, 0.2),
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
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.2),
              }}
            >
              No properties found. Check back soon for new listings!
            </Alert>
          </Box>
        ) : (
          <MotionGrid
            container
            spacing={{ xs: 3, md: 4 }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {properties.map((property, index) => (
              <MotionGrid
                item
                key={property.id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                variants={itemVariants}
              >
                <PropertyCard property={property} />
              </MotionGrid>
            ))}
          </MotionGrid>
        )}

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 10,
          }}
        >
          <Button
            component={Link}
            href="/properties"
            variant="outlined"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderWidth: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              backgroundColor: 'transparent',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                borderWidth: 2,
                borderColor: 'primary.main',
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-3px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
          >
            View All Properties
          </Button>
        </MotionBox>
      </Container>
    </Box>
  );
} 