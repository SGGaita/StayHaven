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
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Reply as ReplyIcon,
  Archive as ArchiveIcon,
  MarkEmailRead as MarkReadIcon,
  MarkEmailUnread as MarkUnreadIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const messageStatusColors = {
  NEW: 'error',
  READ: 'default',
  ARCHIVED: 'info',
  FLAGGED: 'warning',
  RESOLVED: 'success',
};

const messageStatuses = [
  'All Messages',
  'NEW',
  'READ',
  'ARCHIVED',
  'FLAGGED',
  'RESOLVED',
];

const messageTypes = [
  'All Types',
  'SUPPORT',
  'COMPLAINT',
  'INQUIRY',
  'FEEDBACK',
  'OTHER',
];

export default function MessagesManagement() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All Messages');
  const [filterType, setFilterType] = useState('All Types');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [page, rowsPerPage, searchQuery, filterStatus, filterType]);

  const fetchMessages = async () => {
    try {
      setError(null);
      const response = await fetch(
        `/api/admin/messages?page=${page + 1}&limit=${rowsPerPage}&search=${searchQuery}&status=${filterStatus}&type=${filterType}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages);
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

  const handleStatusFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleTypeFilterChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleActionClick = (event, message) => {
    setSelectedMessage(message);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
  };

  const handleViewClick = () => {
    setActionMenuAnchor(null);
    setViewDialogOpen(true);
  };

  const handleReplyClick = () => {
    setActionMenuAnchor(null);
    setReplyDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setActionMenuAnchor(null);
    setDeleteDialogOpen(true);
  };

  const handleMarkAsRead = async () => {
    try {
      const response = await fetch(`/api/admin/messages/${selectedMessage.id}/read`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      fetchMessages();
    } catch (err) {
      setError(err.message);
    }
    setActionMenuAnchor(null);
  };

  const handleMarkAsUnread = async () => {
    try {
      const response = await fetch(`/api/admin/messages/${selectedMessage.id}/unread`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as unread');
      }

      fetchMessages();
    } catch (err) {
      setError(err.message);
    }
    setActionMenuAnchor(null);
  };

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/admin/messages/${selectedMessage.id}/archive`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to archive message');
      }

      fetchMessages();
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
          Message Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor user messages and support tickets
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
              placeholder="Search messages..."
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
                onChange={handleStatusFilterChange}
                label="Status"
              >
                {messageStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={handleTypeFilterChange}
                label="Type"
              >
                {messageTypes.map((type) => (
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
                <TableCell>From</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((message) => (
                <TableRow
                  key={message.id}
                  sx={{
                    backgroundColor: message.status === 'NEW' ? 'action.hover' : 'inherit',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        color="error"
                        variant="dot"
                        invisible={message.status !== 'NEW'}
                      >
                        <Avatar src={message.sender.avatar} alt={message.sender.name} />
                      </Badge>
                      <Box>
                        <Typography variant="subtitle2">
                          {message.sender.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {message.sender.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: message.status === 'NEW' ? 'bold' : 'regular',
                      }}
                    >
                      {message.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={message.type}
                      size="small"
                      color="default"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={message.status}
                      size="small"
                      color={messageStatusColors[message.status]}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(message.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionClick(e, message)}
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
          View Message
        </MenuItem>
        <MenuItem onClick={handleReplyClick}>
          <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
          Reply
        </MenuItem>
        {selectedMessage?.status === 'NEW' ? (
          <MenuItem onClick={handleMarkAsRead}>
            <MarkReadIcon fontSize="small" sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
        ) : (
          <MenuItem onClick={handleMarkAsUnread}>
            <MarkUnreadIcon fontSize="small" sx={{ mr: 1 }} />
            Mark as Unread
          </MenuItem>
        )}
        <MenuItem onClick={handleArchive}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* View Message Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Message Details</DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Box>
              {/* Add message details here */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<ReplyIcon />} onClick={() => {
            setViewDialogOpen(false);
            setReplyDialogOpen(true);
          }}>
            Reply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reply to Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reply"
            multiline
            rows={4}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Send Reply</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this message? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 