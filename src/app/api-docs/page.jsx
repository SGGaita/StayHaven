'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  Grid,
  useTheme,
} from '@mui/material';

// API Documentation Data
const apiDocs = {
  auth: {
    title: 'Authentication',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/signin',
        description: 'Sign in a user',
        auth: false,
        body: {
          email: 'string',
          password: 'string',
        },
        responses: {
          200: { token: 'string', user: 'object' },
          401: { error: 'Invalid credentials' },
        },
      },
      {
        method: 'POST',
        path: '/api/auth/signup',
        description: 'Register a new user',
        auth: false,
        body: {
          firstName: 'string',
          lastName: 'string',
          email: 'string',
          password: 'string',
        },
      },
      {
        method: 'POST',
        path: '/api/auth/forgot-password',
        description: 'Request password reset',
        auth: false,
        body: {
          email: 'string',
        },
      },
      {
        method: 'POST',
        path: '/api/auth/reset-password',
        description: 'Reset password with token',
        auth: false,
        body: {
          token: 'string',
          password: 'string',
        },
      },
    ],
  },
  properties: {
    title: 'Properties',
    endpoints: [
      {
        method: 'GET',
        path: '/api/properties',
        description: 'Get all properties',
        auth: true,
        query: {
          page: 'number (optional)',
          limit: 'number (optional)',
          search: 'string (optional)',
        },
      },
      {
        method: 'POST',
        path: '/api/properties',
        description: 'Create a new property',
        auth: true,
        role: 'PROPERTY_MANAGER',
        body: {
          name: 'string',
          description: 'string',
          location: 'string',
          propertyType: 'string',
          price: 'number',
          amenities: 'string[]',
          photos: 'string[]',
        },
      },
      {
        method: 'GET',
        path: '/api/properties/[id]',
        description: 'Get property by ID',
        auth: true,
      },
      {
        method: 'PUT',
        path: '/api/properties/[id]',
        description: 'Update property',
        auth: true,
        role: 'PROPERTY_MANAGER',
      },
      {
        method: 'DELETE',
        path: '/api/properties/[id]',
        description: 'Delete property',
        auth: true,
        role: 'PROPERTY_MANAGER',
      },
      {
        method: 'GET',
        path: '/api/properties/featured',
        description: 'Get featured properties',
        auth: false,
      },
    ],
  },
  dashboard: {
    title: 'Dashboard',
    endpoints: [
      {
        method: 'GET',
        path: '/api/dashboard/stats',
        description: 'Get dashboard statistics',
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/dashboard/recent-bookings',
        description: 'Get recent bookings',
        auth: true,
      },
    ],
  },
  admin: {
    title: 'Admin',
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/stats',
        description: 'Get admin dashboard statistics',
        auth: true,
        role: 'ADMIN',
      },
      {
        method: 'GET',
        path: '/api/admin/users',
        description: 'Get all users',
        auth: true,
        role: 'ADMIN',
      },
      {
        method: 'POST',
        path: '/api/admin/users',
        description: 'Create a new user',
        auth: true,
        role: 'ADMIN',
      },
      {
        method: 'PATCH',
        path: '/api/admin/users/[id]',
        description: 'Update user',
        auth: true,
        role: 'ADMIN',
      },
      {
        method: 'DELETE',
        path: '/api/admin/users/[id]',
        description: 'Delete user',
        auth: true,
        role: 'ADMIN',
      },
      {
        method: 'GET',
        path: '/api/admin/properties',
        description: 'Get all properties (admin view)',
        auth: true,
        role: 'ADMIN',
      },
      {
        method: 'POST',
        path: '/api/admin/properties/[id]/approve',
        description: 'Approve property',
        auth: true,
        role: 'ADMIN',
      },
      {
        method: 'POST',
        path: '/api/admin/properties/[id]/reject',
        description: 'Reject property',
        auth: true,
        role: 'ADMIN',
      },
    ],
  },
};

const MethodChip = ({ method }) => {
  const theme = useTheme();
  const colors = {
    GET: theme.palette.info.main,
    POST: theme.palette.success.main,
    PUT: theme.palette.warning.main,
    PATCH: theme.palette.warning.main,
    DELETE: theme.palette.error.main,
  };

  return (
    <Chip
      label={method}
      sx={{
        bgcolor: colors[method],
        color: 'white',
        fontWeight: 'bold',
        minWidth: 80,
      }}
    />
  );
};

const EndpointCard = ({ endpoint }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <MethodChip method={endpoint.method} />
        <Typography
          variant="subtitle1"
          fontFamily="monospace"
          sx={{ color: theme.palette.text.secondary }}
        >
          {endpoint.path}
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 2 }}>
        {endpoint.description}
      </Typography>

      <Grid container spacing={2}>
        {endpoint.auth && (
          <Grid item>
            <Chip
              label="Requires Authentication"
              color="primary"
              variant="outlined"
              size="small"
            />
          </Grid>
        )}
        {endpoint.role && (
          <Grid item>
            <Chip
              label={`Role: ${endpoint.role}`}
              color="secondary"
              variant="outlined"
              size="small"
            />
          </Grid>
        )}
      </Grid>

      {endpoint.body && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Request Body:
          </Typography>
          <Paper
            sx={{
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              fontFamily: 'monospace',
            }}
          >
            <pre style={{ margin: 0 }}>
              {JSON.stringify(endpoint.body, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}

      {endpoint.responses && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Responses:
          </Typography>
          {Object.entries(endpoint.responses).map(([status, response]) => (
            <Box key={status} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {status}:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                  fontFamily: 'monospace',
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </Paper>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default function ApiDocs() {
  const [currentTab, setCurrentTab] = useState('auth');
  const categories = Object.keys(apiDocs);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        API Documentation
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        This documentation provides information about the StayHaven API endpoints,
        their usage, and expected responses.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((category) => (
            <Tab
              key={category}
              label={apiDocs[category].title}
              value={category}
              sx={{ textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom>
          {apiDocs[currentTab].title}
        </Typography>
        {apiDocs[currentTab].endpoints.map((endpoint, index) => (
          <EndpointCard key={index} endpoint={endpoint} />
        ))}
      </Box>
    </Container>
  );
} 