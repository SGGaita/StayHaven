'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function EmailTemplatesManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/cms/email-templates');
      if (!response.ok) throw new Error('Failed to fetch email templates');
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateEdit = (template) => {
    setCurrentTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleTemplateSave = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/cms/email-templates', {
        method: currentTemplate.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTemplate),
      });

      if (!response.ok) {
        throw new Error('Failed to save email template');
      }

      const savedTemplate = await response.json();
      
      if (currentTemplate.id) {
        setTemplates(templates.map(t => t.id === savedTemplate.id ? savedTemplate : t));
      } else {
        setTemplates([...templates, savedTemplate]);
      }

      setTemplateDialogOpen(false);
      setSuccess('Email template saved successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/cms/email-templates?id=${templateToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete email template');
      }

      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      setSuccess('Email template deleted successfully');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (err) {
      setError(err.message);
    }
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
          Email Templates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system email templates and notifications
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

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Templates
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setCurrentTemplate({
                name: '',
                subject: '',
                content: '',
                variables: [],
              });
              setTemplateDialogOpen(true);
            }}
          >
            Add Template
          </Button>
        </Box>

        <List>
          {templates.map((template) => (
            <ListItem
              key={template.id}
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <ListItemText
                primary={template.name}
                secondary={template.subject}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="preview"
                  onClick={() => {/* TODO: Implement preview */}}
                  sx={{ mr: 1 }}
                >
                  <PreviewIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleTemplateEdit(template)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteClick(template)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Add/Edit Template Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentTemplate?.id ? 'Edit Email Template' : 'New Email Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={currentTemplate?.name || ''}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Subject"
                value={currentTemplate?.subject || ''}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, subject: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Email Content
              </Typography>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={currentTemplate?.content || ''}
                init={{
                  height: 400,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                    'template', 'emoticons', 'hr', 'paste'
                  ],
                  toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | template | help',
                  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; }',
                  templates: [
                    { title: 'User Variables', description: 'Common user variables', content: '{{firstName}} {{lastName}} {{email}}' },
                    { title: 'Booking Variables', description: 'Common booking variables', content: '{{bookingId}} {{propertyName}} {{checkIn}} {{checkOut}}' },
                  ],
                }}
                onEditorChange={(content) => setCurrentTemplate(prev => ({ ...prev, content }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Available Variables
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {currentTemplate?.variables?.map((variable) => (
                  <Chip
                    key={variable}
                    label={`{{${variable}}}`}
                    onClick={() => {
                      // Insert variable at cursor position in editor
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTemplateSave} variant="contained">
            Save Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Email Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{templateToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 