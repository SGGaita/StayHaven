import Image from 'next/image';
import { Container, Typography, Box } from '@mui/material';
import SearchBar from './SearchBar';

export default function HeroSection() {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '90vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
          zIndex: 1,
        },
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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box 
          sx={{ 
            maxWidth: 900,
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
              fontWeight: 800,
              mb: 2,
              color: 'common.white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Find Your Perfect Vacation Home
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 6,
              color: 'common.white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 400,
              maxWidth: 600,
            }}
          >
            Discover unique stays and experiences around the world, carefully curated for unforgettable moments
          </Typography>

          <SearchBar />
        </Box>
      </Container>
    </Box>
  );
} 