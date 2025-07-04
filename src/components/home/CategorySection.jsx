import { Container, Typography, Box, Grid, Paper, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { ExploreOutlined } from '@mui/icons-material';

const categories = [
  {
    title: 'Beachfront Villas',
    description: 'Wake up to stunning ocean views and the sound of waves',
    icon: '🏖️',
    gradient: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)'
  },
  {
    title: 'Mountain Retreats',
    description: 'Escape to serene mountain hideaways with breathtaking vistas',
    icon: '⛰️',
    gradient: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)'
  },
  {
    title: 'City Apartments',
    description: 'Stay in the heart of vibrant cities with modern amenities',
    icon: '🌆',
    gradient: 'linear-gradient(135deg, #FF8A65 0%, #FF7043 100%)'
  },
  {
    title: 'Countryside Cottages',
    description: 'Experience the charm of rural life in cozy cottages',
    icon: '🏡',
    gradient: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)'
  }
];

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

export default function CategorySection() {
  const theme = useTheme();

  return (
    <Box sx={{ 
      bgcolor: alpha(theme.palette.primary.main, 0.02), 
      py: { xs: 10, md: 15 },
      position: 'relative',
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '3%',
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
          bottom: '15%',
          right: '5%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          zIndex: 0,
        }}
      />

      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: 10 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <ExploreOutlined sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: '0.1em',
                fontSize: '0.9rem',
              }}
            >
              DISCOVER YOUR PERFECT STAY
            </Typography>
          </Box>

          <Typography
            component="h2"
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.2,
            }}
          >
            Explore{' '}
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
              StayHaven
            </Box>
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Find your perfect stay from our diverse collection of properties around the world
          </Typography>
        </MotionBox>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {categories.map((category, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <MotionPaper
                whileHover={{
                  scale: 1.03,
                  y: -8,
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.1,
                  duration: 0.6,
                }}
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.1),
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    '& .category-icon': {
                      transform: 'scale(1.2) rotate(5deg)',
                    },
                    '& .category-bg': {
                      opacity: 1,
                      transform: 'scale(1.1)',
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'primary.main',
                    borderRadius: '0 0 8px 8px',
                  },
                }}
              >
                {/* Background decoration */}
                <Box
                  className="category-bg"
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    opacity: 0,
                    transition: 'all 0.3s ease-in-out',
                    zIndex: 0,
                  }}
                />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography 
                    variant="h1" 
                    className="category-icon"
                    sx={{ 
                      mb: 3, 
                      fontSize: '4rem',
                      lineHeight: 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {category.icon}
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: '1.25rem',
                    }}
                  >
                    {category.title}
                  </Typography>
                  
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      fontWeight: 400,
                    }}
                  >
                    {category.description}
                  </Typography>
                </Box>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>

        {/* Call to action */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          sx={{
            textAlign: 'center',
            mt: 8,
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              mb: 2,
            }}
          >
            Ready to start your adventure?
          </Typography>
          <Typography
            variant="body1"
            color="primary.main"
            sx={{
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Browse all properties →
          </Typography>
        </MotionBox>
      </Container>
    </Box>
  );
} 