import Image from 'next/image';
import { Container, Typography, Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

export default function HeroSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        height: '95vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Image
        src="/images/hero.jpg"
        alt="Luxury vacation rental"
        fill
        priority
        style={{
          objectFit: 'cover',
        }}
      />
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <MotionBox 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          sx={{ 
            maxWidth: 800,
            textAlign: 'left',
            ml: { xs: 2, sm: 4, md: 6 },
            pl: { xs: 2, sm: 4, md: 6 },
          }}
        >
          <MotionTypography
            variant="h1"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
              fontWeight: 800,
              mb: 3,
              color: 'common.white',
              textShadow: '0 4px 20px rgba(0,0,0,0.7)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Find Your Perfect
            <Box
              component="span"
              sx={{
                display: 'block',
                color: 'common.white',
                textShadow: '0 4px 20px rgba(0,0,0,0.7)',
              }}
            >
              Vacation Home
            </Box>
          </MotionTypography>
          
          <MotionTypography
            variant="h5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            sx={{
              mb: 6,
              color: 'common.white',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              fontWeight: 200,
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            Discover unique stays and unforgettable experiences around the world, 
            carefully curated for your perfect getaway
          </MotionTypography>

          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <SearchBar />
          </MotionBox>
        </MotionBox>
      </Container>
      
      {/* Floating elements for visual interest */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          backdropFilter: 'blur(20px)',
          zIndex: 1,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          left: '5%',
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.light, 0.15),
          backdropFilter: 'blur(20px)',
          zIndex: 1,
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />
    </Box>
  );
} 