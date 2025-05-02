'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Password as PasswordIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SecurityManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
      preventPasswordReuse: true,
      passwordHistory: 5,
    },
    loginSecurity: {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      requireCaptcha: true,
      enable2FA: false,
      allowRememberMe: true,
      sessionTimeout: 60,
    },
    accountSecurity: {
      requireEmailVerification: true,
      allowPasswordReset: true,
      passwordResetExpiry: 24,
      requireStrongPasswords: true,
      enforceUniqueEmails: true,
      preventConcurrentSessions: false,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/security/settings');
      if (!response.ok) throw new Error('Failed to fetch security settings');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/security/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save security settings');

      setSuccess('Security settings saved successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
          Security Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure system-wide security policies and settings
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

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Password Policy Section */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PasswordIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Password Policy
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Password Length"
                value={settings.passwordPolicy.minLength}
                onChange={(e) => handleChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Minimum number of characters required for passwords">
                        <IconButton size="small">
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Password Expiry Days"
                value={settings.passwordPolicy.passwordExpiryDays}
                onChange={(e) => handleChange('passwordPolicy', 'passwordExpiryDays', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Password History"
                value={settings.passwordPolicy.passwordHistory}
                onChange={(e) => handleChange('passwordPolicy', 'passwordHistory', parseInt(e.target.value))}
                helperText="Number of previous passwords to remember"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.passwordPolicy.requireUppercase}
                    onChange={(e) => handleChange('passwordPolicy', 'requireUppercase', e.target.checked)}
                  />
                }
                label="Require Uppercase Letters"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.passwordPolicy.requireLowercase}
                    onChange={(e) => handleChange('passwordPolicy', 'requireLowercase', e.target.checked)}
                  />
                }
                label="Require Lowercase Letters"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.passwordPolicy.requireNumbers}
                    onChange={(e) => handleChange('passwordPolicy', 'requireNumbers', e.target.checked)}
                  />
                }
                label="Require Numbers"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.passwordPolicy.requireSpecialChars}
                    onChange={(e) => handleChange('passwordPolicy', 'requireSpecialChars', e.target.checked)}
                  />
                }
                label="Require Special Characters"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Login Security Section */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LockIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Login Security
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Login Attempts"
                value={settings.loginSecurity.maxLoginAttempts}
                onChange={(e) => handleChange('loginSecurity', 'maxLoginAttempts', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Lockout Duration (minutes)"
                value={settings.loginSecurity.lockoutDuration}
                onChange={(e) => handleChange('loginSecurity', 'lockoutDuration', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Session Timeout (minutes)"
                value={settings.loginSecurity.sessionTimeout}
                onChange={(e) => handleChange('loginSecurity', 'sessionTimeout', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.loginSecurity.requireCaptcha}
                    onChange={(e) => handleChange('loginSecurity', 'requireCaptcha', e.target.checked)}
                  />
                }
                label="Require CAPTCHA on Login"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.loginSecurity.enable2FA}
                    onChange={(e) => handleChange('loginSecurity', 'enable2FA', e.target.checked)}
                  />
                }
                label="Enable Two-Factor Authentication"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.loginSecurity.allowRememberMe}
                    onChange={(e) => handleChange('loginSecurity', 'allowRememberMe', e.target.checked)}
                  />
                }
                label="Allow Remember Me"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Account Security Section */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SecurityIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Account Security
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Password Reset Link Expiry (hours)"
                value={settings.accountSecurity.passwordResetExpiry}
                onChange={(e) => handleChange('accountSecurity', 'passwordResetExpiry', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accountSecurity.requireEmailVerification}
                    onChange={(e) => handleChange('accountSecurity', 'requireEmailVerification', e.target.checked)}
                  />
                }
                label="Require Email Verification"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accountSecurity.allowPasswordReset}
                    onChange={(e) => handleChange('accountSecurity', 'allowPasswordReset', e.target.checked)}
                  />
                }
                label="Allow Password Reset"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accountSecurity.requireStrongPasswords}
                    onChange={(e) => handleChange('accountSecurity', 'requireStrongPasswords', e.target.checked)}
                  />
                }
                label="Enforce Strong Password Policy"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accountSecurity.enforceUniqueEmails}
                    onChange={(e) => handleChange('accountSecurity', 'enforceUniqueEmails', e.target.checked)}
                  />
                }
                label="Enforce Unique Email Addresses"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accountSecurity.preventConcurrentSessions}
                    onChange={(e) => handleChange('accountSecurity', 'preventConcurrentSessions', e.target.checked)}
                  />
                }
                label="Prevent Concurrent Sessions"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Save Button */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </DashboardLayout>
  );
} 