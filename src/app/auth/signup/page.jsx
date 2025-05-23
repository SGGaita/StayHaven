'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser, setError as setAuthError } from '@/redux/features/authSlice';
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
  FormControl,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
} from '@mui/material';
import { Google, Visibility, VisibilityOff } from '@mui/icons-material';
import Link from 'next/link';
import logger from '@/lib/logger';

export default function SignUp() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please provide a valid email address');
      return false;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
      return false;
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user makes changes
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    logger.debug('auth', 'Starting signup process', { email: formData.email });

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        logger.info('auth', 'Signup successful', {
          email: formData.email,
          role: formData.role,
        });
        
        dispatch(setUser(data.user));
        
        // Redirect based on role
        if (data.user.role === 'PROPERTY_MANAGER') {
          router.push('/dashboard/properties');
        } else {
          router.push('/dashboard');
        }
      } else {
        logger.error('auth', 'Signup failed', {
          error: data.error,
          email: formData.email,
        });
        setError(data.error || 'An error occurred during sign up');
        dispatch(setAuthError(data.error));
      }
    } catch (error) {
      logger.error('auth', 'Signup error', {
        error: error.message,
        email: formData.email,
      });
      setError('Network error or server is unavailable');
      dispatch(setAuthError('Network error or server is unavailable'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    logger.debug('auth', 'Google signup attempted');
    setError('Google sign-up not implemented yet');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create your account
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Join StayHaven to start booking or listing properties
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="First name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                error={!!error && !formData.firstName}
              />
              <TextField
                fullWidth
                label="Last name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                error={!!error && !formData.lastName}
              />
            </Box>

            <TextField
              fullWidth
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="email"
              error={!!error && !formData.email}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              error={!!error && !formData.password}
              helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              error={!!error && !formData.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl component="fieldset" sx={{ mt: 2, mb: 1 }}>
              <FormLabel component="legend">I want to</FormLabel>
              <RadioGroup
                name="role"
                value={formData.role}
                onChange={handleChange}
                row
              >
                <FormControlLabel
                  value="CUSTOMER"
                  control={<Radio />}
                  label="Book properties"
                />
                <FormControlLabel
                  value="PROPERTY_MANAGER"
                  control={<Radio />}
                  label="List properties"
                />
              </RadioGroup>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    style={{
                      color: 'inherit',
                      textDecoration: 'underline',
                    }}
                  >
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link
                    href="/privacy"
                    style={{
                      color: 'inherit',
                      textDecoration: 'underline',
                    }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mt: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

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
            size="large"
            startIcon={<Google />}
            onClick={handleGoogleSignUp}
          >
            Continue with Google
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 