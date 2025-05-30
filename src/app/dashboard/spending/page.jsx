'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  LinearProgress,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Hotel as HotelIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
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
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';

// Custom chart components
const CustomTooltip = ({ active, payload, label, prefix = '$' }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, minWidth: 120, boxShadow: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: {prefix}{entry.value?.toLocaleString()}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const CHART_COLORS = ['#FF385C', '#FF6B8A', '#FF9BB3', '#FFB8C7', '#FFD6E1'];

const MonthlySpendingChart = ({ data, theme }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <defs>
        <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#FF385C" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#FF385C" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
      <XAxis 
        dataKey="month" 
        stroke={theme.palette.text.secondary}
        fontSize={12}
      />
      <YAxis 
        stroke={theme.palette.text.secondary}
        fontSize={12}
        tickFormatter={(value) => `$${value.toLocaleString()}`}
      />
      <RechartsTooltip content={<CustomTooltip />} />
      <Area
        type="monotone"
        dataKey="amount"
        stroke="#FF385C"
        fillOpacity={1}
        fill="url(#colorSpending)"
        strokeWidth={3}
        dot={{ fill: '#FF385C', strokeWidth: 2, r: 4 }}
        activeDot={{ r: 6, fill: '#FF385C' }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

const CategoryBreakdownChart = ({ data, theme }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percentage }) => `${name} ${percentage}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="amount"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </Pie>
      <RechartsTooltip content={<CustomTooltip />} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

const SpendingTrendChart = ({ data, theme }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
      <XAxis 
        dataKey="month" 
        stroke={theme.palette.text.secondary}
        fontSize={12}
      />
      <YAxis 
        stroke={theme.palette.text.secondary}
        fontSize={12}
        tickFormatter={(value) => `$${value.toLocaleString()}`}
      />
      <RechartsTooltip content={<CustomTooltip />} />
      <Bar 
        dataKey="amount" 
        fill="#FF385C"
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
);

const StatCard = ({ title, value, icon, trend, trendValue, color = '#FF385C' }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        background: theme.palette.background.paper,
        border: `1px solid ${alpha(color, 0.1)}`,
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: color,
          opacity: 0.8,
        },
      }}
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
            </Box>
            <Avatar 
              sx={{ 
                width: 48,
                height: 48,
                background: alpha(color, 0.1),
                color: color,
                border: `2px solid ${alpha(color, 0.1)}`,
              }}
            >
              {icon}
            </Avatar>
          </Box>
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {trend === 'up' ? (
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
              ) : (
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: '1rem' }} />
              )}
              <Typography 
                variant="caption" 
                sx={{ 
                  color: trend === 'up' ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
              >
                {trendValue} from last month
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const BookingStatus = {
  PENDING: { color: 'warning', label: 'Pending', bgColor: '#FFF3CD' },
  CONFIRMED: { color: 'success', label: 'Confirmed', bgColor: '#D1E7DD' },
  CANCELLED: { color: 'error', label: 'Cancelled', bgColor: '#F8D7DA' },
  COMPLETED: { color: 'info', label: 'Completed', bgColor: '#D1ECF1' },
};

export default function SpendingPage() {
  const theme = useTheme();
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spendingData, setSpendingData] = useState({
    totalSpent: 0,
    thisMonth: 0,
    avgPerBooking: 0,
    totalBookings: 0,
    monthlySpending: [],
    categoryBreakdown: [],
    recentTransactions: [],
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    fetchSpendingData();
  }, [filterStatus, filterPeriod]);

  const fetchSpendingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (filterPeriod !== 'all') {
        params.append('period', filterPeriod);
      }

      const response = await fetch(`/api/dashboard/spending?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch spending data');
      }

      const data = await response.json();
      setSpendingData(data);
    } catch (error) {
      console.error('Error fetching spending data:', error);
      setError(error.message || 'Failed to load spending data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (transactionId) => {
    // Download receipt from API
    window.open(`/api/dashboard/spending/${transactionId}/receipt`, '_blank');
  };

  const handleExportData = () => {
    // Implement data export
    const csvContent = [
      ['Property', 'Amount', 'Date', 'Status', 'Booking Ref', 'Nights', 'Location'],
      ...spendingData.recentTransactions.map(transaction => [
        transaction.propertyName,
        transaction.amount,
        new Date(transaction.date).toLocaleDateString(),
        transaction.status,
        transaction.bookingRef,
        transaction.nights,
        transaction.location,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spending-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchSpendingData}>
            Retry
          </Button>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#FF385C' }}>
            💰 Spending Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your travel expenses and booking history
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Spent"
              value={`$${spendingData.totalSpent.toLocaleString()}`}
              icon={<MoneyIcon />}
              trend="up"
              trendValue="+12.5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="This Month"
              value={`$${spendingData.thisMonth.toLocaleString()}`}
              icon={<CalendarIcon />}
              trend="up"
              trendValue="+8.2%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg per Booking"
              value={`$${spendingData.avgPerBooking.toLocaleString()}`}
              icon={<HotelIcon />}
              trend="down"
              trendValue="-3.1%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bookings"
              value={spendingData.totalBookings}
              icon={<AssessmentIcon />}
              trend="up"
              trendValue="+15.7%"
            />
          </Grid>
        </Grid>

        {/* Filters and Export */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: `1px solid ${alpha('#FF385C', 0.1)}`, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Filter by:
              </Typography>
              
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Transactions</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  label="Period"
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="thisYear">This Year</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
              sx={{
                borderColor: '#FF385C',
                color: '#FF385C',
                '&:hover': {
                  borderColor: '#E61E4D',
                  backgroundColor: alpha('#FF385C', 0.05),
                },
              }}
            >
              Export Data
            </Button>
          </Stack>
        </Paper>

        {/* Charts Section */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Monthly Spending Trend */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${alpha('#FF385C', 0.1)}`, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon sx={{ color: '#FF385C' }} />
                Monthly Spending Trend
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Track your spending patterns over the last 6 months
              </Typography>
              
              {spendingData.monthlySpending && spendingData.monthlySpending.length > 0 ? (
                <MonthlySpendingChart data={spendingData.monthlySpending} theme={theme} />
              ) : (
                <Box sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: alpha('#FF385C', 0.02),
                  borderRadius: 2,
                  border: `2px dashed ${alpha('#FF385C', 0.2)}`,
                }}>
                  <Typography color="text.secondary">
                    No spending data available for chart visualization
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Category Breakdown */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${alpha('#FF385C', 0.1)}`, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon sx={{ color: '#FF385C' }} />
                Spending Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Breakdown of your expenses by category
              </Typography>
              
              {spendingData.categoryBreakdown && spendingData.categoryBreakdown.length > 0 ? (
                <CategoryBreakdownChart data={spendingData.categoryBreakdown} theme={theme} />
              ) : (
                <Box sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: alpha('#FF385C', 0.02),
                  borderRadius: 2,
                  border: `2px dashed ${alpha('#FF385C', 0.2)}`,
                }}>
                  <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                    No category data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Spending Overview Bar Chart */}
        <Paper elevation={0} sx={{ p: 3, mt: 4, border: `1px solid ${alpha('#FF385C', 0.1)}`, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ color: '#FF385C' }} />
            Spending Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Compare your monthly spending with previous months
          </Typography>
          
          {spendingData.monthlySpending && spendingData.monthlySpending.length > 0 ? (
            <SpendingTrendChart data={spendingData.monthlySpending} theme={theme} />
          ) : (
            <Box sx={{ 
              height: 250, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: alpha('#FF385C', 0.02),
              borderRadius: 2,
              border: `2px dashed ${alpha('#FF385C', 0.2)}`,
            }}>
              <Typography color="text.secondary">
                No data available for spending overview
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Spending Breakdown Section */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${alpha('#FF385C', 0.1)}`, borderRadius: 3, height: 'fit-content' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon sx={{ color: '#FF385C' }} />
                Spending Breakdown
              </Typography>
              
              {spendingData.categoryBreakdown.length > 0 ? (
                <Stack spacing={2} sx={{ mt: 3 }}>
                  {spendingData.categoryBreakdown.map((category, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {category.category}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${category.amount.toLocaleString()}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={category.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha('#FF385C', 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {category.percentage}% of total spending
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No spending data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ border: `1px solid ${alpha('#FF385C', 0.1)}`, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${alpha('#FF385C', 0.1)}` }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon sx={{ color: '#FF385C' }} />
                  Recent Transactions
                </Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#FF385C', 0.02) }}>
                      <TableCell fontWeight="bold">Property</TableCell>
                      <TableCell fontWeight="bold">Amount</TableCell>
                      <TableCell fontWeight="bold">Date</TableCell>
                      <TableCell fontWeight="bold">Status</TableCell>
                      <TableCell fontWeight="bold">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {spendingData.recentTransactions.length > 0 ? (
                      spendingData.recentTransactions.map((transaction) => (
                        <TableRow 
                          key={transaction.id}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: alpha('#FF385C', 0.02),
                            },
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {transaction.propertyName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {transaction.location} • {transaction.nights} nights
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Ref: {transaction.bookingRef}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#FF385C' }}>
                              ${transaction.amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(transaction.date).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={BookingStatus[transaction.status]?.label || transaction.status}
                              color={BookingStatus[transaction.status]?.color || 'default'}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Download Receipt">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadReceipt(transaction.id)}
                                sx={{
                                  color: '#FF385C',
                                  '&:hover': {
                                    backgroundColor: alpha('#FF385C', 0.1),
                                  },
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="text.secondary">
                            No transactions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
} 