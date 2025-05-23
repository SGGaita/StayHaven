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
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
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
                  borderRadius: 2,
                  bgcolor: activeField === 'location' ? 'action.hover' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.2s',
                }
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
                  <Card sx={{ mt: 1, boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)' }}>
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Use current location">
                          <IconButton size="small" onClick={handleUseCurrentLocation}>
                            <NearMe fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="subtitle2" color="text.secondary">
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
                              borderRadius: 1,
                              mb: 0.5,
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <destination.icon color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={destination.name} />
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
                        borderRadius: 2,
                        bgcolor: activeField === 'checkIn' ? 'action.hover' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background-color 0.2s',
                      }
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
                        borderRadius: 2,
                        bgcolor: activeField === 'checkOut' ? 'action.hover' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background-color 0.2s',
                      }
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
                borderRadius: 2,
                bgcolor: activeField === 'guests' ? 'action.hover' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'background-color 0.2s',
              }
            }}
            sx={{ width: { xs: '100%', md: '10%' } }}
          />

          {/* Search Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleSearch}
            startIcon={<Search />}
            sx={{
              height: '56px',
              width: { xs: '100%', md: '10%' },
              minWidth: { md: '120px' },
              borderRadius: 2,
              px: { xs: 4, md: 2 },
              bgcolor: 'primary.main',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Active Search Indicators */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mt: 2,
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
            variant="outlined"
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
            variant="outlined"
          />
        )}
        {guests > 1 && (
          <Chip
            icon={<Group />}
            label={`${guests} guests`}
            onDelete={() => setGuests(1)}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
} 