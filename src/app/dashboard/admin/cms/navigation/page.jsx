'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function NavigationManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [navigation, setNavigation] = useState({
    name: 'Main Navigation',
    items: [],
    logo: null,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/admin/cms/navigation');
      if (!response.ok) throw new Error('Failed to fetch navigation');
      const data = await response.json();
      setNavigation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);
      const response = await fetch('/api/admin/cms/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(navigation),
      });

      if (!response.ok) throw new Error('Failed to save navigation');
      setSuccess('Navigation saved successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(navigation.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNavigation({ ...navigation, items });
  };

  const handleAddItem = () => {
    setCurrentItem({ label: '', url: '', isActive: true });
    setDialogOpen(true);
  };

  const handleEditItem = (item, index) => {
    setCurrentItem({ ...item, index });
    setDialogOpen(true);
  };

  const handleDeleteItem = (index) => {
    const items = navigation.items.filter((_, i) => i !== index);
    setNavigation({ ...navigation, items });
  };

  const handleSaveItem = () => {
    if (currentItem.index !== undefined) {
      // Edit existing item
      const items = [...navigation.items];
      items[currentItem.index] = {
        label: currentItem.label,
        url: currentItem.url,
        isActive: currentItem.isActive,
      };
      setNavigation({ ...navigation, items });
    } else {
      // Add new item
      setNavigation({
        ...navigation,
        items: [...navigation.items, {
          label: currentItem.label,
          url: currentItem.url,
          isActive: currentItem.isActive,
        }],
      });
    }
    setDialogOpen(false);
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
          Navigation Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage website navigation and menu structure
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
              <Typography variant="h6" fontWeight="bold">
                Menu Items
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="menu-items">
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {navigation.items.map((item, index) => (
                      <Draggable
                        key={index}
                        draggableId={`item-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1,
                            }}
                          >
                            <IconButton {...provided.dragHandleProps} size="small">
                              <DragIndicatorIcon />
                            </IconButton>
                            <ListItemText
                              primary={item.label}
                              secondary={item.url}
                              sx={{ ml: 1 }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleEditItem(item, index)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                onClick={() => handleDeleteItem(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Navigation Settings
            </Typography>
            <TextField
              fullWidth
              label="Navigation Name"
              value={navigation.name}
              onChange={(e) => setNavigation({ ...navigation, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            {/* Add more navigation settings as needed */}
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Item Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentItem?.index !== undefined ? 'Edit Menu Item' : 'Add Menu Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Label"
              value={currentItem?.label || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, label: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="URL"
              value={currentItem?.url || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, url: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 