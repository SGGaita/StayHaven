'use client';

import { useState, useEffect } from 'react';
import { 
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Collapse,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { addDays, differenceInDays, format, isValid } from 'date-fns';
import { Person, Star, CheckCircle, CalendarMonth, Groups, CreditCard, CleaningServices, Support, ChevronRight, Login, Close as CloseIcon } from '@mui/icons-material';
import { bookingService } from '@/services/bookingService';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import LoginModal from '@/components/auth/LoginModal';

export default function PropertyBooking({ 
  price, 
  rating, 
  reviewCount, 
  propertyId,
  cleaningFee = 0,
  securityDeposit = 0
}) {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [fetchingDates, setFetchingDates] = useState(true);
  
  // Fetch booked dates when component mounts
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        setFetchingDates(true);
        const response = await fetch(`/api/properties/${propertyId}/booked-dates`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch booked dates');
        }
        
        const data = await response.json();
        setBookedDates(data.bookedDates.map(date => ({
          start: new Date(date.startDate),
          end: new Date(date.endDate)
        })));
      } catch (err) {
        console.error('Error fetching booked dates:', err);
        setError('Failed to load availability calendar');
      } finally {
        setFetchingDates(false);
      }
    };

    fetchBookedDates();
  }, [propertyId]);

  // Function to check if a date is booked
  const isDateBooked = (date) => {
    if (!date || !isValid(date)) return false;
    
    return bookedDates.some(booking => {
      if (!booking.start || !booking.end || !isValid(booking.start) || !isValid(booking.end)) return false;
      
      const checkDate = new Date(date);
      return checkDate >= booking.start && checkDate <= booking.end;
    });
  };

  // Function to check if a date should be disabled (past dates or booked dates)
  const shouldDisableDate = (date) => {
    if (!date || !isValid(date)) return true;
    
    // Disable past dates
    if (date < new Date().setHours(0, 0, 0, 0)) return true;
    
    // Disable booked dates
    return isDateBooked(date);
  };

  // Calculate number of nights and total price
  const numberOfNights = (checkIn && checkOut && isValid(checkIn) && isValid(checkOut)) 
    ? differenceInDays(checkOut, checkIn) 
    : 0;
  const subtotal = numberOfNights * price;
  const serviceFee = Math.round(subtotal * 0.12); // 12% service fee
  const total = subtotal + cleaningFee + serviceFee + securityDeposit;

  // Generate a unique booking reference
  const generateBookingRef = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `BK-${timestamp}-${randomStr}`;
  };

  const handleGuestsChange = (event) => {
    const value = parseInt(event.target.value);
    if (value >= 1 && value <= 10) {
      setGuests(value);
    }
  };

  const handleDateChange = (type, newValue) => {
    if (!isValid(newValue)) return;

    if (isDateBooked(newValue)) {
      setError('This date is not available');
      return;
    }

    if (type === 'checkIn') {
      setCheckIn(newValue);
      setCheckOut(null);
    } else {
      setCheckOut(newValue);
    }
    setError(null);
  };

  const handleCheckAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setShowLoginModal(true);
        return;
      }

      await checkAvailabilityAndShowConfirmation();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailabilityAndShowConfirmation = async () => {
    if (!user) {
      throw new Error('Please log in to make a booking');
    }

    if (!checkIn || !checkOut || !isValid(checkIn) || !isValid(checkOut)) {
      throw new Error('Please select valid dates');
    }

    // Check for overlapping bookings
    const response = await fetch(`/api/properties/${propertyId}/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: checkIn.toISOString(),
        endDate: checkOut.toISOString()
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to check availability');
    }

    const { available, existingBooking } = await response.json();

    if (!available) {
      throw new Error(`Sorry, this property is already booked from ${format(new Date(existingBooking.startDate), 'MMM d, yyyy')} to ${format(new Date(existingBooking.endDate), 'MMM d, yyyy')}`);
    }

    // Show the confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    try {
      setLoading(true);
      setError(null);
      await checkAvailabilityAndShowConfirmation();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure the user is logged in
      if (!user || !user.id) {
        throw new Error('Please sign in to make a booking');
      }

      // Double-check availability before confirming booking
      const availabilityResponse = await fetch(`/api/properties/${propertyId}/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: checkIn.toISOString(),
          endDate: checkOut.toISOString()
        }),
        credentials: 'include'
      });

      if (!availabilityResponse.ok) {
        const errorData = await availabilityResponse.json();
        throw new Error(errorData.error || errorData.message || 'Failed to check availability');
      }

      const { available } = await availabilityResponse.json();

      if (!available) {
        throw new Error(`Sorry, this property was just booked for these dates. Please select different dates.`);
      }
      
      const bookingRef = generateBookingRef();
      
      // Only include fields that are actually in the database schema
      // Other fields will be included in the response but aren't stored in DB
      const bookingData = {
        propertyId,
        startDate: checkIn.toISOString(),
        endDate: checkOut.toISOString(),
        status: 'PENDING',
        price: parseFloat(total),
        guests: parseInt(guests, 10) || 1,
        
        // These fields are sent for UI purposes but not stored in the DB schema
        subtotal: parseFloat(subtotal),
        cleaningFee: parseFloat(cleaningFee || 0),
        serviceFee: parseFloat(serviceFee || 0),
        securityDeposit: parseFloat(securityDeposit || 0),
        clientBookingRef: bookingRef
      };

      // Create booking using the authenticated session (via cookies)
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      // Use the bookingRef from the response or fall back to our generated one
      setBookingSuccess({ 
        ...result, 
        bookingRef: result.bookingRef || bookingRef
      });
      setShowConfirmDialog(false);
      
      // Clear form after successful booking
      setCheckIn(null);
      setCheckOut(null);
      setGuests(1);
      
      // Automatically hide success message after 5 seconds
      setTimeout(() => {
        setBookingSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          position: 'sticky',
          top: 24,
          borderRadius: 2,
        }}
      >
        {/* Success Message */}
        <Collapse in={bookingSuccess !== null}>
          <Alert 
            icon={<CheckCircle fontSize="inherit" />}
            severity="success"
            sx={{ mb: 2 }}
          >
            Booking confirmed! Reference: {bookingSuccess?.bookingRef}
          </Alert>
        </Collapse>

        {/* Error Message */}
        <Collapse in={error !== null}>
          <Alert 
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Collapse>

        {/* Price and Rating Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
            <Typography variant="h4" component="span" sx={{ fontWeight: 600 }}>
              ${price}
            </Typography>
            <Typography color="text.secondary">night</Typography>
          </Box>
          {rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Star sx={{ color: '#FFB400', fontSize: 20 }} />
              <Typography variant="body2">
                {rating} · {reviewCount} reviews
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Booking Form */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Check-in"
                value={checkIn}
                onChange={(newValue) => handleDateChange('checkIn', newValue)}
                shouldDisableDate={shouldDisableDate}
                loading={fetchingDates}
                minDate={new Date()}
                sx={{ flex: 1 }}
                disabled={loading || bookingSuccess}
                slotProps={{
                  textField: {
                    helperText: fetchingDates ? 'Loading availability...' : ''
                  }
                }}
              />
              <DatePicker
                label="Check-out"
                value={checkOut}
                onChange={(newValue) => handleDateChange('checkOut', newValue)}
                shouldDisableDate={shouldDisableDate}
                loading={fetchingDates}
                minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
                sx={{ flex: 1 }}
                disabled={loading || bookingSuccess || !checkIn}
                slotProps={{
                  textField: {
                    helperText: fetchingDates ? 'Loading availability...' : ''
                  }
                }}
              />
            </Box>

            <TextField
              label="Guests"
              type="number"
              value={guests}
              onChange={handleGuestsChange}
              disabled={loading || bookingSuccess}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
                inputProps: { min: 1, max: 10 }
              }}
            />
          </Stack>
        </LocalizationProvider>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 3, mb: 3 }}
          onClick={handleCheckAvailability}
          disabled={!checkIn || !checkOut || loading || bookingSuccess}
        >
          {loading ? <CircularProgress size={24} /> : 'Reserve'}
        </Button>

        {/* Price Breakdown */}
        {numberOfNights > 0 && (
          <Box sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>
                  ${price} × {numberOfNights} nights
                </Typography>
                <Typography>${subtotal}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Cleaning fee</Typography>
                <Typography>${cleaningFee}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Service fee</Typography>
                <Typography>${serviceFee}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 600 }}>Total</Typography>
                <Typography sx={{ fontWeight: 600 }}>${total}</Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Replace LoginPrompt Dialog with LoginModal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundImage: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Complete your booking
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Please review the details below
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Price Summary */}
            <Box sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 2,
              textAlign: 'center',
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                ${total}
              </Typography>
              <Typography variant="body2">
                Total for {numberOfNights} night{numberOfNights > 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Booking Details */}
            <Box sx={{ 
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              p: 2,
            }}>
              <Stack spacing={2}>
                {/* Dates */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarMonth color="primary" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dates
                    </Typography>
                    <Typography>
                      {checkIn && checkOut
                        ? `${format(checkIn, 'EEE, MMM d')} - ${format(checkOut, 'EEE, MMM d, yyyy')}`
                        : 'Not selected'}
                    </Typography>
                  </Box>
                </Box>

                {/* Guests */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Groups color="primary" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Guests
                    </Typography>
                    <Typography>
                      {guests} guest{guests > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Price Breakdown */}
            <Box sx={{ 
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              p: 2,
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Price breakdown
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard color="primary" sx={{ fontSize: 20 }} />
                    <Typography>
                      ${price} × {numberOfNights} nights
                    </Typography>
                  </Box>
                  <Typography>${subtotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CleaningServices color="primary" sx={{ fontSize: 20 }} />
                    <Typography>Cleaning fee</Typography>
                  </Box>
                  <Typography>${cleaningFee}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Support color="primary" sx={{ fontSize: 20 }} />
                    <Typography>Service fee</Typography>
                  </Box>
                  <Typography>${serviceFee}</Typography>
                </Box>
              </Stack>
            </Box>

            <Alert 
              severity="info" 
              icon={<CreditCard />}
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography variant="body2">
                  This is a demo booking - no payment required
                </Typography>
                <ChevronRight sx={{ color: 'action.disabled' }} />
              </Box>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Button 
            onClick={() => setShowConfirmDialog(false)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmBooking}
            disabled={loading}
            sx={{ 
              px: 4,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                Confirm · ${total}
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 