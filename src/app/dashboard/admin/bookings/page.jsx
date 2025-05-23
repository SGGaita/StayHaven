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
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const bookingStatusColors = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'error',
  COMPLETED: 'info',
  REFUNDED: 'default',
};

const bookingStatuses = [
  'All Statuses',
  'CONFIRMED',
  'PENDING',
  'CANCELLED',
  'COMPLETED',
  'REFUNDED',
];

export default function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [page, rowsPerPage, searchQuery, filterStatus]);

  const fetchBookings = async () => {
    try {
      setError(null);
      const response = await fetch(
        `/api/admin/bookings?page=${page + 1}&limit=${rowsPerPage}&search=${searchQuery}&status=${filterStatus}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings);
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
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleActionClick = (event, booking) => {
    setSelectedBooking(booking);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
  };

  const handleViewClick = () => {
    setActionMenuAnchor(null);
    setViewDialogOpen(true);
  };

  const handleCancelClick = () => {
    setActionMenuAnchor(null);
    setCancelDialogOpen(true);
  };

  const handleApproveBooking = async () => {
    try {
      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to approve booking');
      }

      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
    setActionMenuAnchor(null);
  };

  const handleRejectBooking = async () => {
    try {
      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}/reject`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to reject booking');
      }

      fetchBookings();
    } catch (err) {
      setError(err.message);
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
          Booking Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor property bookings
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
              placeholder="Search bookings..."
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
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={handleFilterChange}
                label="Status"
              >
                {bookingStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
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
                <TableCell>Booking ID</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>#{booking.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={booking.guest.avatar} alt={booking.guest.name} />
                      <Box>
                        <Typography variant="subtitle2">
                          {booking.guest.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.guest.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{booking.property.title}</TableCell>
                  <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                  <TableCell>${booking.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      size="small"
                      color={bookingStatusColors[booking.status]}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionClick(e, booking)}
                    >
                      <MoreVertIcon />
                    </IconButton>
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
        {selectedBooking?.status === 'PENDING' && (
          <>
            <MenuItem onClick={handleApproveBooking}>
              <ApproveIcon fontSize="small" sx={{ mr: 1 }} />
              Approve
            </MenuItem>
            <MenuItem onClick={handleRejectBooking}>
              <RejectIcon fontSize="small" sx={{ mr: 1 }} />
              Reject
            </MenuItem>
          </>
        )}
        {['CONFIRMED', 'PENDING'].includes(selectedBooking?.status) && (
          <MenuItem onClick={handleCancelClick} sx={{ color: 'error.main' }}>
            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
            Cancel Booking
          </MenuItem>
        )}
      </Menu>

      {/* View Booking Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              {/* Add booking details here */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
          <Button variant="contained" color="error">
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 