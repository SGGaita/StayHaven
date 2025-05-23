import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Support, VerifiedUser, AttachMoney } from '@mui/icons-material';

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

export default function TrustSection() {
  return (
    <Container sx={{ py: { xs: 8, md: 12 } }}>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ position: 'relative', height: 500, borderRadius: '24px', overflow: 'hidden' }}>
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
                  height: '50%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  p: 4,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Creating Memorable Experiences
                </Typography>
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
            <Typography variant="h3" sx={{ mb: 4, fontWeight: 800 }}>
              Why Choose StayHaven
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
              We're committed to providing exceptional service and ensuring your vacation is nothing short of perfect.
            </Typography>

            <Grid container spacing={3}>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Grid item xs={12} key={index}>
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          display: 'flex',
                          gap: 3,
                          borderRadius: 3,
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            borderColor: feature.color,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: `${feature.color}15`,
                            color: feature.color,
                          }}
                        >
                          <Icon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            {feature.title}
                          </Typography>
                          <Typography color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </MotionBox>
                  </Grid>
                );
              })}
            </Grid>
          </MotionBox>
        </Grid>
      </Grid>
    </Container>
  );
} 