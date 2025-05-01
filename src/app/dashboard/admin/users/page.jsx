'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const roleColors = {
  SUPER_ADMIN: 'error',
  ADMIN: 'warning',
  PROPERTY_MANAGER: 'info',
  CUSTOMER: 'success',
};

const verificationStatusColors = {
  VERIFIED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
  BLOCKED: 'error',
};

// Custom TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserTable = ({ users, onActionClick, role }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Verification Status</TableCell>
          <TableCell>Created At</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Chip
                label={user.verificationStatus}
                size="small"
                color={verificationStatusColors[user.verificationStatus]}
              />
            </TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell align="right">
              <IconButton
                size="small"
                onClick={(e) => onActionClick(e, user)}
              >
                <MoreVertIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} align="center">
              <Typography variant="body2" color="text.secondary">
                No {role.toLowerCase()} accounts found
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

// Custom Snackbar Alert component
const SnackbarAlert = ({ open, message, severity, onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={6000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Alert
      onClose={onClose}
      severity={severity}
      variant="filled"
      sx={{ width: '100%', alignItems: 'center' }}
      iconMapping={{
        success: <CheckCircleIcon />,
        error: <ErrorIcon />,
      }}
    >
      {message}
    </Alert>
  </Snackbar>
);

export default function UsersManagement() {
  const [users, setUsers] = useState({
    SUPER_ADMIN: [],
    PROPERTY_MANAGER: [],
    CUSTOMER: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
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
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await fetch(
        `/api/admin/users?search=${searchQuery}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      // Group users by role
      const groupedUsers = {
        SUPER_ADMIN: data.users.filter(user => user.role === 'SUPER_ADMIN'),
        PROPERTY_MANAGER: data.users.filter(user => user.role === 'PROPERTY_MANAGER'),
        CUSTOMER: data.users.filter(user => user.role === 'CUSTOMER')
      };
      
      setUsers(groupedUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleActionClick = (event, user) => {
    setSelectedUser(user);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
  };

  const handleEditClick = () => {
    setActionMenuAnchor(null);
    setFormData({
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      email: selectedUser.email,
      verificationStatus: selectedUser.verificationStatus
    });
    setEditDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      verificationStatus: 'PENDING'
    });
    setEditDialogOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSubmit = async () => {
    try {
      setFormError('');
      
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email || 
          (!selectedUser && !formData.password)) {
        setFormError('Please fill in all required fields');
        return;
      }

      const url = selectedUser 
        ? `/api/admin/users/${selectedUser.id}`
        : '/api/admin/users';

      const method = selectedUser ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          role: selectedUser ? selectedUser.role : 'SUPER_ADMIN',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save user');
      }

      await fetchUsers();
      setEditDialogOpen(false);
      showSnackbar(
        selectedUser 
          ? 'User updated successfully' 
          : 'Super Admin created successfully'
      );
    } catch (err) {
      setFormError(err.message);
      showSnackbar(err.message, 'error');
    }
  };

  const handleDeleteClick = () => {
    setActionMenuAnchor(null);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers();
      setDeleteDialogOpen(false);
      showSnackbar('User deleted successfully');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleResetPasswordClick = () => {
    setActionMenuAnchor(null);
    setResetPasswordDialogOpen(true);
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      setResetPasswordDialogOpen(false);
      showSnackbar('Password reset email sent successfully');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleBlockUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/block`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to block user');
      }

      await fetchUsers();
      showSnackbar('User blocked successfully');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
    setActionMenuAnchor(null);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
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
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor user accounts
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Search users..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AdminIcon />}
          onClick={handleAddNewClick}
        >
          Add Super Admin
        </Button>
      </Box>

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
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
            },
          }}
        >
          <Tab 
            icon={<AdminIcon />} 
            iconPosition="start" 
            label="Super Admins" 
            sx={{ color: 'error.main' }}
          />
          <Tab 
            icon={<BusinessIcon />} 
            iconPosition="start" 
            label="Property Managers" 
            sx={{ color: 'info.main' }}
          />
          <Tab 
            icon={<PersonIcon />} 
            iconPosition="start" 
            label="Customers" 
            sx={{ color: 'success.main' }}
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={currentTab} index={0}>
            <UserTable 
              users={users.SUPER_ADMIN} 
              onActionClick={handleActionClick}
              role="Super Admin"
            />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <UserTable 
              users={users.PROPERTY_MANAGER} 
              onActionClick={handleActionClick}
              role="Property Manager"
            />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <UserTable 
              users={users.CUSTOMER} 
              onActionClick={handleActionClick}
              role="Customer"
            />
          </TabPanel>
        </Box>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={handleResetPasswordClick}>
          <ResetPasswordIcon fontSize="small" sx={{ mr: 1 }} />
          Reset Password
        </MenuItem>
        <MenuItem onClick={handleBlockUser}>
          <BlockIcon fontSize="small" sx={{ mr: 1 }} />
          Block User
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Edit/Add User Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New Super Admin'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
            />
            {!selectedUser && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required
              />
            )}
            {selectedUser && (
              <FormControl fullWidth>
                <InputLabel>Verification Status</InputLabel>
                <Select
                  name="verificationStatus"
                  value={formData.verificationStatus}
                  label="Verification Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="VERIFIED">Verified</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="BLOCKED">Blocked</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedUser ? 'Save Changes' : 'Create Super Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to reset the password for this user? They will receive an email with instructions to set a new password.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleResetPassword}>
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert */}
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </DashboardLayout>
  );
} 