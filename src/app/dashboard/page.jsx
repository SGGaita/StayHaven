'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  BookOnline as BookingIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import { useTheme } from '@mui/material/styles';

const StatCard = ({ title, value, icon, color, trend, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          borderColor: `${color}.main`,
          '& .stat-icon': {
            transform: 'scale(1.1)',
          },
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ height: '100%', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ 
                mb: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.mode === 'light' ? 'grey.800' : 'grey.100',
                }}
              >
                {value}
              </Typography>
              {trend && (
                <Chip
                  size="small"
                  icon={<TrendingUpIcon fontSize="small" />}
                  label={trend}
                  color="success"
                  sx={{ 
                    height: 24,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    },
                  }}
                />
              )}
            </Box>
          </Box>
          <Avatar 
            className="stat-icon"
            sx={{ 
              width: 48,
              height: 48,
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {onClick && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: `${color}.main`,
              '& svg': {
                transition: 'transform 0.2s ease-in-out',
              },
              '&:hover svg': {
                transform: 'translateX(4px)',
              },
            }}
          >
            <Typography 
              variant="button" 
              sx={{ 
                fontSize: '0.875rem',
                fontWeight: 600,
                mr: 1,
                textTransform: 'none',
              }}
            >
              View Details
            </Typography>
            <ArrowForwardIcon fontSize="small" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const BookingStatus = {
  PENDING: { color: 'warning', label: 'Pending' },
  CONFIRMED: { color: 'success', label: 'Confirmed' },
  CANCELLED: { color: 'error', label: 'Cancelled' },
};

const RoleBasedStats = {
  SUPER_ADMIN: [
    { title: 'Total Users', icon: <PersonIcon />, color: 'primary', path: '/dashboard/users' },
    { title: 'Properties', icon: <ApartmentIcon />, color: 'info', path: '/dashboard/properties' },
    { title: 'Total Revenue', icon: <MoneyIcon />, color: 'success', path: '/dashboard/revenue' },
    { title: 'Avg. Rating', icon: <StarIcon />, color: 'warning', path: '/dashboard/reviews' },
  ],
  PROPERTY_MANAGER: [
    { title: 'My Properties', icon: <ApartmentIcon />, color: 'primary', path: '/dashboard/properties' },
    { title: 'Active Bookings', icon: <BookingIcon />, color: 'success', path: '/dashboard/bookings' },
    { title: 'Monthly Revenue', icon: <MoneyIcon />, color: 'info', path: '/dashboard/revenue' },
    { title: 'Avg. Rating', icon: <StarIcon />, color: 'warning', path: '/dashboard/reviews' },
  ],
  CUSTOMER: [
    { title: 'Active Bookings', icon: <BookingIcon />, color: 'primary', path: '/dashboard/bookings' },
    { title: 'Total Spent', icon: <MoneyIcon />, color: 'info', path: '/dashboard/spending' },
    { title: 'Favorite Properties', icon: <ApartmentIcon />, color: 'success', path: '/dashboard/favorites' },
    { title: 'Reviews Given', icon: <StarIcon />, color: 'warning', path: '/dashboard/reviews' },
  ],
};

export default function Dashboard() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats', {
          credentials: 'include'
        });

        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard statistics');
        }

        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch recent bookings
        const bookingsResponse = await fetch('/api/dashboard/recent-bookings', {
          credentials: 'include'
        });

        if (!bookingsResponse.ok) {
          const errorData = await bookingsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch recent bookings');
        }

        const bookingsData = await bookingsResponse.json();
        setRecentBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'An error occurred while fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const roleStats = RoleBasedStats[user?.role || 'CUSTOMER'];

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const getStatValue = (title) => {
    switch (title) {
      case 'My Properties':
      case 'Total Properties':
        return stats.totalProperties;
      case 'Active Bookings':
        return stats.activeBookings;
      case 'Monthly Revenue':
      case 'Total Revenue':
        return `$${stats.monthlyRevenue.toLocaleString()}`;
      case 'Avg. Rating':
        return stats.averageRating.toFixed(1);
      default:
        return '0';
    }
  };

  return (
    <DashboardLayout>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your {user?.role === 'PROPERTY_MANAGER' ? 'properties' : 'bookings'} today.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {roleStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={stat.title}
              value={getStatValue(stat.title)}
              icon={stat.icon}
              color={stat.color}
              trend={index === 0 ? '+12.5%' : null}
              onClick={() => router.push(stat.path)}
            />
          </Grid>
        ))}
      </Grid>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Recent {user?.role === 'CUSTOMER' ? 'Bookings' : 'Activity'}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => router.push('/dashboard/bookings')}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
            }}
          >
            View All
          </Button>
        </Box>
        
        {recentBookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No recent activity to display
            </Typography>
          </Box>
        ) : (
          <List>
            {recentBookings.map((booking, index) => (
              <ListItem
                key={booking.id}
                divider={index !== recentBookings.length - 1}
                sx={{
                  px: 2,
                  py: 2,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={booking.property.photos[0]} 
                    alt={booking.property.name}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  >
                    <ApartmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="medium">
                      {booking.property.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </Typography>
                      {user?.role !== 'CUSTOMER' && (
                        <Typography variant="body2" color="text.secondary">
                          Booked by: {booking.customer.firstName} {booking.customer.lastName}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    ${booking.price}
                  </Typography>
                  <Chip
                    label={BookingStatus[booking.status].label}
                    color={BookingStatus[booking.status].color}
                    size="small"
                    sx={{ borderRadius: '12px' }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </DashboardLayout>
  );
} 