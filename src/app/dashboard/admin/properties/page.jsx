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
  TablePagination,
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
  Avatar,
  Rating,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const propertyStatusColors = {
  ACTIVE: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
  MAINTENANCE: 'info',
  ARCHIVED: 'default',
};

const propertyTypes = [
  'All Types',
  'Apartment',
  'House',
  'Villa',
  'Condo',
  'Cabin',
  'Beach House',
  'Mountain Retreat',
];

export default function PropertiesManagement() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [filterType, setFilterType] = useState('All Types');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchProperties();
  }, [page, rowsPerPage, searchQuery, filterType]);

  const fetchProperties = async () => {
    try {
      setError(null);
      const response = await fetch(
        `/api/admin/properties?page=${page + 1}&limit=${rowsPerPage}&search=${searchQuery}&type=${filterType}`,
        { 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleActionClick = (event, property) => {
    setSelectedProperty(property);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
  };

  const handleViewClick = () => {
    setActionMenuAnchor(null);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setActionMenuAnchor(null);
    setDeleteDialogOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleApproveProperty = async (property) => {
    try {
      const response = await fetch(`/api/admin/properties/${property.id}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve property');
      }

      await fetchProperties();
      setSnackbar({
        open: true,
        message: 'Property approved successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to approve property',
        severity: 'error'
      });
    }
    setActionMenuAnchor(null);
  };

  const handleRejectProperty = async (property) => {
    try {
      const response = await fetch(`/api/admin/properties/${property.id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject property');
      }

      await fetchProperties();
      setSnackbar({
        open: true,
        message: 'Property rejected successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to reject property',
        severity: 'error'
      });
    }
    setActionMenuAnchor(null);
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
          Property Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor property listings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search properties..."
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={filterType}
                onChange={handleFilterChange}
                label="Property Type"
              >
                {propertyTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cover Image</TableCell>
                <TableCell>Property Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={property.photos?.[0]}
                      alt={property.name}
                      sx={{ width: 80, height: 80, borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      component="a"
                      href={`/dashboard/admin/properties/${property.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {property.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{property.propertyType}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      component="a"
                      href={`/dashboard/admin/users/${property.manager.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {`${property.manager.firstName} ${property.manager.lastName}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.status}
                      size="small"
                      color={propertyStatusColors[property.status]}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedProperty(property);
                          setViewDialogOpen(true);
                        }}
                        title="View Details"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      {property.status === 'PENDING' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleApproveProperty(property)}
                            title="Approve"
                            color="success"
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRejectProperty(property)}
                            title="Reject"
                            color="error"
                          >
                            <RejectIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        disabled
                        title="Delete (Disabled)"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={100} // Replace with actual total count
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleViewClick}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedProperty?.status === 'PENDING' && (
          <>
            <MenuItem onClick={handleApproveProperty}>
              <ApproveIcon fontSize="small" sx={{ mr: 1 }} />
              Approve
            </MenuItem>
            <MenuItem onClick={handleRejectProperty}>
              <RejectIcon fontSize="small" sx={{ mr: 1 }} />
              Reject
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* View Property Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Property Details</DialogTitle>
        <DialogContent>
          {selectedProperty && (
            <Box>
              {/* Add property details here */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this property? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
    </DashboardLayout>
  );
} 