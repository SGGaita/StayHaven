'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  BookOnline as BookingIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  SupervisorAccount as AdminIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend, onClick }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
      },
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: `${color}.lighter`,
            color: `${color}.main`,
            width: 44,
            height: 44,
          }}
        >
          {icon}
        </Avatar>
        {trend && (
          <Chip
            icon={<TrendingUpIcon />}
            label={trend}
            size="small"
            color="success"
            sx={{ ml: 'auto' }}
          />
        )}
      </Box>
      <Typography variant="h4" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    activeUsers: 0,
    systemHealth: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setError(null);
        // Fetch admin stats
        const statsResponse = await fetch('/api/admin/stats', {
          credentials: 'include',
        });
        
        const statsData = await statsResponse.json();
        
        if (!statsResponse.ok) {
          throw new Error(statsData.error || 'Failed to fetch admin stats');
        }

        setStats(statsData);

        // Fetch recent activities
        const activitiesResponse = await fetch('/api/admin/activities', {
          credentials: 'include',
        });
        
        const activitiesData = await activitiesResponse.json();
        
        if (!activitiesResponse.ok) {
          throw new Error(activitiesData.error || 'Failed to fetch activities');
        }

        setRecentActivities(activitiesData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError(error.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const adminStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers?.toLocaleString() || '0',
      icon: <PersonIcon />,
      color: 'primary',
      path: '/dashboard/admin/users',
    },
    {
      title: 'Properties',
      value: stats.totalProperties?.toLocaleString() || '0',
      icon: <ApartmentIcon />,
      color: 'info',
      path: '/dashboard/admin/properties',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: <MoneyIcon />,
      color: 'success',
      path: '/dashboard/admin/revenue',
    },
    {
      title: 'Active Bookings',
      value: stats.totalBookings?.toLocaleString() || '0',
      icon: <BookingIcon />,
      color: 'warning',
      path: '/dashboard/admin/bookings',
    },
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <PersonIcon />,
      color: 'primary',
      path: '/dashboard/admin/users',
    },
    {
      title: 'Property Verification',
      description: 'Review and verify property listings',
      icon: <ApartmentIcon />,
      color: 'success',
      path: '/dashboard/admin/properties/verification',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings and preferences',
      icon: <SettingsIcon />,
      color: 'info',
      path: '/dashboard/admin/settings',
    },
    {
      title: 'Security Center',
      description: 'Monitor and manage platform security',
      icon: <SecurityIcon />,
      color: 'error',
      path: '/dashboard/admin/security',
    },
  ];

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
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage your platform's performance and users
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {adminStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  trend={index === 0 ? '+12.5%' : null}
                  onClick={() => router.push(stat.path)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => router.push(action.path)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: `${action.color}.lighter`,
                            color: `${action.color}.main`,
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                System Health
              </Typography>
              <Tooltip title="View Details">
                <IconButton size="small" onClick={() => router.push('/dashboard/admin/system')}>
                  <ArrowForwardIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall Health
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {stats.systemHealth || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.systemHealth || 0}
                color={stats.systemHealth > 90 ? 'success' : stats.systemHealth > 70 ? 'warning' : 'error'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main' }}>
                    <WarningIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      {stats.pendingVerifications} Pending Verifications
                    </Typography>
                  }
                  secondary="Properties awaiting review"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      {stats.activeUsers} Active Users
                    </Typography>
                  }
                  secondary="Currently online"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
} 