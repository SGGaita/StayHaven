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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Stack,
  Divider,
  useTheme,
  alpha,
  Container,
  TablePagination,
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
  Business as BusinessIcon,
  People as PeopleIcon,
  Subscriptions as SubscriptionsIcon,
  AccountBalance as AccountBalanceIcon,
  Message as MessageIcon,
  Verified as VerifiedIcon,
  PersonAdd as PersonAddIcon,
  Analytics as AnalyticsIcon,
  Web as WebIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  CurrencyExchange as CurrencyIcon,
  Dashboard as DashboardIcon,
  ViewList as ViewListIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon, color, trend, onClick, subtitle, loading }) => {
  const theme = useTheme();
  
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${theme.palette[color]?.main || '#FF385C'}, ${theme.palette[color]?.dark || '#E61E4D'})`,
        },
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette[color]?.main || '#FF385C', 0.15)}`,
          borderColor: alpha(theme.palette[color]?.main || '#FF385C', 0.3),
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{ 
                  mb: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {title}
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {value}
                </Typography>
              )}
              {subtitle && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.7rem',
                    opacity: 0.8,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                sx={{ 
                  width: 48,
                  height: 48,
                  background: alpha(theme.palette[color]?.main || '#FF385C', 0.1),
                  color: theme.palette[color]?.main || '#FF385C',
                  border: `2px solid ${alpha(theme.palette[color]?.main || '#FF385C', 0.1)}`,
                }}
              >
                {icon}
              </Avatar>
              {trend && (
                <Chip
                  size="small"
                  icon={<TrendingUpIcon fontSize="small" />}
                  label={trend}
                  color="success"
                  sx={{ 
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    background: theme.palette.success.main,
                    color: 'white',
                    border: `2px solid ${theme.palette.background.paper}`,
                  }}
                />
              )}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, color, onClick, badge }) => {
  const theme = useTheme();
  
  return (
    <Card
      elevation={0}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
          borderColor: alpha(theme.palette[color]?.main || '#FF385C', 0.3),
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Badge badgeContent={badge} color="error" max={99}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette[color]?.main || '#FF385C', 0.1),
                color: theme.palette[color]?.main || '#FF385C',
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
          </Badge>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <ArrowForwardIcon 
            sx={{ 
              color: 'text.secondary',
              opacity: 0.5,
              transition: 'all 0.2s ease-in-out',
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    propertyManagers: 0,
    customers: 0,
    activeSubscriptions: 0,
    totalProperties: 0,
    subscriptionRevenue: 0,
    pendingVerifications: 0,
    newAccounts: 0,
    systemHealth: 95,
  });
  const [accountsDue, setAccountsDue] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [newAccounts, setNewAccounts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchAdminData();
  }, [user, router]);

  const fetchAdminData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch comprehensive admin stats
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include',
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch accounts due
      const accountsDueResponse = await fetch('/api/admin/dashboard/accounts-due', {
        credentials: 'include',
      });
      
      if (accountsDueResponse.ok) {
        const accountsDueData = await accountsDueResponse.json();
        setAccountsDue(accountsDueData);
      }

      // Fetch recent messages
      const messagesResponse = await fetch('/api/admin/dashboard/messages', {
        credentials: 'include',
      });
      
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setRecentMessages(messagesData);
      }

      // Fetch pending verifications
      const verificationsResponse = await fetch('/api/admin/dashboard/pending-verifications', {
        credentials: 'include',
      });
      
      if (verificationsResponse.ok) {
        const verificationsData = await verificationsResponse.json();
        setPendingVerifications(verificationsData);
      }

      // Fetch new accounts
      const newAccountsResponse = await fetch('/api/admin/dashboard/new-accounts', {
        credentials: 'include',
      });
      
      if (newAccountsResponse.ok) {
        const newAccountsData = await newAccountsResponse.json();
        setNewAccounts(newAccountsData);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const adminStats = [
    {
      title: 'Property Managers',
      value: stats.propertyManagers?.toLocaleString() || '0',
      icon: <BusinessIcon />,
      color: 'primary',
      subtitle: 'Active hosts',
      onClick: () => router.push('/dashboard/admin/users?role=PROPERTY_MANAGER'),
    },
    {
      title: 'Customers',
      value: stats.customers?.toLocaleString() || '0',
      icon: <PeopleIcon />,
      color: 'info',
      subtitle: 'Platform users',
      onClick: () => router.push('/dashboard/admin/users?role=CUSTOMER'),
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions?.toLocaleString() || '0',
      icon: <SubscriptionsIcon />,
      color: 'success',
      subtitle: 'Paying hosts',
      onClick: () => router.push('/dashboard/admin/subscriptions'),
    },
    {
      title: 'Total Properties',
      value: stats.totalProperties?.toLocaleString() || '0',
      icon: <ApartmentIcon />,
      color: 'warning',
      subtitle: 'Listed properties',
      onClick: () => router.push('/dashboard/admin/properties'),
    },
    {
      title: 'Subscription Revenue',
      value: `$${(stats.subscriptionRevenue || 0).toLocaleString()}`,
      icon: <AccountBalanceIcon />,
      color: 'success',
      subtitle: 'Monthly recurring',
      trend: '+8.2%',
      onClick: () => router.push('/dashboard/admin/revenue'),
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth || 0}%`,
      icon: <DashboardIcon />,
      color: 'info',
      subtitle: 'Platform status',
      onClick: () => router.push('/dashboard/admin/system'),
    },
  ];

  const quickActions = [
    {
      title: 'Property Verification',
      description: 'Review and approve pending property listings',
      icon: <VerifiedIcon />,
      color: 'warning',
      badge: stats.pendingVerifications,
      onClick: () => router.push('/dashboard/admin/properties/verification'),
    },
    {
      title: 'New Accounts',
      description: 'Review and approve new user registrations',
      icon: <PersonAddIcon />,
      color: 'primary',
      badge: stats.newAccounts,
      onClick: () => router.push('/dashboard/admin/users/new'),
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <PersonIcon />,
      color: 'info',
      onClick: () => router.push('/dashboard/admin/users'),
    },
    {
      title: 'Analytics',
      description: 'View platform analytics and insights',
      icon: <AnalyticsIcon />,
      color: 'success',
      onClick: () => router.push('/dashboard/admin/analytics'),
    },
    {
      title: 'CMS Management',
      description: 'Manage content, navigation, and templates',
      icon: <WebIcon />,
      color: 'secondary',
      onClick: () => router.push('/dashboard/admin/cms'),
    },
    {
      title: 'Settings',
      description: 'Configure platform settings and preferences',
      icon: <SettingsIcon />,
      color: 'default',
      onClick: () => router.push('/dashboard/admin/settings'),
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
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
              Loading admin dashboard...
            </Typography>
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Admin Dashboard 🛠️
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
            Monitor platform performance, manage users, and oversee all operations
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {adminStats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={4} xl={2} key={index}>
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                subtitle={stat.subtitle}
                trend={stat.trend}
                onClick={stat.onClick}
                loading={loading}
              />
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4,
            borderRadius: 3,
            background: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            mb: 4,
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <QuickActionCard
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  color={action.color}
                  badge={action.badge}
                  onClick={action.onClick}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Data Tables */}
        <Grid container spacing={4}>
          {/* Accounts Due */}
          <Grid item xs={12} lg={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ 
                p: 3, 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Typography variant="h6" fontWeight="bold">
                  Accounts Due
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push('/dashboard/admin/billing')}
                >
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Property Manager</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accountsDue.slice(0, 5).map((account) => (
                      <TableRow key={account.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {account.user?.firstName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {account.user?.firstName} {account.user?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {account.user?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="error.main">
                            {formatCurrency(account.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(account.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={account.status}
                            color={account.status === 'OVERDUE' ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {accountsDue.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No accounts due
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Recent Messages */}
          <Grid item xs={12} lg={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ 
                p: 3, 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Messages
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push('/dashboard/admin/messages')}
                >
                  View All
                </Button>
              </Box>
              <List sx={{ p: 0 }}>
                {recentMessages.slice(0, 5).map((message, index) => (
                  <ListItem 
                    key={message.id} 
                    sx={{ 
                      borderBottom: index < 4 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {message.sender?.firstName?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="medium">
                          {message.sender?.firstName} {message.sender?.lastName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {message.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(message.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    {!message.read && (
                      <Chip label="New" color="primary" size="small" />
                    )}
                  </ListItem>
                ))}
              </List>
              {recentMessages.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent messages
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Pending Verifications */}
          <Grid item xs={12} lg={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ 
                p: 3, 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Typography variant="h6" fontWeight="bold">
                  Pending Verifications
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push('/dashboard/admin/properties/verification')}
                >
                  View All
                </Button>
              </Box>
              <List sx={{ p: 0 }}>
                {pendingVerifications.slice(0, 5).map((property, index) => (
                  <ListItem 
                    key={property.id} 
                    sx={{ 
                      borderBottom: index < 4 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.warning.main, 0.05),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={property.photos?.[0]} 
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      >
                        <ApartmentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="medium">
                          {property.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {property.owner?.firstName} {property.owner?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Submitted {formatDate(property.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip 
                      label="Pending" 
                      color="warning" 
                      size="small" 
                      icon={<ScheduleIcon fontSize="small" />}
                    />
                  </ListItem>
                ))}
              </List>
              {pendingVerifications.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No pending verifications
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* New Accounts */}
          <Grid item xs={12} lg={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ 
                p: 3, 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Typography variant="h6" fontWeight="bold">
                  New Accounts
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push('/dashboard/admin/users/new')}
                >
                  View All
                </Button>
              </Box>
              <List sx={{ p: 0 }}>
                {newAccounts.slice(0, 5).map((account, index) => (
                  <ListItem 
                    key={account.id} 
                    sx={{ 
                      borderBottom: index < 4 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {account.firstName?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="medium">
                          {account.firstName} {account.lastName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {account.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Joined {formatDate(account.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip 
                      label={account.role} 
                      color={account.role === 'PROPERTY_MANAGER' ? 'primary' : 'default'} 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
              {newAccounts.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No new accounts
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
} 