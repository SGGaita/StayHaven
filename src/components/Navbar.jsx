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
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

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
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image
                src="/logo.svg"
                alt="StayHaven Logo"
                width={32}
                height={32}
                style={{ marginRight: 8 }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{ color: 'text.primary', fontWeight: 700 }}
              >
                StayHaven
              </Typography>
            </Link>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Button
              component={Link}
              href="/properties"
              sx={{ mx: 1 }}
            >
              Properties
            </Button>
            {isAuthenticated && (
              <Button
                component={Link}
                href="/bookings"
                sx={{ mx: 1 }}
              >
                My Bookings
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
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
                >
                  <MenuItem component={Link} href="/profile" onClick={handleClose}>
                    Profile
                  </MenuItem>
                  {user?.role === 'PROPERTY_MANAGER' && (
                    <MenuItem component={Link} href="/dashboard" onClick={handleClose}>
                      Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Sign out</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={Link}
                  href="/auth/signin"
                  color="inherit"
                >
                  Sign in
                </Button>
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="contained"
                  color="primary"
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