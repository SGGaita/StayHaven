'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true,
    },
    booking: {
      minBookingDays: 1,
      maxBookingDays: 30,
      allowInstantBooking: true,
      cancellationPeriod: 24,
      autoApproveBookings: false,
    },
    payment: {
      currency: 'USD',
      serviceFeePercentage: 10,
      minimumPayout: 100,
      payoutSchedule: 'WEEKLY',
    },
    email: {
      fromName: '',
      fromEmail: '',
      smtpHost: '',
      smtpPort: '',
      smtpUsername: '',
      smtpPassword: '',
      enableEmailNotifications: true,
    },
    security: {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      passwordExpiryDays: 90,
      requireStrongPasswords: true,
      enable2FA: false,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/settings', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section) => {
    try {
      setError(null);
      setSuccess(null);
      const response = await fetch(`/api/admin/settings/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings[section]),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${section} settings`);
      }

      setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure platform settings and preferences
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                General Settings
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('general')}
              >
                Save Changes
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={settings.general.siteName}
                  onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site Description"
                  value={settings.general.siteDescription}
                  onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => handleChange('general', 'maintenanceMode', e.target.checked)}
                    />
                  }
                  label="Maintenance Mode"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.allowRegistration}
                      onChange={(e) => handleChange('general', 'allowRegistration', e.target.checked)}
                    />
                  }
                  label="Allow Registration"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.requireEmailVerification}
                      onChange={(e) => handleChange('general', 'requireEmailVerification', e.target.checked)}
                    />
                  }
                  label="Require Email Verification"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Booking Settings */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Booking Settings
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('booking')}
              >
                Save Changes
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Booking Days"
                  value={settings.booking.minBookingDays}
                  onChange={(e) => handleChange('booking', 'minBookingDays', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Booking Days"
                  value={settings.booking.maxBookingDays}
                  onChange={(e) => handleChange('booking', 'maxBookingDays', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cancellation Period (hours)"
                  value={settings.booking.cancellationPeriod}
                  onChange={(e) => handleChange('booking', 'cancellationPeriod', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.booking.allowInstantBooking}
                      onChange={(e) => handleChange('booking', 'allowInstantBooking', e.target.checked)}
                    />
                  }
                  label="Allow Instant Booking"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Payment Settings */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Payment Settings
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('payment')}
              >
                Save Changes
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.payment.currency}
                    label="Currency"
                    onChange={(e) => handleChange('payment', 'currency', e.target.value)}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Service Fee Percentage"
                  value={settings.payment.serviceFeePercentage}
                  onChange={(e) => handleChange('payment', 'serviceFeePercentage', parseFloat(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Payout Amount"
                  value={settings.payment.minimumPayout}
                  onChange={(e) => handleChange('payment', 'minimumPayout', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payout Schedule</InputLabel>
                  <Select
                    value={settings.payment.payoutSchedule}
                    label="Payout Schedule"
                    onChange={(e) => handleChange('payment', 'payoutSchedule', e.target.value)}
                  >
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                    <MenuItem value="BIWEEKLY">Bi-weekly</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Email Settings */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Email Settings
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('email')}
              >
                Save Changes
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Name"
                  value={settings.email.fromName}
                  onChange={(e) => handleChange('email', 'fromName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Email"
                  value={settings.email.fromEmail}
                  onChange={(e) => handleChange('email', 'fromEmail', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={settings.email.smtpHost}
                  onChange={(e) => handleChange('email', 'smtpHost', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  value={settings.email.smtpPort}
                  onChange={(e) => handleChange('email', 'smtpPort', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Username"
                  value={settings.email.smtpUsername}
                  onChange={(e) => handleChange('email', 'smtpUsername', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="SMTP Password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => handleChange('email', 'smtpPassword', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.enableEmailNotifications}
                      onChange={(e) => handleChange('email', 'enableEmailNotifications', e.target.checked)}
                    />
                  }
                  label="Enable Email Notifications"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Security Settings
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('security')}
              >
                Save Changes
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Login Attempts"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Lockout Duration (minutes)"
                  value={settings.security.lockoutDuration}
                  onChange={(e) => handleChange('security', 'lockoutDuration', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Password Expiry (days)"
                  value={settings.security.passwordExpiryDays}
                  onChange={(e) => handleChange('security', 'passwordExpiryDays', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.requireStrongPasswords}
                      onChange={(e) => handleChange('security', 'requireStrongPasswords', e.target.checked)}
                    />
                  }
                  label="Require Strong Passwords"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.enable2FA}
                      onChange={(e) => handleChange('security', 'enable2FA', e.target.checked)}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
} 