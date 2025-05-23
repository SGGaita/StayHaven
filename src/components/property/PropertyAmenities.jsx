'use client';

import { Box, Grid, Typography, Paper } from '@mui/material';
import {
  Pool,
  Wifi,
  LocalParking,
  Kitchen,
  AcUnit,
  Spa,
  Tv,
  LocalLaundryService,
  Balcony,
  Security,
  Fireplace,
  OutdoorGrill,
} from '@mui/icons-material';

// Map of amenity names to their corresponding icons
const amenityIcons = {
  pool: Pool,
  wifi: Wifi,
  parking: LocalParking,
  kitchen: Kitchen,
  ac: AcUnit,
  spa: Spa,
  tv: Tv,
  laundry: LocalLaundryService,
  balcony: Balcony,
  security: Security,
  fireplace: Fireplace,
  bbq: OutdoorGrill,
};

// Function to format amenity name for display
const formatAmenityName = (name) => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function PropertyAmenities({ amenities = [] }) {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Amenities
      </Typography>
      <Grid container spacing={2}>
        {amenities.map((amenity, index) => {
          const IconComponent = amenityIcons[amenity.toLowerCase()] || null;
          
          return (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                {IconComponent && (
                  <IconComponent color="primary" sx={{ fontSize: 24 }} />
                )}
                <Typography variant="body2" color="text.primary">
                  {formatAmenityName(amenity)}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
} 