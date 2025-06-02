'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Tooltip,
  Badge,
  Pagination,
  TablePagination,
  Divider,
  Container,
  useTheme,
  alpha,
  Skeleton,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  LockReset as ResetPasswordIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';

const roleConfig = {
  SUPER_ADMIN: { 
    color: 'error', 
    icon: <AdminIcon />, 
    label: 'Super Admin',
    description: 'Full platform access'
  },
  ADMIN: { 
    color: 'warning', 
    icon: <AdminIcon />, 
    label: 'Admin',
    description: 'Administrative access'
  },
  PROPERTY_MANAGER: { 
    color: 'info', 
    icon: <BusinessIcon />, 
    label: 'Property Manager',
    description: 'Manages properties'
  },
  CUSTOMER: { 
    color: 'success', 
    icon: <PersonIcon />, 
    label: 'Customer',
    description: 'Platform user'
  },
};

const verificationConfig = {
  VERIFIED: { 
    color: 'success', 
    icon: <CheckCircleIcon />, 
    label: 'Verified',
    description: 'Account verified'
  },
  PENDING: { 
    color: 'warning', 
    icon: <WarningIcon />, 
    label: 'Pending',
    description: 'Awaiting verification'
  },
  REJECTED: { 
    color: 'error', 
    icon: <CancelIcon />, 
    label: 'Rejected',
    description: 'Verification rejected'
  },
  BLOCKED: { 
    color: 'error', 
    icon: <BlockIcon />, 
    label: 'Blocked',
    description: 'Account blocked'
  },
};

// Statistics Card Component
const StatCard = ({ title, value, icon, color, trend, description }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        background: theme.palette.background.paper,
        border: '1px solid',
        borderColor: alpha('#FF385C', 0.1),
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
          background: '#FF385C',
          opacity: 0.8,
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha('#FF385C', 0.15)}`,
          borderColor: alpha('#FF385C', 0.3),
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
              {description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.7rem',
                    opacity: 0.8,
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
            <Avatar 
              sx={{ 
                width: 48,
                height: 48,
                background: alpha('#FF385C', 0.1),
                color: '#FF385C',
                border: `2px solid ${alpha('#FF385C', 0.1)}`,
              }}
            >
              {icon}
            </Avatar>
          </Box>
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                icon={<TrendingUpIcon fontSize="small" />}
                label={trend}
                color="success"
                sx={{ 
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                vs last month
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Enhanced User Table Component
const UserTable = ({ users, onActionClick, onUserClick, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box>
                      <Skeleton variant="text" width={120} height={20} />
                      <Skeleton variant="text" width={180} height={16} />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell align="right"><Skeleton variant="circular" width={32} height={32} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 600, color: 'text.primary' } }}>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Activity</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const roleInfo = roleConfig[user.role] || roleConfig.CUSTOMER;
            const statusInfo = verificationConfig[user.verificationStatus] || verificationConfig.PENDING;
            
            return (
              <TableRow 
                key={user.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: alpha('#FF385C', 0.02),
                    transform: 'scale(1.001)',
                  },
                }}
                onClick={() => onUserClick(user)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        background: `linear-gradient(135deg, ${alpha('#FF385C', 0.8)}, ${alpha('#E61E4D', 0.8)})`,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={roleInfo.icon}
                    label={roleInfo.label}
                    size="small"
                    color={roleInfo.color}
                    variant="outlined"
                    sx={{ 
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={statusInfo.icon}
                    label={statusInfo.label}
                    size="small"
                    color={statusInfo.color}
                    sx={{ 
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {user._count?.properties > 0 && `${user._count.properties} properties`}
                      {user._count?.bookings > 0 && `${user._count.bookings} bookings`}
                      {(!user._count?.properties && !user._count?.bookings) && 'No activity'}
                    </Typography>
                    {user._count?.reviews > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {user._count.reviews} reviews
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="More actions">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onActionClick(e, user);
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha('#FF385C', 0.1),
                          color: '#FF385C',
                        },
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No users found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search criteria or filters
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// User Detail Dialog Component
const UserDetailDialog = ({ open, user, onClose, onEdit, onDelete, onBlock, onResetPassword }) => {
  const theme = useTheme();
  
  if (!user) return null;

  const roleInfo = roleConfig[user.role] || roleConfig.CUSTOMER;
  const statusInfo = verificationConfig[user.verificationStatus] || verificationConfig.PENDING;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme.palette.background.paper,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
        borderBottom: `1px solid ${alpha('#FF385C', 0.1)}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56,
                background: `linear-gradient(135deg, #FF385C, #E61E4D)`,
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: `1px solid ${alpha('#FF385C', 0.1)}`,
                background: alpha('#FF385C', 0.01),
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      icon={roleInfo.icon}
                      label={roleInfo.label}
                      color={roleInfo.color}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Verification Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      icon={statusInfo.icon}
                      label={statusInfo.label}
                      color={statusInfo.color}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Member Since</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {new Date(user.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Activity Statistics */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: `1px solid ${alpha('#FF385C', 0.1)}`,
                background: alpha('#FF385C', 0.01),
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Activity Overview
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Properties</Typography>
                  <Chip 
                    label={user._count?.properties || 0} 
                    size="small" 
                    color="info"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Bookings</Typography>
                  <Chip 
                    label={user._count?.bookings || 0} 
                    size="small" 
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Reviews</Typography>
                  <Chip 
                    label={user._count?.reviews || 0} 
                    size="small" 
                    color="warning"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Profile Information */}
          {user.profileInfo && (
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${alpha('#FF385C', 0.1)}`,
                  background: alpha('#FF385C', 0.01),
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="primary" />
                  Profile Details
                </Typography>
                <Grid container spacing={2}>
                  {user.profileInfo.phone && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{user.profileInfo.phone}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {user.profileInfo.location && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">{user.profileInfo.location}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {user.profileInfo.bio && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        {user.profileInfo.bio}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          startIcon={<EditIcon />}
          onClick={() => onEdit(user)}
          sx={{ borderRadius: 2 }}
        >
          Edit User
        </Button>
        <Button
          startIcon={<ResetPasswordIcon />}
          onClick={() => onResetPassword(user)}
          color="warning"
          sx={{ borderRadius: 2 }}
        >
          Reset Password
        </Button>
        <Button
          startIcon={<BlockIcon />}
          onClick={() => onBlock(user)}
          color="error"
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Block User
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(user)}
          color="error"
          sx={{ borderRadius: 2 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
export default function UsersManagement() {
  const theme = useTheme();
  const currentUser = useSelector(selectCurrentUser);
  const router = useRouter();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    superAdmins: 0,
    propertyManagers: 0,
    customers: 0,
    verified: 0,
    pending: 0,
    newThisMonth: 0,
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    verificationStatus: 'PENDING'
  });
  const [formError, setFormError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [searchQuery, roleFilter, statusFilter, page, rowsPerPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        search: searchQuery,
      });

      if (roleFilter !== 'ALL') {
        params.append('role', roleFilter);
      }
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotalUsers(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleActionClick = (event, user) => {
    setSelectedUser(user);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      password: ''
    });
    setEditDialogOpen(true);
    handleActionClose();
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    handleActionClose();
  };

  const handleResetPasswordClick = (user) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
    handleActionClose();
  };

  const handleBlockUser = async (user) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          verificationStatus: user.verificationStatus === 'BLOCKED' ? 'VERIFIED' : 'BLOCKED'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      showSnackbar(
        `User ${user.verificationStatus === 'BLOCKED' ? 'unblocked' : 'blocked'} successfully`,
        'success'
      );
      fetchUsers();
      handleActionClose();
    } catch (error) {
      console.error('Error updating user status:', error);
      showSnackbar('Failed to update user status', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.verificationStatus === statusFilter;
    return matchesRole && matchesStatus;
  });

  const tabData = [
    { label: 'All Users', count: stats.total, filter: 'ALL' },
    { label: 'Super Admins', count: stats.superAdmins, filter: 'SUPER_ADMIN' },
    { label: 'Property Managers', count: stats.propertyManagers, filter: 'PROPERTY_MANAGER' },
    { label: 'Customers', count: stats.customers, filter: 'CUSTOMER' },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#FF385C' }}>
            User Management 👥
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage platform users, roles, and permissions
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Users"
              value={stats.total.toLocaleString()}
              icon={<PeopleIcon />}
              description="All platform users"
              trend="+12.5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Property Managers"
              value={stats.propertyManagers.toLocaleString()}
              icon={<BusinessIcon />}
              description="Active managers"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Verified Users"
              value={stats.verified.toLocaleString()}
              icon={<VerifiedIcon />}
              description="Verified accounts"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="New This Month"
              value={stats.newThisMonth.toLocaleString()}
              icon={<PersonAddIcon />}
              description="Recent signups"
              trend="+8.2%"
            />
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha('#FF385C', 0.1)}`,
            background: alpha('#FF385C', 0.01),
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role Filter</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  label="Role Filter"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="ALL">All Roles</MenuItem>
                  <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="PROPERTY_MANAGER">Property Manager</MenuItem>
                  <MenuItem value="CUSTOMER">Customer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status Filter"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="VERIFIED">Verified</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="BLOCKED">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh">
                  <IconButton 
                    onClick={fetchUsers}
                    sx={{
                      backgroundColor: alpha('#FF385C', 0.1),
                      color: '#FF385C',
                      '&:hover': {
                        backgroundColor: alpha('#FF385C', 0.2),
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton 
                    sx={{
                      backgroundColor: alpha('#FF385C', 0.1),
                      color: '#FF385C',
                      '&:hover': {
                        backgroundColor: alpha('#FF385C', 0.2),
                      },
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchUsers}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Users Table */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3,
            border: `1px solid ${alpha('#FF385C', 0.1)}`,
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <Box sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
            borderBottom: `1px solid ${alpha('#FF385C', 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Users ({totalUsers.toLocaleString()})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/admin/users/new')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: '#FF385C',
                  '&:hover': {
                    background: '#E61E4D',
                  },
                }}
              >
                Add User
              </Button>
            </Box>
          </Box>

          {/* Table Content */}
          <UserTable
            users={filteredUsers}
            onActionClick={handleActionClick}
            onUserClick={handleUserClick}
            loading={loading}
          />

          {/* Pagination */}
          {!loading && totalUsers > 0 && (
            <Box sx={{ 
              p: 2, 
              borderTop: `1px solid ${alpha('#FF385C', 0.1)}`,
              background: alpha('#FF385C', 0.01),
            }}>
              <TablePagination
                component="div"
                count={totalUsers}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                }}
              />
            </Box>
          )}
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 200,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            }
          }}
        >
          <MenuItem onClick={() => handleUserClick(selectedUser)}>
            <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleEditClick(selectedUser)}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit User</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleResetPasswordClick(selectedUser)}>
            <ListItemIcon><ResetPasswordIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Reset Password</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => handleBlockUser(selectedUser)}
            sx={{ color: selectedUser?.verificationStatus === 'BLOCKED' ? 'success.main' : 'warning.main' }}
          >
            <ListItemIcon>
              <BlockIcon fontSize="small" color={selectedUser?.verificationStatus === 'BLOCKED' ? 'success' : 'warning'} />
            </ListItemIcon>
            <ListItemText>
              {selectedUser?.verificationStatus === 'BLOCKED' ? 'Unblock User' : 'Block User'}
            </ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => handleDeleteClick(selectedUser)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete User</ListItemText>
          </MenuItem>
        </Menu>

        {/* User Detail Dialog */}
        <UserDetailDialog
          open={userDetailOpen}
          user={selectedUser}
          onClose={() => setUserDetailOpen(false)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onBlock={handleBlockUser}
          onResetPassword={handleResetPasswordClick}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
} 