'use client';

import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const footerSections = [
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety Information', href: '/safety' },
      { name: 'Cancellation Options', href: '/cancellation' },
      { name: 'COVID-19 Response', href: '/covid' },
    ],
  },
  {
    title: 'Community',
    links: [
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
      { name: 'Careers', href: '/careers' },
      { name: 'Partners', href: '/partners' },
    ],
  },
  {
    title: 'Hosting',
    links: [
      { name: 'List Your Property', href: '/host' },
      { name: 'Host Resources', href: '/host/resources' },
      { name: 'Community Forum', href: '/community' },
      { name: 'Host Protection', href: '/host/protection' },
    ],
  },
  {
    title: 'About',
    links: [
      { name: 'Our Story', href: '/about' },
      { name: 'Investors', href: '/investors' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

const socialLinks = [
  { icon: <Facebook />, href: 'https://facebook.com' },
  { icon: <Twitter />, href: 'https://twitter.com' },
  { icon: <Instagram />, href: 'https://instagram.com' },
  { icon: <LinkedIn />, href: 'https://linkedin.com' },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: { xs: 6, md: 8 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {footerSections.map((section) => (
            <Grid item xs={12} sm={6} md={3} key={section.title}>
              <Typography
                variant="subtitle1"
                color="text.primary"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                {section.title}
              </Typography>
              <Box
                component="ul"
                sx={{
                  m: 0,
                  p: 0,
                  listStyle: 'none',
                  '& li': { mb: 1 },
                }}
              >
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'none',
                        },
                      }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} StayHaven. All rights reserved.
            </Typography>
            <Typography
              variant="body2"
              component="span"
              color="text.secondary"
              sx={{ mx: 1 }}
            >
              ·
            </Typography>
            <Link
              href="/terms"
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Terms
            </Link>
            <Typography
              variant="body2"
              component="span"
              color="text.secondary"
              sx={{ mx: 1 }}
            >
              ·
            </Typography>
            <Link
              href="/privacy"
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Privacy
            </Link>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {socialLinks.map((social, index) => (
              <IconButton
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 