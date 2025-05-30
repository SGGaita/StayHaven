'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Paper,
  TextField,
  Button,
  InputAdornment,
  Box,
  Popper,
  Fade,
  Card,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  LocationOn,
  DateRange,
  Group,
  LocationCity,
  BeachAccess,
  Landscape,
  Clear,
  NearMe,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

// Popular destinations for suggestions
const popularDestinations = [
  { name: 'New York', type: 'city', icon: LocationCity },
  { name: 'Miami Beach', type: 'beach', icon: BeachAccess },
  { name: 'Mountain View', type: 'mountain', icon: Landscape },
  { name: 'Los Angeles', type: 'city', icon: LocationCity },
  { name: 'San Francisco', type: 'city', icon: LocationCity },
];

export default function SearchBar() {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeField, setActiveField] = useState(null);
  
  const locationRef = useRef(null);
  const searchBarRef = useRef(null);
  const theme = useTheme();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveField(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationFocus = () => {
    setShowSuggestions(true);
    setActiveField('location');
  };

  const handleLocationSelect = (destination) => {
    setLocation(destination.name);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log({ location, checkIn, checkOut, guests });
  };

  const handleGuestsChange = (e) => {
    const value = Math.max(1, Math.min(10, Number(e.target.value)));
    setGuests(value);
  };

  const handleClearLocation = () => {
    setLocation('');
    locationRef.current?.focus();
  };

  const handleUseCurrentLocation = () => {
    // In a real app, this would use the Geolocation API
    setLocation('Current Location');
    setShowSuggestions(false);
  };

  return (
    <Box ref={searchBarRef} sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      <MotionPaper
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.08),
          boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 25px 80px ${alpha(theme.palette.primary.main, 0.2)}`,
            borderColor: alpha(theme.palette.primary.main, 0.15),
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 2 },
            position: 'relative',
          }}
        >
          {/* Location Field */}
          <Box sx={{ width: { xs: '100%', md: '35%' }, position: 'relative' }}>
            <TextField
              fullWidth
              inputRef={locationRef}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={handleLocationFocus}
              placeholder="Where are you going?"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color={activeField === 'location' ? 'primary' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: location && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearLocation}>
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '16px',
                  backgroundColor: activeField === 'location' 
                    ? alpha(theme.palette.primary.main, 0.04) 
                    : 'transparent',
                  border: '2px solid',
                  borderColor: activeField === 'location' 
                    ? alpha(theme.palette.primary.main, 0.2) 
                    : 'transparent',
                  '&:hover': { 
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  fontWeight: 500,
                },
              }}
            />

            {/* Location Suggestions Popper */}
            <Popper
              open={showSuggestions}
              anchorEl={locationRef.current}
              placement="bottom-start"
              transition
              style={{ width: locationRef.current?.offsetWidth, zIndex: 1000 }}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={200}>
                  <Card sx={{ 
                    mt: 1, 
                    borderRadius: '16px',
                    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.08),
                  }}>
                    <Box sx={{ p: 2.5 }}>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Use current location">
                          <IconButton 
                            size="small" 
                            onClick={handleUseCurrentLocation}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                              },
                            }}
                          >
                            <NearMe fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Popular destinations
                        </Typography>
                      </Box>
                      <List sx={{ p: 0 }}>
                        {popularDestinations.map((destination) => (
                          <ListItem
                            key={destination.name}
                            button
                            onClick={() => handleLocationSelect(destination)}
                            sx={{
                              borderRadius: '12px',
                              mb: 0.5,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.primary.main, 0.06),
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <destination.icon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={destination.name} 
                              primaryTypographyProps={{
                                fontWeight: 500,
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Card>
                </Fade>
              )}
            </Popper>
          </Box>

          {/* Date Pickers */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{
              display: 'flex',
              gap: 2,
              width: { xs: '100%', md: '45%' },
            }}>
              <DatePicker
                value={checkIn}
                onChange={(newValue) => {
                  setCheckIn(newValue);
                  if (!checkOut && newValue) {
                    setCheckOut(addDays(newValue, 1));
                  }
                }}
                minDate={new Date()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    placeholder="Check-in"
                    onFocus={() => setActiveField('checkIn')}
                    onBlur={() => setActiveField(null)}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateRange color={activeField === 'checkIn' ? 'primary' : 'action'} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '16px',
                        backgroundColor: activeField === 'checkIn' 
                          ? alpha(theme.palette.primary.main, 0.04) 
                          : 'transparent',
                        border: '2px solid',
                        borderColor: activeField === 'checkIn' 
                          ? alpha(theme.palette.primary.main, 0.2) 
                          : 'transparent',
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          borderColor: alpha(theme.palette.primary.main, 0.1),
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: '1rem',
                        fontWeight: 500,
                      },
                    }}
                  />
                )}
              />
              <DatePicker
                value={checkOut}
                onChange={setCheckOut}
                minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    placeholder="Check-out"
                    onFocus={() => setActiveField('checkOut')}
                    onBlur={() => setActiveField(null)}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateRange color={activeField === 'checkOut' ? 'primary' : 'action'} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '16px',
                        backgroundColor: activeField === 'checkOut' 
                          ? alpha(theme.palette.primary.main, 0.04) 
                          : 'transparent',
                        border: '2px solid',
                        borderColor: activeField === 'checkOut' 
                          ? alpha(theme.palette.primary.main, 0.2) 
                          : 'transparent',
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          borderColor: alpha(theme.palette.primary.main, 0.1),
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: '1rem',
                        fontWeight: 500,
                      },
                    }}
                  />
                )}
              />
            </Box>
          </LocalizationProvider>

          {/* Guests Field */}
          <TextField
            value={guests}
            onChange={handleGuestsChange}
            onFocus={() => setActiveField('guests')}
            onBlur={() => setActiveField(null)}
            placeholder="Guests"
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Group color={activeField === 'guests' ? 'primary' : 'action'} />
                </InputAdornment>
              ),
              inputProps: { min: 1, max: 10 },
              sx: {
                borderRadius: '16px',
                backgroundColor: activeField === 'guests' 
                  ? alpha(theme.palette.primary.main, 0.04) 
                  : 'transparent',
                border: '2px solid',
                borderColor: activeField === 'guests' 
                  ? alpha(theme.palette.primary.main, 0.2) 
                  : 'transparent',
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                transition: 'all 0.2s ease-in-out',
              }
            }}
            sx={{ 
              width: { xs: '100%', md: '10%' },
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          />

          {/* Search Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleSearch}
            startIcon={<Search />}
            sx={{
              height: '64px',
              width: { xs: '100%', md: '10%' },
              minWidth: { md: '140px' },
              borderRadius: '16px',
              px: { xs: 4, md: 2 },
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateY(-3px)',
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Search
          </Button>
        </Box>
      </MotionPaper>

      {/* Active Search Indicators */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        sx={{
          display: 'flex',
          gap: 1.5,
          mt: 3,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {location && (
          <Chip
            icon={<LocationOn />}
            label={location}
            onDelete={handleClearLocation}
            color="primary"
            variant="filled"
            sx={{
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              '& .MuiChip-deleteIcon': {
                color: 'primary.main',
              },
            }}
          />
        )}
        {checkIn && checkOut && (
          <Chip
            icon={<DateRange />}
            label={`${format(checkIn, 'MMM d')} - ${format(checkOut, 'MMM d')}`}
            onDelete={() => {
              setCheckIn(null);
              setCheckOut(null);
            }}
            color="primary"
            variant="filled"
            sx={{
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              '& .MuiChip-deleteIcon': {
                color: 'primary.main',
              },
            }}
          />
        )}
        {guests > 1 && (
          <Chip
            icon={<Group />}
            label={`${guests} guests`}
            onDelete={() => setGuests(1)}
            color="primary"
            variant="filled"
            sx={{
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              '& .MuiChip-deleteIcon': {
                color: 'primary.main',
              },
            }}
          />
        )}
      </MotionBox>
    </Box>
  );
} 