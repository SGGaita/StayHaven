'use client';

import dynamic from 'next/dynamic';
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Editor } from '@tinymce/tinymce-react';

// Dynamically import react-beautiful-dnd with ssr disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

// Tab Panel Component
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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [navigation, setNavigation] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
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
    emailTemplates: [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to StayHaven!',
        content: 'Welcome to StayHaven! We\'re excited to have you on board.',
        variables: ['firstName', 'lastName', 'email'],
      },
      {
        id: 'booking-confirmation',
        name: 'Booking Confirmation',
        subject: 'Your Booking Confirmation',
        content: 'Your booking has been confirmed.',
        variables: ['bookingId', 'propertyName', 'checkIn', 'checkOut'],
      },
      {
        id: 'password-reset',
        name: 'Password Reset',
        subject: 'Password Reset Request',
        content: 'Click the link below to reset your password.',
        variables: ['resetLink', 'firstName'],
      },
    ],
  });

  useEffect(() => {
    fetchSettings();
    fetchSubscriptionPlans();
    fetchNavigation();
    fetchPages();
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
      setSettings(prev => ({
        ...prev,
        ...data,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch('/api/admin/subscription/plans', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch subscription plans');
      const data = await response.json();
      setSubscriptionPlans(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/admin/cms/navigation', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch navigation');
      const data = await response.json();
      setNavigation(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/cms/pages', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch pages');
      const data = await response.json();
      setPages(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (section) => {
    try {
      setError(null);
      setSuccess(null);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          section,
          settings: settings[section],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${section} settings`);
      }

      const data = await response.json();
      if (data.success) {
        setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`);
      } else {
        throw new Error(data.error || `Failed to update ${section} settings`);
      }
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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleTemplateEdit = (template) => {
    setCurrentTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleTemplateSave = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/settings/email-templates', {
        method: currentTemplate.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(currentTemplate),
      });

      if (!response.ok) {
        throw new Error('Failed to save email template');
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        emailTemplates: prev.emailTemplates.map(t => 
          t.id === currentTemplate.id ? currentTemplate : t
        ),
      }));

      setTemplateDialogOpen(false);
      setSuccess('Email template saved successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTemplateDelete = async (templateId) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/settings/email-templates?id=${templateId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete email template');
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        emailTemplates: prev.emailTemplates.filter(t => t.id !== templateId),
      }));

      setSuccess('Email template deleted successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await handleTemplateDelete(templateToDelete.id);
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
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

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="General" />
          <Tab label="Booking" />
          <Tab label="Payment" />
          <Tab label="Email" />
          <Tab label="Email Templates" />
          <Tab label="Security" />
          <Tab label="Subscription Plans" />
          <Tab label="Navigation" />
          <Tab label="Pages" />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={currentTab} index={0}>
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
        </TabPanel>

        {/* Booking Settings */}
        <TabPanel value={currentTab} index={1}>
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
        </TabPanel>

        {/* Payment Settings */}
        <TabPanel value={currentTab} index={2}>
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
        </TabPanel>

        {/* Email Settings */}
        <TabPanel value={currentTab} index={3}>
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
        </TabPanel>

        {/* Email Templates */}
        <TabPanel value={currentTab} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Email Templates
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setCurrentTemplate({
                  name: '',
                  subject: '',
                  content: '',
                  variables: [],
                });
                setTemplateDialogOpen(true);
              }}
            >
              Add Template
            </Button>
          </Box>
          <List>
            {settings.emailTemplates.map((template) => (
              <ListItem
                key={template.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={template.name}
                  secondary={template.subject}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleTemplateEdit(template)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteClick(template)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={currentTab} index={5}>
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
        </TabPanel>

        {/* Subscription Plans Tab */}
        <TabPanel value={currentTab} index={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Subscription Plans
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* Handle add plan */}}
            >
              Add Plan
            </Button>
          </Box>
          <Grid container spacing={3}>
            {subscriptionPlans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{plan.name}</Typography>
                    <Box>
                      <IconButton size="small" onClick={() => {/* Handle edit */}}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => {/* Handle delete */}}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    ${plan.price}/{plan.interval}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {plan.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={plan.isActive ? 'Active' : 'Inactive'}
                      color={plan.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Navigation Tab */}
        <TabPanel value={currentTab} index={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Navigation
            </Typography>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => {/* Handle save navigation */}}
            >
              Save Changes
            </Button>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Logo
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {navigation?.logo ? (
                    <Box
                      component="img"
                      src={navigation.logo}
                      alt="Logo"
                      sx={{ width: 100, height: 'auto' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                    </Box>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={() => {/* Handle logo upload */}}
                  >
                    Upload Logo
                  </Button>
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  Menu Items
                </Typography>
                <DragDropContext onDragEnd={() => {/* Handle drag end */}}>
                  <Droppable droppableId="menu-items">
                    {(provided) => (
                      <List
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{ bgcolor: 'background.paper' }}
                      >
                        {navigation?.items?.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided) => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                secondaryAction={
                                  <Box>
                                    <IconButton
                                      {...provided.dragHandleProps}
                                      size="small"
                                    >
                                      <DragIndicatorIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => {/* Handle edit */}}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => {/* Handle delete */}}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                }
                              >
                                <ListItemText
                                  primary={item.label}
                                  secondary={item.url}
                                />
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </DragDropContext>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {/* Handle add menu item */}}
                  sx={{ mt: 2 }}
                >
                  Add Menu Item
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Pages Tab */}
        <TabPanel value={currentTab} index={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Pages
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* Handle add page */}}
            >
              Add Page
            </Button>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <List>
                  {pages.map((page) => (
                    <ListItem
                      key={page.id}
                      button
                      selected={currentPage?.id === page.id}
                      onClick={() => setCurrentPage(page)}
                    >
                      <ListItemText
                        primary={page.title}
                        secondary={page.slug}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => {/* Handle delete */}}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            {currentPage && (
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Page Title"
                      value={currentPage.title}
                      onChange={(e) => {/* Handle title change */}}
                    />
                  </Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Sections
                  </Typography>
                  <DragDropContext onDragEnd={() => {/* Handle drag end */}}>
                    <Droppable droppableId="page-sections">
                      {(provided) => (
                        <List
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {currentPage.sections?.map((section, index) => (
                            <Draggable
                              key={section.id}
                              draggableId={section.id}
                              index={index}
                            >
                              {(provided) => (
                                <ListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    mb: 1,
                                  }}
                                >
                                  <ListItemText
                                    primary={section.name}
                                    secondary={`Order: ${section.order}`}
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      {...provided.dragHandleProps}
                                      size="small"
                                    >
                                      <DragIndicatorIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => {/* Handle edit */}}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => {/* Handle delete */}}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </List>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {/* Handle add section */}}
                    sx={{ mt: 2 }}
                  >
                    Add Section
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Email Template Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentTemplate?.id ? 'Edit Email Template' : 'New Email Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={currentTemplate?.name || ''}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Subject"
                value={currentTemplate?.subject || ''}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, subject: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Email Content
              </Typography>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={currentTemplate?.content || ''}
                init={{
                  height: 400,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                    'template', 'emoticons', 'hr', 'paste'
                  ],
                  toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | template | help',
                  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; }',
                  templates: [
                    { title: 'User Variables', description: 'Common user variables', content: '{{firstName}} {{lastName}} {{email}}' },
                    { title: 'Booking Variables', description: 'Common booking variables', content: '{{bookingId}} {{propertyName}} {{checkIn}} {{checkOut}}' },
                  ],
                  setup: (editor) => {
                    editor.on('init', () => {
                      editor.setContent(currentTemplate?.content || '');
                    });
                  }
                }}
                onEditorChange={(content) => setCurrentTemplate(prev => ({ ...prev, content }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Available Variables
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {currentTemplate?.variables?.map((variable) => (
                  <Chip
                    key={variable}
                    label={`{{${variable}}}`}
                    onClick={() => {
                      // Insert variable at cursor position in editor
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTemplateSave} variant="contained">
            Save Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Email Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{templateToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 