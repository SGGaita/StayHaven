'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  useTheme,
  alpha,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Fab,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  Block as BlockIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  EventAvailable as AvailableIcon,
  EventBusy as BusyIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const EventComponent = ({ event }) => {
  const getEventColor = (type) => {
    switch (type) {
      case 'booking':
        return '#FF385C';
      case 'blocked':
        return '#DC3545';
      case 'maintenance':
        return '#FFC107';
      case 'special_price':
        return '#28A745';
      default:
        return '#6C757D';
    }
  };

  return (
    <Box
      sx={{
        padding: '2px 4px',
        borderRadius: 1,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'white',
        backgroundColor: getEventColor(event.type),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {event.title}
    </Box>
  );
};

export default function PropertyCalendar() {
  const theme = useTheme();
  const user = useSelector(selectCurrentUser);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [events, setEvents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [blockDateDialog, setBlockDateDialog] = useState(false);
  const [pricingDialog, setPricingDialog] = useState(false);
  const [eventDetailsDialog, setEventDetailsDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form states
  const [blockForm, setBlockForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    note: '',
  });
  const [pricingForm, setPricingForm] = useState({
    startDate: '',
    endDate: '',
    price: '',
    isSpecialOffer: false,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchCalendarData();
    }
  }, [selectedProperty]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/dashboard/properties', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
        if (data.properties?.length > 0) {
          setSelectedProperty(data.properties[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/properties/${selectedProperty}/calendar`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform data to calendar events
        const calendarEvents = [
          ...data.bookings.map(booking => ({
            id: booking.id,
            title: `Booking - ${booking.customer.firstName} ${booking.customer.lastName}`,
            start: new Date(booking.startDate),
            end: new Date(booking.endDate),
            type: 'booking',
            resource: booking,
          })),
          ...data.blockedDates.map(block => ({
            id: `block-${block.id}`,
            title: `Blocked - ${block.reason}`,
            start: new Date(block.startDate),
            end: new Date(block.endDate),
            type: 'blocked',
            resource: block,
          })),
          ...data.specialPricing.map(pricing => ({
            id: `pricing-${pricing.id}`,
            title: `Special Price - $${pricing.price}`,
            start: new Date(pricing.startDate),
            end: new Date(pricing.endDate),
            type: 'special_price',
            resource: pricing,
          })),
        ];
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setEventDetailsDialog(true);
  };

  const handleSlotSelect = ({ start, end }) => {
    setBlockForm({
      startDate: moment(start).format('YYYY-MM-DD'),
      endDate: moment(end).format('YYYY-MM-DD'),
      reason: '',
      note: '',
    });
    setBlockDateDialog(true);
  };

  const handleBlockDates = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/properties/${selectedProperty}/block-dates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(blockForm),
        }
      );

      if (response.ok) {
        fetchCalendarData();
        setBlockDateDialog(false);
        setBlockForm({ startDate: '', endDate: '', reason: '', note: '' });
      }
    } catch (error) {
      console.error('Error blocking dates:', error);
    }
  };

  const handleSetSpecialPricing = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/properties/${selectedProperty}/special-pricing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(pricingForm),
        }
      );

      if (response.ok) {
        fetchCalendarData();
        setPricingDialog(false);
        setPricingForm({ startDate: '', endDate: '', price: '', isSpecialOffer: false });
      }
    } catch (error) {
      console.error('Error setting special pricing:', error);
    }
  };

  const handleDeleteEvent = async (eventId, eventType) => {
    try {
      let endpoint = '';
      if (eventType === 'blocked') {
        endpoint = `/api/dashboard/properties/${selectedProperty}/blocked-dates/${eventId}`;
      } else if (eventType === 'special_price') {
        endpoint = `/api/dashboard/properties/${selectedProperty}/special-pricing/${eventId}`;
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          fetchCalendarData();
          setEventDetailsDialog(false);
        }
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getTodayStats = () => {
    const today = moment().startOf('day');
    const todayEvents = events.filter(event =>
      moment(event.start).isSame(today, 'day') ||
      moment(event.end).isSame(today, 'day') ||
      (moment(event.start).isBefore(today) && moment(event.end).isAfter(today))
    );

    return {
      checkIns: todayEvents.filter(e => e.type === 'booking' && moment(e.start).isSame(today, 'day')).length,
      checkOuts: todayEvents.filter(e => e.type === 'booking' && moment(e.end).isSame(today, 'day')).length,
      activeBookings: todayEvents.filter(e => e.type === 'booking').length,
      blockedDates: todayEvents.filter(e => e.type === 'blocked').length,
    };
  };

  const getUpcomingEvents = () => {
    const upcoming = events
      .filter(event => moment(event.start).isAfter(moment()))
      .sort((a, b) => moment(a.start).diff(moment(b.start)))
      .slice(0, 5);
    
    return upcoming;
  };

  const stats = getTodayStats();
  const upcomingEvents = getUpcomingEvents();

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Property Calendar 📅
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage availability, pricing, and view bookings
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<MoneyIcon />}
                onClick={() => setPricingDialog(true)}
                disabled={!selectedProperty}
              >
                Set Special Pricing
              </Button>
              <Button
                variant="contained"
                startIcon={<BlockIcon />}
                onClick={() => setBlockDateDialog(true)}
                disabled={!selectedProperty}
                sx={{
                  background: '#FF385C',
                  '&:hover': {
                    background: '#E61E4D',
                  },
                }}
              >
                Block Dates
              </Button>
            </Stack>
          </Box>

          {/* Property Selector */}
          <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>Select Property</InputLabel>
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              label="Select Property"
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: alpha('#FF385C', 0.1), color: '#FF385C', mx: 'auto', mb: 2 }}>
                  <CheckIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold">{stats.checkIns}</Typography>
                <Typography variant="body2" color="text.secondary">Check-ins Today</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: alpha('#28A745', 0.1), color: '#28A745', mx: 'auto', mb: 2 }}>
                  <EventIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold">{stats.checkOuts}</Typography>
                <Typography variant="body2" color="text.secondary">Check-outs Today</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: alpha('#17A2B8', 0.1), color: '#17A2B8', mx: 'auto', mb: 2 }}>
                  <AvailableIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold">{stats.activeBookings}</Typography>
                <Typography variant="body2" color="text.secondary">Active Bookings</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: alpha('#DC3545', 0.1), color: '#DC3545', mx: 'auto', mb: 2 }}>
                  <BusyIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold">{stats.blockedDates}</Typography>
                <Typography variant="body2" color="text.secondary">Blocked Periods</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Calendar */}
          <Grid item xs={12} lg={9}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: 600,
              }}
            >
              {selectedProperty ? (
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleEventSelect}
                  onSelectSlot={handleSlotSelect}
                  selectable
                  views={['month', 'week', 'day']}
                  view={calendarView}
                  onView={setCalendarView}
                  components={{
                    event: EventComponent,
                  }}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: 0,
                    },
                  })}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary',
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h6">Select a property to view calendar</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={3}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TodayIcon />}
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Go to Today
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => setCalendarView('month')}
                  >
                    Month View
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    onClick={() => setCalendarView('week')}
                  >
                    Week View
                  </Button>
                </Stack>
              </Paper>

              {/* Upcoming Events */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Upcoming Events
                </Typography>
                {upcomingEvents.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {upcomingEvents.map((event, index) => (
                      <ListItem
                        key={event.id}
                        sx={{
                          px: 0,
                          py: 1,
                          borderBottom: index < upcomingEvents.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: event.type === 'booking' ? alpha('#FF385C', 0.1) :
                                      event.type === 'blocked' ? alpha('#DC3545', 0.1) :
                                      alpha('#28A745', 0.1),
                              color: event.type === 'booking' ? '#FF385C' :
                                     event.type === 'blocked' ? '#DC3545' :
                                     '#28A745',
                            }}
                          >
                            {event.type === 'booking' ? <EventIcon fontSize="small" /> :
                             event.type === 'blocked' ? <BlockIcon fontSize="small" /> :
                             <MoneyIcon fontSize="small" />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontSize: '0.875rem' }}>
                              {event.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {moment(event.start).format('MMM DD, YYYY')}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming events
                  </Typography>
                )}
              </Paper>

              {/* Legend */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Legend
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: '#FF385C',
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">Bookings</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: '#DC3545',
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">Blocked Dates</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: '#28A745',
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">Special Pricing</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Block Dates Dialog */}
        <Dialog
          open={blockDateDialog}
          onClose={() => setBlockDateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Block Dates</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Start Date"
                type="date"
                value={blockForm.startDate}
                onChange={(e) => setBlockForm({ ...blockForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={blockForm.endDate}
                onChange={(e) => setBlockForm({ ...blockForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Reason</InputLabel>
                <Select
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  label="Reason"
                >
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="personal_use">Personal Use</MenuItem>
                  <MenuItem value="renovation">Renovation</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Note (Optional)"
                value={blockForm.note}
                onChange={(e) => setBlockForm({ ...blockForm, note: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBlockDateDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleBlockDates}
              disabled={!blockForm.startDate || !blockForm.endDate || !blockForm.reason}
            >
              Block Dates
            </Button>
          </DialogActions>
        </Dialog>

        {/* Special Pricing Dialog */}
        <Dialog
          open={pricingDialog}
          onClose={() => setPricingDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Set Special Pricing</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Start Date"
                type="date"
                value={pricingForm.startDate}
                onChange={(e) => setPricingForm({ ...pricingForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={pricingForm.endDate}
                onChange={(e) => setPricingForm({ ...pricingForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Price per Night"
                type="number"
                value={pricingForm.price}
                onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={pricingForm.isSpecialOffer}
                    onChange={(e) => setPricingForm({ ...pricingForm, isSpecialOffer: e.target.checked })}
                  />
                }
                label="Mark as Special Offer"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPricingDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSetSpecialPricing}
              disabled={!pricingForm.startDate || !pricingForm.endDate || !pricingForm.price}
            >
              Set Pricing
            </Button>
          </DialogActions>
        </Dialog>

        {/* Event Details Dialog */}
        <Dialog
          open={eventDetailsDialog}
          onClose={() => setEventDetailsDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Event Details
            <IconButton
              onClick={() => setEventDetailsDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedEvent && (
              <Stack spacing={2}>
                <Alert severity={selectedEvent.type === 'booking' ? 'info' : selectedEvent.type === 'blocked' ? 'warning' : 'success'}>
                  {selectedEvent.type === 'booking' ? 'Booking' : selectedEvent.type === 'blocked' ? 'Blocked Period' : 'Special Pricing'}
                </Alert>
                <Typography variant="h6">{selectedEvent.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {moment(selectedEvent.start).format('MMM DD, YYYY')} - {moment(selectedEvent.end).format('MMM DD, YYYY')}
                </Typography>
                {selectedEvent.resource && (
                  <Box>
                    {selectedEvent.type === 'booking' && (
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">Guest Details:</Typography>
                        <Typography variant="body2">
                          {selectedEvent.resource.customer?.firstName} {selectedEvent.resource.customer?.lastName}
                        </Typography>
                        <Typography variant="body2">
                          Email: {selectedEvent.resource.customer?.email}
                        </Typography>
                        <Typography variant="body2">
                          Total: ${selectedEvent.resource.price}
                        </Typography>
                      </Stack>
                    )}
                    {selectedEvent.type === 'blocked' && selectedEvent.resource.note && (
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">Note:</Typography>
                        <Typography variant="body2">{selectedEvent.resource.note}</Typography>
                      </Stack>
                    )}
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            {selectedEvent && (selectedEvent.type === 'blocked' || selectedEvent.type === 'special_price') && (
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteEvent(selectedEvent.resource?.id, selectedEvent.type)}
              >
                Delete
              </Button>
            )}
            <Button onClick={() => setEventDetailsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
} 