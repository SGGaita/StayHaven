'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, logout } from '@/redux/features/authSlice';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Container,
  Avatar,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { 
  AccountCircle, 
  Dashboard, 
  Person, 
  Logout, 
  BookOnline,
  Home,
  KeyboardArrowDown,
  Favorite,
} from '@mui/icons-material';
import { useAuthSync } from '@/hooks/useAuthSync';
import UserAvatar from '@/components/UserAvatar';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
      }}
    >
      <Container maxWidth="xl">
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: { xs: 64, md: 72 },
            py: 1,
          }}
        >
          {/* Logo Section */}
          <Box sx={{ 
            flexGrow: 0, 
            display: 'flex', 
            alignItems: 'center',
            mr: { xs: 2, md: 4 }
          }}>
            <Link 
              href="/" 
              style={{ 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center',
                transition: 'transform 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              >
                <Home sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography
                variant="h5"
                component="div"
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  letterSpacing: '-0.5px',
                }}
              >
                StayHaven
              </Typography>
            </Link>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', md: 'flex' }, 
            justifyContent: 'center',
            gap: 1,
          }}>
            <Button
              component={Link}
              href="/properties"
              startIcon={<BookOnline />}
              sx={{ 
                mx: 1,
                px: 3,
                py: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'text.primary',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }
              }}
            >
              Properties
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  component={Link}
                  href="/dashboard/favorites"
                  startIcon={<Favorite />}
                  sx={{ 
                    mx: 1,
                    px: 3,
                    py: 1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  Favorites
                </Button>
                <Button
                  component={Link}
                  href="/bookings"
                  startIcon={<BookOnline />}
                  sx={{ 
                    mx: 1,
                    px: 3,
                    py: 1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  My Bookings
                </Button>
              </>
            )}
          </Box>

          {/* User Section */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                {/* User Role Badge */}
                {user?.role === 'PROPERTY_MANAGER' && (
                  <Chip 
                    label="Manager"
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                      display: { xs: 'none', sm: 'flex' }
                    }}
                  />
                )}
                
                {/* User Menu Button */}
                <Button
                  onClick={handleMenu}
                  endIcon={<KeyboardArrowDown />}
                  sx={{
                    borderRadius: '16px',
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.2),
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <UserAvatar 
                    size={32}
                    sx={{ 
                      mr: 1,
                      bgcolor: 'primary.main',
                    }}
                  />
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {user?.name || 'User'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Button>

                {/* Enhanced User Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      borderRadius: '16px',
                      minWidth: 200,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.1),
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {user?.name || 'User'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  
                  <MenuItem 
                    component={Link} 
                    href="/profile" 
                    onClick={handleClose}
                    sx={{ 
                      py: 1.5, 
                      px: 2,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      }
                    }}
                  >
                    <Person sx={{ mr: 2, fontSize: 20 }} />
                    Profile
                  </MenuItem>
                  
                  {user?.role === 'PROPERTY_MANAGER' && (
                    <MenuItem 
                      component={Link} 
                      href="/dashboard" 
                      onClick={handleClose}
                      sx={{ 
                        py: 1.5, 
                        px: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        }
                      }}
                    >
                      <Dashboard sx={{ mr: 2, fontSize: 20 }} />
                      Dashboard
                    </MenuItem>
                  )}
                  
                  <Divider />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5, 
                      px: 2,
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.08),
                      }
                    }}
                  >
                    <Logout sx={{ mr: 2, fontSize: 20 }} />
                    Sign out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button
                  component={Link}
                  href="/auth/signin"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: '12px',
                    color: 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Sign in
                </Button>
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.25,
                    borderRadius: '12px',
                    bgcolor: 'primary.main',
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  Sign up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
} 