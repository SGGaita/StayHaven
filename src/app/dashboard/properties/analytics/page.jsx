'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  useTheme,
  alpha,
  LinearProgress,
  Stack,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  BookOnline as BookingIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Apartment as ApartmentIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const MetricCard = ({ title, value, change, icon, color, description }) => {
  const theme = useTheme();
  const isPositive = change >= 0;
  
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5, color: 'text.primary' }}>
                {value}
              </Typography>
              {description && (
                <Typography variant="caption" color="text.secondary">
                  {description}
                </Typography>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isPositive ? (
              <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
            ) : (
              <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: isPositive ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {isPositive ? '+' : ''}{change}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function PropertyAnalytics() {
  const theme = useTheme();
  const user = useSelector(selectCurrentUser);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalBookings: 0,
      occupancyRate: 0,
      averageRating: 0,
      revenueChange: 0,
      bookingsChange: 0,
      occupancyChange: 0,
      ratingChange: 0,
    },
    revenueData: [],
    bookingData: [],
    propertyPerformance: [],
    topProperties: [],
    recentActivity: [],
  });
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchProperties();
  }, [timeRange, selectedProperty]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/dashboard/properties/analytics?timeRange=${timeRange}&propertyId=${selectedProperty}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/dashboard/properties', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleExportReport = () => {
    // TODO: Implement PDF report generation
    console.log('Exporting analytics report...');
  };

  // Sample data for demonstration
  const revenueData = [
    { month: 'Jan', revenue: 4500, bookings: 12 },
    { month: 'Feb', revenue: 5200, bookings: 15 },
    { month: 'Mar', revenue: 4800, bookings: 13 },
    { month: 'Apr', revenue: 6100, bookings: 18 },
    { month: 'May', revenue: 7200, bookings: 22 },
    { month: 'Jun', revenue: 8500, bookings: 25 },
  ];

  const propertyTypeData = [
    { name: 'Apartment', value: 45, color: '#FF385C' },
    { name: 'House', value: 30, color: '#00A699' },
    { name: 'Villa', value: 15, color: '#FC642D' },
    { name: 'Studio', value: 10, color: '#484848' },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Property Analytics 📊
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track your property performance and revenue insights
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportReport}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                px: 3,
                background: '#FF385C',
                '&:hover': {
                  background: '#E61E4D',
                },
              }}
            >
              Export Report
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 3 months</MenuItem>
                <MenuItem value="1y">Last year</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Property</InputLabel>
              <Select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                label="Property"
              >
                <MenuItem value="all">All Properties</MenuItem>
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ mb: 4 }}>
            <LinearProgress />
          </Box>
        ) : null}

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Total Revenue"
              value="$24,500"
              change={12.5}
              icon={<MoneyIcon />}
              color="#00C851"
              description="This month"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Total Bookings"
              value="68"
              change={8.2}
              icon={<BookingIcon />}
              color="#FF385C"
              description="This month"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Occupancy Rate"
              value="78%"
              change={-2.1}
              icon={<CalendarIcon />}
              color="#FF6900"
              description="Average"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Average Rating"
              value="4.8"
              change={5.3}
              icon={<StarIcon />}
              color="#FFD600"
              description="All properties"
            />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue Trend */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: 400,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF385C"
                    fill={alpha('#FF385C', 0.1)}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Property Type Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: 400,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Property Types
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Bookings and Performance */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Monthly Bookings */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: 350,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Monthly Bookings
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="bookings" fill="#FF385C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Performing Properties */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: 350,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Performing Properties
              </Typography>
              <List sx={{ p: 0 }}>
                {[
                  { name: 'Luxury Downtown Apartment', revenue: '$8,500', bookings: 15, rating: 4.9 },
                  { name: 'Cozy Beach House', revenue: '$6,200', bookings: 12, rating: 4.7 },
                  { name: 'Modern City Loft', revenue: '$5,800', bookings: 10, rating: 4.8 },
                  { name: 'Family Villa', revenue: '$4,900', bookings: 8, rating: 4.6 },
                ].map((property, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      px: 0,
                      py: 1.5,
                      borderBottom: index < 3 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: alpha('#FF385C', 0.1),
                          color: '#FF385C',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {property.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Chip
                            label={property.revenue}
                            size="small"
                            sx={{
                              bgcolor: alpha('#00C851', 0.1),
                              color: '#00C851',
                              fontWeight: 600,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {property.bookings} bookings
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <StarIcon sx={{ fontSize: 14, color: '#FFD600' }} />
                            <Typography variant="caption">{property.rating}</Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Activity
          </Typography>
          <List sx={{ p: 0 }}>
            {[
              {
                action: 'New booking received',
                property: 'Luxury Downtown Apartment',
                time: '2 hours ago',
                amount: '$450',
                type: 'booking',
              },
              {
                action: 'Property viewed',
                property: 'Cozy Beach House',
                time: '4 hours ago',
                views: '15 times',
                type: 'view',
              },
              {
                action: 'Review received',
                property: 'Modern City Loft',
                time: '1 day ago',
                rating: '5 stars',
                type: 'review',
              },
              {
                action: 'Booking completed',
                property: 'Family Villa',
                time: '2 days ago',
                amount: '$320',
                type: 'completion',
              },
            ].map((activity, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 0,
                  py: 2,
                  borderBottom: index < 3 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: activity.type === 'booking' ? alpha('#FF385C', 0.1) :
                               activity.type === 'view' ? alpha('#00A699', 0.1) :
                               activity.type === 'review' ? alpha('#FFD600', 0.1) :
                               alpha('#484848', 0.1),
                      color: activity.type === 'booking' ? '#FF385C' :
                             activity.type === 'view' ? '#00A699' :
                             activity.type === 'review' ? '#FFD600' :
                             '#484848',
                    }}
                  >
                    {activity.type === 'booking' ? <BookingIcon /> :
                     activity.type === 'view' ? <ViewIcon /> :
                     activity.type === 'review' ? <StarIcon /> :
                     <AssessmentIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      {activity.action}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {activity.property}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                        {activity.amount && (
                          <Chip
                            label={activity.amount}
                            size="small"
                            sx={{
                              bgcolor: alpha('#00C851', 0.1),
                              color: '#00C851',
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {activity.views && (
                          <Typography variant="caption" color="primary.main">
                            {activity.views}
                          </Typography>
                        )}
                        {activity.rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <StarIcon sx={{ fontSize: 14, color: '#FFD600' }} />
                            <Typography variant="caption">{activity.rating}</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </DashboardLayout>
  );
} 