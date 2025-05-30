'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Avatar,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  CreditCard as CreditCardIcon,
  Language as LanguageIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setUser } from '@/redux/features/authSlice';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailBookingConfirmation: true,
    emailPromotions: true,
    pushNotifications: true,
    smsUpdates: false,
    weeklyNewsletter: true,
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessagesFromHosts: true,
    allowReviewsFromGuests: true,
  });

  // Password Settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/auth/signin');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch complete user profile data
        const profileResponse = await fetch('/api/user/profile', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.user) {
            const userData = profileData.user;
            setProfileData({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              bio: userData.bio || '',
              avatar: userData.avatar || '',
            });
          }
        }

        // Fetch user settings
        await fetchUserSettings();
      } catch (err) {
        console.error('Error fetching user data:', err);
        setMessage({ type: 'error', text: 'Failed to load profile data. Please refresh the page.' });
        setTimeout(() => setMessage(null), 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/settings', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user settings');
      }

      const data = await response.json();
      setNotificationSettings(data.notifications || notificationSettings);
      setPrivacySettings(data.privacy || privacySettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Continue with default settings
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({ 
      ...prev, 
      [setting]: !prev[setting] 
    }));
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const validateProfileForm = () => {
    const errors = {};

    if (!profileData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (profileData.phone && profileData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(profileData.phone.replace(/\s/g, ''))) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setUploadingPhoto(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }
      
      // Update profile data with new avatar URL
      setProfileData(prev => ({ ...prev, avatar: data.avatarUrl }));
      
      // Update Redux store with new avatar
      dispatch(setUser({
        ...user,
        avatar: data.avatarUrl
      }));
      
      setMessage({ type: 'success', text: data.message || 'Profile photo updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to upload photo. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    // Clear previous errors
    setFormErrors({});
    
    // Validate form
    if (!validateProfileForm()) {
      setMessage({ type: 'error', text: 'Please correct the errors below.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update Redux store with the updated profile data
      dispatch(setUser({
        ...user,
        ...profileData
      }));

      setMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/settings/notifications', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationSettings)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update notification settings');
      }

      setMessage({ type: 'success', text: data.message || 'Notification settings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating notifications:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update notification settings. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/settings/privacy', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(privacySettings)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update privacy settings');
      }

      setMessage({ type: 'success', text: data.message || 'Privacy settings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating privacy:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update privacy settings. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Basic validation
    if (!passwordData.currentPassword.trim()) {
      setMessage({ type: 'error', text: 'Current password is required.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!passwordData.newPassword.trim()) {
      setMessage({ type: 'error', text: 'New password is required.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const hasNumber = /\d/.test(passwordData.newPassword);
    const hasLetter = /[a-zA-Z]/.test(passwordData.newPassword);
    
    if (!hasNumber || !hasLetter) {
      setMessage({ type: 'error', text: 'New password must contain at least one letter and one number.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: data.message || 'Password changed successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to change password. Please check your current password.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          gap: 2,
        }}>
          <CircularProgress size={48} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Loading settings...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ 
          mb: 6,
          p: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha('#FF385C', 0.05)} 0%, ${alpha('#FF385C', 0.02)} 100%)`,
          border: `1px solid ${alpha('#FF385C', 0.1)}`,
        }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              color: '#FF385C',
              mb: 2,
            }}
          >
            ⚙️ Account Settings
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              fontWeight: 400,
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
          >
            Manage your account preferences, privacy settings, and personal information.
          </Typography>
        </Box>

        {message && (
          <Alert 
            severity={message.type} 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
            }}
          >
            {message.text}
          </Alert>
        )}

        {/* Settings Content */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 72,
                  px: 3,
                },
                '& .Mui-selected': {
                  color: '#FF385C',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#FF385C',
                },
              }}
            >
              <Tab icon={<PersonIcon />} label="Profile" />
              <Tab icon={<NotificationsIcon />} label="Notifications" />
              <Tab icon={<VisibilityIcon />} label="Privacy" />
              <Tab icon={<SecurityIcon />} label="Security" />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          <TabPanel value={activeTab} index={0}>
            <Container maxWidth="md" sx={{ py: 0 }}>
              <Stack spacing={4}>
                {/* Avatar Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={profileData.avatar}
                      sx={{ width: 100, height: 100, fontSize: '2rem' }}
                    >
                      {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        component="span"
                        disabled={uploadingPhoto}
                        sx={{
                          position: 'absolute',
                          bottom: -5,
                          right: -5,
                          backgroundColor: '#FF385C',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#E61E4D',
                          },
                          '&:disabled': {
                            backgroundColor: theme.palette.action.disabled,
                          },
                        }}
                        size="small"
                      >
                        {uploadingPhoto ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PhotoCameraIcon fontSize="small" />
                        )}
                      </IconButton>
                    </label>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Profile Photo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Update your profile picture to help others recognize you
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supported formats: JPG, PNG, GIF (max 5MB)
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Personal Information */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone || 'Optional'}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      placeholder="Tell us a little about yourself..."
                      helperText="Optional - A brief description about yourself"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      backgroundColor: '#FF385C',
                      '&:hover': {
                        backgroundColor: '#E61E4D',
                      },
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
            </Container>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={1}>
            <Container maxWidth="md" sx={{ py: 0 }}>
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight="bold">
                  Email Notifications
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Booking Confirmations"
                      secondary="Receive email confirmations for new bookings"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.emailBookingConfirmation}
                        onChange={() => handleNotificationChange('emailBookingConfirmation')}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FF385C',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FF385C',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Promotional Emails"
                      secondary="Receive emails about special offers and promotions"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.emailPromotions}
                        onChange={() => handleNotificationChange('emailPromotions')}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FF385C',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FF385C',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Weekly Newsletter"
                      secondary="Stay updated with our weekly newsletter"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.weeklyNewsletter}
                        onChange={() => handleNotificationChange('weeklyNewsletter')}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FF385C',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FF385C',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Divider />

                <Typography variant="h6" fontWeight="bold">
                  Push Notifications
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="App Notifications"
                      secondary="Receive push notifications in the app"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onChange={() => handleNotificationChange('pushNotifications')}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FF385C',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FF385C',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="SMS Updates"
                      secondary="Receive SMS notifications for urgent updates"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.smsUpdates}
                        onChange={() => handleNotificationChange('smsUpdates')}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FF385C',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FF385C',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      backgroundColor: '#FF385C',
                      '&:hover': {
                        backgroundColor: '#E61E4D',
                      },
                    }}
                  >
                    Save Settings
                  </Button>
                </Box>
              </Stack>
            </Container>
          </TabPanel>

          {/* Privacy Tab */}
          <TabPanel value={activeTab} index={2}>
            <Container maxWidth="md" sx={{ py: 0 }}>
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight="bold">
                  Profile Visibility
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Show Email Address"
                      secondary="Allow other users to see your email address"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={privacySettings.showEmail}
                        onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FF385C',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FF385C',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Show Phone Number"
                      secondary="Allow other users to see your phone number"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={privacySettings.showPhone}
                        onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FF385C',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FF385C',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Divider />

                <Typography variant="h6" fontWeight="bold">
                  Communication Preferences
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Allow Messages from Hosts"
                      secondary="Property owners can send you direct messages"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={privacySettings.allowMessagesFromHosts}
                        onChange={(e) => handlePrivacyChange('allowMessagesFromHosts', e.target.checked)}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FF385C',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FF385C',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Allow Reviews from Guests"
                      secondary="Other guests can leave reviews about your stay"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={privacySettings.allowReviewsFromGuests}
                        onChange={(e) => handlePrivacyChange('allowReviewsFromGuests', e.target.checked)}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FF385C',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FF385C',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSavePrivacy}
                    disabled={saving}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      backgroundColor: '#FF385C',
                      '&:hover': {
                        backgroundColor: '#E61E4D',
                      },
                    }}
                  >
                    Save Settings
                  </Button>
                </Box>
              </Stack>
            </Container>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={3}>
            <Container maxWidth="md" sx={{ py: 0 }}>
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight="bold">
                  Change Password
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      helperText="Must be at least 8 characters with letters and numbers"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Typography variant="h6" fontWeight="bold">
                  Account Security
                </Typography>
                
                <Card 
                  elevation={0}
                  sx={{ 
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Two-Factor Authentication
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add an extra layer of security to your account
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#FF385C',
                        color: '#FF385C',
                        '&:hover': {
                          borderColor: '#E61E4D',
                          backgroundColor: alpha('#FF385C', 0.04),
                        },
                      }}
                    >
                      Enable 2FA
                    </Button>
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      backgroundColor: '#FF385C',
                      '&:hover': {
                        backgroundColor: '#E61E4D',
                      },
                    }}
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                    }}
                  >
                    Delete Account
                  </Button>
                </Box>
              </Stack>
            </Container>
          </TabPanel>
        </Paper>
      </Container>
    </DashboardLayout>
  );
} 