import { Container, Typography, Box, Grid, Paper, useTheme, alpha } from '@mui/material';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Support, VerifiedUser, AttachMoney, CheckCircle } from '@mui/icons-material';

const features = [
  {
    icon: Support,
    title: '24/7 Support',
    description: 'Round-the-clock assistance for peace of mind during your stay',
    color: '#4CAF50'
  },
  {
    icon: VerifiedUser,
    title: 'Verified Properties',
    description: 'Every listing is thoroughly verified for quality and authenticity',
    color: '#2196F3'
  },
  {
    icon: AttachMoney,
    title: 'Best Price Guarantee',
    description: 'We match any comparable price you find elsewhere',
    color: '#FF9800'
  }
];

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

export default function TrustSection() {
  const theme = useTheme();

  return (
    <Box sx={{ 
      py: { xs: 10, md: 15 }, 
      position: 'relative',
      bgcolor: 'background.default',
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '5%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '3%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          zIndex: 0,
        }}
      />

      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ 
                position: 'relative', 
                height: 500, 
                borderRadius: '32px', 
                overflow: 'hidden',
                boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
              }}>
                <Image
                  src="/trust-image.jpg"
                  alt="Happy travelers"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: `linear-gradient(to top, ${alpha(theme.palette.primary.main, 0.8)} 0%, transparent 100%)`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    p: 4,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        mb: 1,
                      }}
                    >
                      Creating Memorable Experiences
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      Join thousands of happy travelers worldwide
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </MotionBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircle sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    fontSize: '0.9rem',
                  }}
                >
                  TRUSTED BY THOUSANDS
                </Typography>
              </Box>

              <Typography 
                variant="h2" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 800,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  lineHeight: 1.2,
                }}
              >
                Why Choose{' '}
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
                  mb: 6,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  maxWidth: 500,
                }}
              >
                We're committed to providing exceptional service and ensuring your vacation is nothing short of perfect.
              </Typography>

              <Grid container spacing={3}>
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Grid item xs={12} key={index}>
                      <MotionPaper
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.6 }}
                        elevation={0}
                        sx={{
                          p: 3.5,
                          display: 'flex',
                          gap: 3,
                          borderRadius: '20px',
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: alpha(theme.palette.divider, 0.1),
                          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                            flexShrink: 0,
                          }}
                        >
                          <Icon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              mb: 1.5, 
                              fontWeight: 700,
                              color: 'text.primary',
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography 
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.6,
                              fontSize: '1rem',
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </Box>
                      </MotionPaper>
                    </Grid>
                  );
                })}
              </Grid>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 