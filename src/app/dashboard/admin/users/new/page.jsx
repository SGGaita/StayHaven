'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Container,
  useTheme,
  alpha,
  IconButton,
  InputAdornment,
  FormHelperText,
  Chip,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  AdminPanelSettings as AdminIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const roleConfig = {
  SUPER_ADMIN: { 
    color: 'error', 
    icon: <AdminIcon />, 
    label: 'Super Admin',
    description: 'Full platform access and control'
  },
  ADMIN: { 
    color: 'warning', 
    icon: <AdminIcon />, 
    label: 'Admin',
    description: 'Administrative access to manage users and content'
  },
  PROPERTY_MANAGER: { 
    color: 'info', 
    icon: <BusinessIcon />, 
    label: 'Property Manager',
    description: 'Can manage properties and bookings'
  },
  CUSTOMER: { 
    color: 'success', 
    icon: <PersonIcon />, 
    label: 'Customer',
    description: 'Standard platform user'
  },
};

export default function NewUserPage() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    verificationStatus: 'PENDING',
    profileInfo: {
      bio: '',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
    },
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleNestedInputChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      profileInfo: {
        ...prev.profileInfo,
        address: {
          ...prev.profileInfo.address,
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          password: formData.password,
          role: formData.role,
          verificationStatus: formData.verificationStatus,
          profileInfo: {
            bio: formData.profileInfo.bio.trim() || null,
            dateOfBirth: formData.profileInfo.dateOfBirth || null,
            address: {
              street: formData.profileInfo.address.street.trim() || null,
              city: formData.profileInfo.address.city.trim() || null,
              state: formData.profileInfo.address.state.trim() || null,
              country: formData.profileInfo.address.country.trim() || null,
              zipCode: formData.profileInfo.address.zipCode.trim() || null,
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const newUser = await response.json();
      setSuccess(true);
      
      // Redirect to users list after a short delay
      setTimeout(() => {
        router.push('/dashboard/admin/users');
      }, 2000);

    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/admin/users');
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            sx={{ mb: 2 }}
          >
            Back to Users
          </Button>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#FF385C', 0.05)} 0%, ${alpha('#FF385C', 0.02)} 100%)`,
              border: `1px solid ${alpha('#FF385C', 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64,
                  background: `linear-gradient(135deg, #FF385C 0%, #E61E4D 100%)`,
                  color: 'white',
                }}
              >
                <PersonAddIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Add New User
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Create a new user account with role-based permissions
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
          >
            User created successfully! Redirecting to users list...
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <PersonIcon color="primary" />
                    Basic Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        error={!!formErrors.firstName}
                        helperText={formErrors.firstName}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        error={!!formErrors.lastName}
                        helperText={formErrors.lastName}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        error={!!formErrors.phone}
                        helperText={formErrors.phone || 'Optional'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        error={!!formErrors.password}
                        helperText={formErrors.password || 'Minimum 8 characters'}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        error={!!formErrors.confirmPassword}
                        helperText={formErrors.confirmPassword}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        multiline
                        rows={3}
                        value={formData.profileInfo.bio}
                        onChange={(e) => handleNestedInputChange('profileInfo', 'bio', e.target.value)}
                        helperText="Optional: Brief description about the user"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={formData.profileInfo.dateOfBirth}
                        onChange={(e) => handleNestedInputChange('profileInfo', 'dateOfBirth', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        helperText="Optional"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, mt: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <LocationIcon color="primary" />
                    Address Information (Optional)
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Street Address"
                        value={formData.profileInfo.address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        value={formData.profileInfo.address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="State/Province"
                        value={formData.profileInfo.address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        value={formData.profileInfo.address.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ZIP/Postal Code"
                        value={formData.profileInfo.address.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Role and Status */}
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <AdminIcon color="primary" />
                    Role & Permissions
                  </Typography>
                  
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>User Role</InputLabel>
                      <Select
                        value={formData.role}
                        label="User Role"
                        onChange={(e) => handleInputChange('role', e.target.value)}
                      >
                        {Object.entries(roleConfig).map(([key, config]) => (
                          <MenuItem key={key} value={key}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {config.icon}
                              {config.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {roleConfig[formData.role]?.description}
                      </FormHelperText>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Verification Status</InputLabel>
                      <Select
                        value={formData.verificationStatus}
                        label="Verification Status"
                        onChange={(e) => handleInputChange('verificationStatus', e.target.value)}
                      >
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="VERIFIED">Verified</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                        <MenuItem value="BLOCKED">Blocked</MenuItem>
                      </Select>
                      <FormHelperText>
                        Initial verification status for the new user
                      </FormHelperText>
                    </FormControl>

                    {/* Role Information Card */}
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      background: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: theme.palette.primary.main,
                          width: 40,
                          height: 40
                        }}>
                          {roleConfig[formData.role]?.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {roleConfig[formData.role]?.label}
                          </Typography>
                          <Chip 
                            label={formData.role}
                            color={roleConfig[formData.role]?.color}
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {roleConfig[formData.role]?.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, mt: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                        background: '#FF385C',
                        '&:hover': {
                          background: '#E61E4D',
                        },
                      }}
                    >
                      {loading ? 'Creating User...' : 'Create User'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                        borderColor: '#FF385C',
                        color: '#FF385C',
                        '&:hover': {
                          borderColor: '#E61E4D',
                          color: '#E61E4D',
                          background: alpha('#FF385C', 0.05),
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Container>
    </DashboardLayout>
  );
} 