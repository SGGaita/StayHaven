'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setError, setLoading, selectIsAuthenticated, selectUserRole, selectAuthLoading } from '@/redux/features/authSlice';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Google, Visibility, VisibilityOff } from '@mui/icons-material';
import Link from 'next/link';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import logger from '@/lib/logger';

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectAuthLoading);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    if (isAuthenticated && userRole) {
      logger.authDebug('redirect', 'User already authenticated, redirecting', { role: userRole });
      handleRoleBasedRedirect(userRole);
    }
  }, [isAuthenticated, userRole]);

  const handleRoleBasedRedirect = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        router.push('/dashboard/admin');
        break;
      case 'PROPERTY_MANAGER':
        router.push('/dashboard/properties');
        break;
      case 'CUSTOMER':
        router.push('/dashboard');
        break;
      default:
        logger.authError('redirect', 'Unknown role encountered', { role });
        router.push('/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setShowSuccess(false);
    dispatch(setLoading(true));

    logger.authDebug('signin', 'Attempting sign in', { email: formData.email });

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("data", 	data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      

      logger.authInfo('signin', 'Sign in successful', {
        email: formData.email,
        role: data.user.role,
      });

      // Store user data in Redux and localStorage
      dispatch(setUser(data.user));
      
      // Show success message
      setShowSuccess(true);
      
      // Wait for a short moment before redirecting
      setTimeout(() => {
        handleRoleBasedRedirect(data.user.role);
      }, 1500);
      
    } catch (err) {
      logger.authError('signin', 'Sign in error', {
        error: err.message,
        email: formData.email,
      });
      setLocalError(err.message);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSignIn = async () => {
    logger.authDebug('google-signin', 'Google sign-in attempted');
    setLocalError('Google sign-in not implemented yet');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, position: 'relative' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      marginLeft: '-12px',
                    }}
                  />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Box sx={{ my: 3 }}>
            <Divider>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Sign up
              </Link>
            </Typography>
            <Button
              variant="text"
              onClick={() => setForgotPasswordOpen(true)}
              sx={{
                mt: 1,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot password?
            </Button>
          </Box>
        </Paper>
      </Box>

      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />

      <Snackbar
        open={showSuccess}
        autoHideDuration={1500}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Sign in successful! Redirecting...
        </Alert>
      </Snackbar>
    </Container>
  );
} 