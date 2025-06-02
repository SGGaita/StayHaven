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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as ApproveIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function PropertyManagersPage() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [propertyManagers, setPropertyManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPropertyManagers();
  }, []);

  useEffect(() => {
    filterManagers();
  }, [propertyManagers, searchTerm, statusFilter]);

  const fetchPropertyManagers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/property-managers');
      if (!response.ok) {
        throw new Error('Failed to fetch property managers');
      }
      const data = await response.json();
      setPropertyManagers(data);
    } catch (error) {
      console.error('Error fetching property managers:', error);
      setError('Failed to load property managers');
    } finally {
      setLoading(false);
    }
  };

  const filterManagers = () => {
    let filtered = propertyManagers;

    if (searchTerm) {
      filtered = filtered.filter(manager =>
        `${manager.firstName} ${manager.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(manager => manager.status === statusFilter);
    }

    setFilteredManagers(filtered);
  };

  const handleViewDetails = (manager) => {
    router.push(`/dashboard/admin/property-managers/${manager.id}`);
  };

  const handleStatusChange = async (managerId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/property-managers/${managerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchPropertyManagers();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING_APPROVAL': return 'warning';
      case 'SUSPENDED': return 'error';
      case 'PENDING_VERIFICATION': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Property Managers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage property managers, their properties, and verification status
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search property managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                  <MenuItem value="PENDING_VERIFICATION">Pending Verification</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={fetchPropertyManagers}
                startIcon={<FilterIcon />}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Property Managers Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Manager</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Properties</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredManagers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((manager) => (
                    <TableRow key={manager.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar>
                            {manager.firstName?.[0]}{manager.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {manager.firstName} {manager.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {manager.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {manager.businessName || 'Individual'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {manager.businessType || 'Personal'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ApartmentIcon fontSize="small" />
                          <Typography variant="body2">
                            {manager.properties?.total || 0}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {manager.properties?.active || 0} active
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={manager.status || 'PENDING'}
                          color={getStatusColor(manager.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(manager.monthlyRevenue || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          This month
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(manager.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(manager)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {manager.status === 'PENDING_APPROVAL' && (
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleStatusChange(manager.id, 'ACTIVE')}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Suspend">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleStatusChange(manager.id, 'SUSPENDED')}
                            >
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredManagers.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* Property Manager Details Dialog */}
        {/* Remove the entire Dialog component since we're navigating to a separate page */}
      </Container>
    </DashboardLayout>
  );
} 