'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  FormControl,
  Divider,
  Chip,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Star,
  Search,
  Wifi,
  AcUnit,
  LocalLaundryService,
  Dry,
  Iron,
  Tv,
  Computer,
  Bathroom,
  KingBed,
  Kitchen,
  Pool,
  HotTub,
  LocalParking,
  EvStation,
  FitnessCenter,
  OutdoorGrill,
  LocalFireDepartment,
  SportsBar,
  Fireplace,
  Shower,
  Balcony,
  Park,
  BeachAccess,
  Snowboarding,
  Coffee,
  Restaurant,
  WineBar,
  Security,
  Accessible,
  Elevator,
  SmokeFree,
  Block,
  PetsOutlined,
  VolumeOff,
  DoNotStep,
  Warning,
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { Editor } from '@tinymce/tinymce-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import { useRouter } from 'next/navigation';

const propertyTypes = [
  'APARTMENT',
  'HOUSE',
  'VILLA',
  'CONDO',
  'TOWNHOUSE',
  'COTTAGE',
  'CABIN',
  'BUNGALOW',
  'LOFT',
  'GUESTHOUSE',
  'FARM_STAY',
  'BOAT',
  'TREEHOUSE',
];

const amenityCategories = {
  essentials: {
    title: 'Essentials',
    items: [
      'Wifi',
      'Air conditioning',
      'Heating',
      'Hot water',
      'Washer',
      'Dryer',
      'Iron',
      'TV',
      'Workspace',
      'Hair dryer',
      'Basic toiletries',
      'Bed linens',
      'Towels',
      'Hangers',
    ],
  },
  features: {
    title: 'Property Features',
    items: [
      'Private pool',
      'Hot tub',
      'Free parking',
      'EV charger',
      'Gym',
      'BBQ grill',
      'Fire pit',
      'Pool table',
      'Indoor fireplace',
      'Outdoor shower',
      'Balcony',
      'Garden',
      'Beach access',
      'Ski-in/ski-out',
    ],
  },
  kitchen: {
    title: 'Kitchen & Dining',
    items: [
      'Full kitchen',
      'Microwave',
      'Refrigerator',
      'Dishwasher',
      'Coffee maker',
      'Cooking basics',
      'Dishes and utensils',
      'Dining table',
      'Wine glasses',
    ],
  },
  safety: {
    title: 'Safety',
    items: [
      'Smoke alarm',
      'Carbon monoxide alarm',
      'Fire extinguisher',
      'First aid kit',
      'Security cameras',
      'Safe',
    ],
  },
  accessibility: {
    title: 'Accessibility',
    items: [
      'Step-free entrance',
      'Wide doorways',
      'Accessible bathroom',
      'Ground floor access',
      'Elevator',
    ],
  },
};

const houseRules = {
  standard: [
    'No smoking',
    'No parties',
    'No pets',
    'No unregistered guests',
    'Quiet hours',
    'No shoes inside',
  ],
  custom: [], // For user-defined rules
};

const steps = ['Basic Information', 'Location', 'Amenities & Rules', 'Photos', 'Review'];

export default function EditPropertyPage({ params }) {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    propertyType: '',
    location: '',
    lat: null,
    lng: null,
    basePrice: '',
    cleaningFee: '',
    securityDeposit: '',
    checkInTime: '',
    checkOutTime: '',
    minStay: 1,
    maxStay: 30,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    maxGuests: 1,
    amenities: [],
    rules: [],
    photos: [],
    status: 'PENDING'
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'X-User-Role': user?.role || ''
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property');
      }

      const property = await response.json();
      
      setFormData({
        name: property.name || '',
        description: property.description || '',
        propertyType: property.propertyType || '',
        location: property.location || '',
        lat: property.lat || null,
        lng: property.lng || null,
        basePrice: property.price || '',
        cleaningFee: property.cleaningFee || '',
        securityDeposit: property.securityDeposit || '',
        checkInTime: property.checkInTime || '',
        checkOutTime: property.checkOutTime || '',
        minStay: property.minStay || 1,
        maxStay: property.maxStay || 30,
        bedrooms: property.bedrooms || 1,
        beds: property.beds || 1,
        bathrooms: property.bathrooms || 1,
        maxGuests: property.maxGuests || 1,
        amenities: property.amenities || [],
        rules: property.rules || [],
        photos: property.photos || [],
        status: property.status || 'PENDING'
      });

      setUploadedPhotos(property.photos || []);
      if (property.lat && property.lng) {
        setMapCenter({ lat: property.lat, lng: property.lng });
        setSelectedLocation({ lat: property.lat, lng: property.lng });
      }

    } catch (err) {
      setError('Failed to load property details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  const handleLocationSelect = (place) => {
    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setSelectedLocation({ lat, lng });
      setMapCenter({ lat, lng });
      setFormData(prev => ({
        ...prev,
        location: place.formatted_address,
        lat,
        lng
      }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const currentAmenities = prev.amenities || [];
      const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity];
      
      return {
        ...prev,
        amenities: newAmenities
      };
    });
  };

  const handleRuleToggle = (rule) => {
    setFormData(prev => {
      const currentRules = prev.rules || [];
      const newRules = currentRules.includes(rule)
        ? currentRules.filter(r => r !== rule)
        : [...currentRules, rule];
      
      return {
        ...prev,
        rules: newRules
      };
    });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    // Handle file upload logic here
    const newPhotos = [...uploadedPhotos];
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        newPhotos.push(data.url);
      } catch (error) {
        console.error('Upload error:', error);
        setSnackbar({
          open: true,
          message: 'Failed to upload photo',
          severity: 'error'
        });
      }
    }
    
    setUploadedPhotos(newPhotos);
    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  }, [uploadedPhotos]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: true
  });

  const handlePhotoDelete = (index) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-User-Role': user?.role || ''
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update property');
      }

      setSnackbar({
        open: true,
        message: 'Property updated successfully',
        severity: 'success'
      });

      router.push('/dashboard/properties');
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Property Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <Editor
          value={formData.description}
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
          onEditorChange={handleEditorChange}
          init={{
            height: 400,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          label="Property Type"
          name="propertyType"
          value={formData.propertyType}
          onChange={handleInputChange}
          required
        >
          {propertyTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Base Price per Night"
          name="basePrice"
          value={formData.basePrice}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Cleaning Fee"
          name="cleaningFee"
          value={formData.cleaningFee}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Security Deposit"
          name="securityDeposit"
          value={formData.securityDeposit}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="time"
          label="Check-in Time"
          name="checkInTime"
          value={formData.checkInTime}
          onChange={handleInputChange}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="time"
          label="Check-out Time"
          name="checkOutTime"
          value={formData.checkOutTime}
          onChange={handleInputChange}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <TextField
          fullWidth
          type="number"
          label="Bedrooms"
          name="bedrooms"
          value={formData.bedrooms}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <TextField
          fullWidth
          type="number"
          label="Beds"
          name="beds"
          value={formData.beds}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <TextField
          fullWidth
          type="number"
          label="Bathrooms"
          name="bathrooms"
          value={formData.bathrooms}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <TextField
          fullWidth
          type="number"
          label="Max Guests"
          name="maxGuests"
          value={formData.maxGuests}
          onChange={handleInputChange}
          required
        />
      </Grid>
    </Grid>
  );

  const renderLocation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={['places']}
        >
          <Autocomplete
            onLoad={autocomplete => {
              autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                handleLocationSelect(place);
              });
            }}
          >
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </Autocomplete>

          <Box sx={{ height: 400, width: '100%', mt: 2 }}>
            <GoogleMap
              center={mapCenter}
              zoom={15}
              mapContainerStyle={{ height: '100%', width: '100%' }}
            >
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                />
              )}
            </GoogleMap>
          </Box>
        </LoadScript>
      </Grid>
    </Grid>
  );

  const renderAmenitiesAndRules = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          Amenities
        </Typography>
        {Object.entries(amenityCategories).map(([category, { title, items }]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              {title}
            </Typography>
            <FormGroup>
              {items.map((amenity) => (
                <FormControlLabel
                  key={amenity}
                  control={
                    <Checkbox
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                    />
                  }
                  label={amenity}
                />
              ))}
            </FormGroup>
          </Box>
        ))}
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          House Rules
        </Typography>
        <FormGroup>
          {houseRules.standard.map((rule) => (
            <FormControlLabel
              key={rule}
              control={
                <Checkbox
                  checked={formData.rules.includes(rule)}
                  onChange={() => handleRuleToggle(rule)}
                />
              }
              label={rule}
            />
          ))}
        </FormGroup>
      </Grid>
    </Grid>
  );

  const renderPhotos = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.default',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{ textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag and drop photos here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to select files
            </Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2}>
          {uploadedPhotos.map((photo, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={photo}
                  alt={`Property photo ${index + 1}`}
                />
                <CardActions>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handlePhotoDelete(index)}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const renderReview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Review Your Property
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Basic Information</Typography>
              <Typography>Name: {formData.name}</Typography>
              <Typography>Type: {formData.propertyType}</Typography>
              <Typography>Price: ${formData.basePrice}/night</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Location</Typography>
              <Typography>{formData.location}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Amenities</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.amenities.map((amenity) => (
                  <Chip key={amenity} label={amenity} />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">House Rules</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.rules.map((rule) => (
                  <Chip key={rule} label={rule} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

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
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/dashboard/properties')}
            sx={{ mb: 2 }}
          >
            Back to Properties
          </Button>
          <Typography variant="h4" gutterBottom>
            Edit Property
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4 }}>
            {activeStep === 0 && renderBasicInfo()}
            {activeStep === 1 && renderLocation()}
            {activeStep === 2 && renderAmenitiesAndRules()}
            {activeStep === 3 && renderPhotos()}
            {activeStep === 4 && renderReview()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={<Save />}
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
} 