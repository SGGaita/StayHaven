import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const categories = [
  {
    title: 'Beachfront Villas',
    description: 'Wake up to stunning ocean views and the sound of waves',
    icon: '🏖️',
    color: '#4FC3F7'
  },
  {
    title: 'Mountain Retreats',
    description: 'Escape to serene mountain hideaways with breathtaking vistas',
    icon: '⛰️',
    color: '#81C784'
  },
  {
    title: 'City Apartments',
    description: 'Stay in the heart of vibrant cities with modern amenities',
    icon: '🌆',
    color: '#FF8A65'
  },
  {
    title: 'Countryside Cottages',
    description: 'Experience the charm of rural life in cozy cottages',
    icon: '🏡',
    color: '#FFB74D'
  }
];

const MotionPaper = motion(Paper);

export default function CategorySection() {
  return (
    <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 3,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Explore StayHaven
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            Find your perfect stay from our diverse collection of properties
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {categories.map((category, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <MotionPaper
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.1,
                }}
                sx={{
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: 4,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: category.color,
                  },
                }}
              >
                <Typography variant="h2" sx={{ mb: 2, fontSize: '3rem' }}>
                  {category.icon}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {category.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  {category.description}
                </Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
} 