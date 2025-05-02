'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Rating,
  Stack,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Hotel as HotelIcon,
  Star as StarIcon,
} from '@mui/icons-material';

export default function PropertyCard({ property, variant = 'default' }) {
  const router = useRouter();

  const {
    id,
    name,
    location,
    propertyType,
    price,
    photos,
    amenities = [],
    avgRating,
    reviewCount = 0,
    status,
  } = property;

  const handleViewDetails = () => {
    router.push(`/properties/${id}`);
  };

  const isCompact = variant === 'compact';

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      <Box sx={{ position: 'relative', paddingTop: isCompact ? '56.25%' : '75%' }}>
        <Image
          src={photos?.[0] || '/placeholder.jpg'}
          alt={name}
          fill
          style={{
            objectFit: 'cover',
            borderRadius: '8px 8px 0 0',
          }}
        />
        {status && (
          <Chip
            label={status}
            color={
              status === 'ACTIVE'
                ? 'success'
                : status === 'PENDING'
                ? 'warning'
                : 'default'
            }
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              borderRadius: 1,
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Stack spacing={1}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {location}
              </Typography>
            </Box>
          </Box>

          {!isCompact && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<HotelIcon />}
                label={propertyType}
                size="small"
                sx={{ borderRadius: 1 }}
              />
              {avgRating > 0 && (
                <Chip
                  icon={<StarIcon />}
                  label={`${avgRating.toFixed(1)} (${reviewCount})`}
                  size="small"
                  color="primary"
                  sx={{ borderRadius: 1 }}
                />
              )}
            </Box>
          )}

          {!isCompact && amenities.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {amenities.slice(0, 3).map((amenity) => (
                <Chip
                  key={amenity}
                  label={amenity}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              ))}
              {amenities.length > 3 && (
                <Chip
                  label={`+${amenities.length - 3} more`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              )}
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 'auto',
            }}
          >
            <Typography variant="h6" color="primary">
              ${price}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 0.5 }}
              >
                /night
              </Typography>
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleViewDetails}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
              }}
            >
              View Details
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
} 