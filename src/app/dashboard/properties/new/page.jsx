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

const validateFormData = (data) => {
  const validations = {
    basicInfo: {
      isValid: Boolean(
        data.name &&
        data.description &&
        data.propertyType &&
        data.basePrice &&
        data.bedrooms &&
        data.beds &&
        data.bathrooms &&
        data.maxGuests &&
        data.checkInTime &&
        data.checkOutTime
      ),
      missingFields: []
    },
    location: {
      isValid: Boolean(
        data.location.address &&
        data.location.latitude &&
        data.location.longitude
      ),
      missingFields: []
    },
    amenities: {
      isValid: data.amenities.length > 0,
      missingFields: []
    },
    photos: {
      isValid: data.photos.length > 0,
      missingFields: []
    }
  };

  // Check basic info missing fields
  if (!data.name) validations.basicInfo.missingFields.push('Property Name');
  if (!data.description) validations.basicInfo.missingFields.push('Description');
  if (!data.propertyType) validations.basicInfo.missingFields.push('Property Type');
  if (!data.basePrice) validations.basicInfo.missingFields.push('Base Price');
  if (!data.bedrooms) validations.basicInfo.missingFields.push('Bedrooms');
  if (!data.beds) validations.basicInfo.missingFields.push('Beds');
  if (!data.bathrooms) validations.basicInfo.missingFields.push('Bathrooms');
  if (!data.maxGuests) validations.basicInfo.missingFields.push('Maximum Guests');
  if (!data.checkInTime) validations.basicInfo.missingFields.push('Check-in Time');
  if (!data.checkOutTime) validations.basicInfo.missingFields.push('Check-out Time');

  // Check location missing fields
  if (!data.location.address) validations.location.missingFields.push('Address');
  if (!data.location.latitude || !data.location.longitude) validations.location.missingFields.push('Map Location');

  // Check amenities
  if (data.amenities.length === 0) validations.amenities.missingFields.push('At least one amenity');

  // Check photos
  if (data.photos.length === 0) validations.photos.missingFields.push('At least one photo');

  return validations;
};

const calculateTotalPrice = (basePrice, cleaningFee, securityDeposit) => {
  const subtotal = parseFloat(basePrice) || 0;
  const cleaning = parseFloat(cleaningFee) || 0;
  const deposit = parseFloat(securityDeposit) || 0;
  const serviceFee = subtotal * 0.12; // 12% service fee
  const tax = subtotal * 0.08; // 8% tax

  return {
    subtotal,
    cleaning,
    deposit,
    serviceFee,
    tax,
    total: subtotal + cleaning + serviceFee + tax,
    totalWithDeposit: subtotal + cleaning + deposit + serviceFee + tax
  };
};

// Icon aliases
const UploadIcon = CloudUpload;
const DeleteIcon = Delete;
const StarIcon = Star;
const SearchIcon = Search;
const NoSmokingIcon = SmokeFree;
const NoPartiesIcon = Block;
const NoPetsIcon = PetsOutlined;
const QuietIcon = VolumeOff;
const NoShoesIcon = DoNotStep;
const SecurityIcon = Security;
const WarningIcon = Warning;

const amenityIcons = {
  'Wifi': Wifi,
  'Air conditioning': AcUnit,
  'Heating': AcUnit,
  'Washer': LocalLaundryService,
  'Dryer': Dry,
  'Iron': Iron,
  'TV': Tv,
  'Workspace': Computer,
  'Hair dryer': Bathroom,
  'Basic toiletries': Bathroom,
  'Bed linens': KingBed,
  'Towels': Bathroom,
  'Hangers': Iron,
  'Private pool': Pool,
  'Hot tub': HotTub,
  'Free parking': LocalParking,
  'EV charger': EvStation,
  'Gym': FitnessCenter,
  'BBQ grill': OutdoorGrill,
  'Fire pit': LocalFireDepartment,
  'Pool table': SportsBar,
  'Indoor fireplace': Fireplace,
  'Outdoor shower': Shower,
  'Balcony': Balcony,
  'Garden': Park,
  'Beach access': BeachAccess,
  'Ski-in/ski-out': Snowboarding,
  'Full kitchen': Kitchen,
  'Coffee maker': Coffee,
  'Cooking basics': Kitchen,
  'Dishes and utensils': Restaurant,
  'Dining table': Restaurant,
  'Wine glasses': WineBar,
  'Smoke alarm': Warning,
  'Carbon monoxide alarm': Warning,
  'Fire extinguisher': LocalFireDepartment,
  'First aid kit': Security,
  'Security cameras': Security,
  'Safe': Security,
  'Step-free entrance': Accessible,
  'Wide doorways': Accessible,
  'Accessible bathroom': Accessible,
  'Ground floor access': Accessible,
  'Elevator': Elevator,
};

const houseRuleIcons = {
  'No smoking': SmokeFree,
  'No parties': Block,
  'No pets': PetsOutlined,
  'No unregistered guests': Security,
  'Quiet hours': VolumeOff,
  'No shoes inside': DoNotStep,
};

export default function NewProperty() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [searchBox, setSearchBox] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [validations, setValidations] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    propertyType: '',
    price: '',
    amenities: [],
    location: {
      address: '',
      latitude: null,
      longitude: null,
    },
    photos: [],
    coverPhotoIndex: 0,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    maxGuests: 2,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    houseRules: [],
    customRules: [],
    cancellationPolicy: 'FLEXIBLE',
    instantBooking: false,
    minimumStay: 1,
    maximumStay: 0,
    basePrice: 0,
    cleaningFee: 0,
    securityDeposit: 0,
    description_long: '',
    spaceDescription: '',
    guestAccess: '',
    neighborhood: '',
    transportation: '',
  });

  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (activeStep === 4) {
      setValidations(validateFormData(formData));
    }
  }, [activeStep, formData]);

  const onDrop = useCallback((acceptedFiles) => {
    const newPhotos = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (name) => (content) => {
    setFormData(prev => ({
      ...prev,
      [name]: content
    }));
  };

  const handleLocationSelect = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    // Reverse geocoding to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          setFormData(prev => ({
            ...prev,
            location: {
              address: results[0].formatted_address,
              latitude: lat,
              longitude: lng,
            }
          }));
        }
      }
    });
  };

  const handlePhotoDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      coverPhotoIndex: prev.coverPhotoIndex === index ? 0 : prev.coverPhotoIndex
    }));
  };

  const handleSetCover = (index) => {
    setFormData(prev => ({
      ...prev,
      coverPhotoIndex: index
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      propertyType: '',
      price: '',
      amenities: [],
      location: {
        address: '',
        latitude: null,
        longitude: null,
      },
      photos: [],
      coverPhotoIndex: 0,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      maxGuests: 2,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      houseRules: [],
      customRules: [],
      cancellationPolicy: 'FLEXIBLE',
      instantBooking: false,
      minimumStay: 1,
      maximumStay: 0,
      basePrice: 0,
      cleaningFee: 0,
      securityDeposit: 0,
      description_long: '',
      spaceDescription: '',
      guestAccess: '',
      neighborhood: '',
      transportation: '',
    });
    setActiveStep(0);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Create FormData for file upload
      const data = new FormData();
      
      // Add photos without reordering - we'll store the index separately
      formData.photos.forEach((photo, index) => {
        data.append('photos', photo.file);
      });

      // Add other form data
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('propertyType', formData.propertyType);
      data.append('price', formData.basePrice.toString());
      data.append('amenities', JSON.stringify(formData.amenities));
      data.append('location', JSON.stringify(formData.location));
      data.append('coverPhotoIndex', formData.coverPhotoIndex.toString());
      data.append('bedrooms', formData.bedrooms.toString());
      data.append('beds', formData.beds.toString());
      data.append('bathrooms', formData.bathrooms.toString());
      data.append('maxGuests', formData.maxGuests.toString());
      data.append('checkInTime', formData.checkInTime);
      data.append('checkOutTime', formData.checkOutTime);
      data.append('houseRules', JSON.stringify(formData.houseRules));
      data.append('customRules', JSON.stringify(formData.customRules));
      data.append('cancellationPolicy', formData.cancellationPolicy);
      data.append('instantBooking', formData.instantBooking.toString());
      data.append('minimumStay', formData.minimumStay.toString());
      data.append('maximumStay', formData.maximumStay.toString());
      data.append('basePrice', formData.basePrice.toString());
      data.append('cleaningFee', formData.cleaningFee.toString());
      data.append('securityDeposit', formData.securityDeposit.toString());
      data.append('description_long', formData.description_long);
      data.append('spaceDescription', formData.spaceDescription);
      data.append('guestAccess', formData.guestAccess);
      data.append('neighborhood', formData.neighborhood);
      data.append('transportation', formData.transportation);

      // Add user ID and role to the form data for verification
      data.append('userId', user?.id || '');
      data.append('userRole', user?.role || '');

      const response = await fetch('/api/properties', {
        method: 'POST',
        body: data,
        credentials: 'include',
        headers: {
          // Add authorization header using user info from Redux store
          'Authorization': `Bearer ${user?.id || ''}`,
          'X-User-Role': user?.role || ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create property');
      }

      setSuccess(true);
      setOpenSnackbar(true);
      // Reset form
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleRuleToggle = (rule) => {
    setFormData(prev => ({
      ...prev,
      houseRules: prev.houseRules.includes(rule)
        ? prev.houseRules.filter(r => r !== rule)
        : [...prev.houseRules, rule]
    }));
  };

  const handleCustomRuleAdd = (rule) => {
    if (rule.trim()) {
      setFormData(prev => ({
        ...prev,
        customRules: [...prev.customRules, rule.trim()]
      }));
    }
  };

  const onPlaceSelected = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setFormData(prev => ({
          ...prev,
          location: {
            address: place.formatted_address,
            latitude: lat,
            longitude: lng,
          }
        }));
      }
    }
  };

  const onLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
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
              <Typography variant="subtitle1" gutterBottom>
                Short Description
              </Typography>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={formData.description}
                init={{
                  height: 200,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                    'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist | ' +
                    'removeformat',
                  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; }',
                }}
                onEditorChange={handleEditorChange('description')}
              />
              <Typography variant="caption" color="text.secondary">
                A brief overview of your property (max 200 characters)
              </Typography>
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
                    {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
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
                  startAdornment: '$',
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
                  startAdornment: '$',
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
                  startAdornment: '$',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Guests"
                name="maxGuests"
                value={formData.maxGuests}
                onChange={handleInputChange}
                required
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
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box sx={{ height: 500, width: '100%' }}>
            <LoadScript
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              libraries={['places']}
            >
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  onLoad={onLoad}
                  onPlaceChanged={onPlaceSelected}
                >
                  <TextField
                    fullWidth
                    placeholder="Search for a location..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Autocomplete>
              </Box>
              <GoogleMap
                mapContainerStyle={{ height: '400px', width: '100%' }}
                center={
                  formData.location.latitude && formData.location.longitude
                    ? {
                        lat: formData.location.latitude,
                        lng: formData.location.longitude,
                      }
                    : { lat: 40.7128, lng: -74.0060 } // Default to NYC
                }
                zoom={13}
                onClick={handleLocationSelect}
              >
                {formData.location.latitude && formData.location.longitude && (
                  <Marker
                    position={{
                      lat: formData.location.latitude,
                      lng: formData.location.longitude
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
            {formData.location.address && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Selected location: {formData.location.address}
              </Typography>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Amenities
            </Typography>
            {Object.entries(amenityCategories).map(([category, { title, items }]) => (
              <Box key={category} sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {title}
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    {items.map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || null;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={amenity}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.amenities.includes(amenity)}
                                onChange={() => handleAmenityToggle(amenity)}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {IconComponent && <IconComponent fontSize="small" />}
                                {amenity}
                              </Box>
                            }
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </FormGroup>
              </Box>
            ))}

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              House Rules
            </Typography>
            <FormGroup>
              {houseRules.standard.map((rule) => {
                const IconComponent = houseRuleIcons[rule] || null;
                return (
                  <FormControlLabel
                    key={rule}
                    control={
                      <Checkbox
                        checked={formData.houseRules.includes(rule)}
                        onChange={() => handleRuleToggle(rule)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {IconComponent && <IconComponent fontSize="small" />}
                        {rule}
                      </Box>
                    }
                  />
                );
              })}
            </FormGroup>

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Add Custom Rule"
                placeholder="Enter a custom rule"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomRuleAdd(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </Box>

            {formData.customRules.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.customRules.map((rule, index) => (
                  <Chip
                    key={index}
                    label={rule}
                    onDelete={() => {
                      setFormData(prev => ({
                        ...prev,
                        customRules: prev.customRules.filter((_, i) => i !== index)
                      }));
                    }}
                  />
                ))}
              </Box>
            )}

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Detailed Description
                </Typography>
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  value={formData.description_long}
                  init={{
                    height: 400,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                      'template'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; }',
                  }}
                  onEditorChange={handleEditorChange('description_long')}
                />
                <Typography variant="caption" color="text.secondary">
                  Provide a detailed description of your property
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="The Space"
                  name="spaceDescription"
                  value={formData.spaceDescription}
                  onChange={handleInputChange}
                  helperText="Describe the spaces guests can use"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Guest Access"
                  name="guestAccess"
                  value={formData.guestAccess}
                  onChange={handleInputChange}
                  helperText="Explain what guests can access during their stay"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="The Neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  helperText="Describe the neighborhood and nearby attractions"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Getting Around"
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleInputChange}
                  helperText="Explain transportation options and parking situation"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Property Photos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload photos of your property. The first photo marked with a star will be your cover photo.
            </Typography>

            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                mb: 3,
                cursor: 'pointer',
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography>
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag & drop photos here, or click to select files'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Supported formats: JPEG, JPG, PNG
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {formData.photos.map((photo, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      position: 'relative',
                      '&:hover .cover-photo-button': {
                        opacity: 1,
                      },
                    }}
                  >
                    {formData.coverPhotoIndex === index && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 2,
                          bgcolor: 'primary.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Star />
                        <Typography variant="caption">Cover Photo</Typography>
                      </Box>
                    )}
                    <CardMedia
                      component="img"
                      height="200"
                      image={photo.preview}
                      alt={`Property photo ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box
                      className="cover-photo-button"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        opacity: formData.coverPhotoIndex === index ? 1 : 0,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <Button
                        size="small"
                        startIcon={<Star />}
                        onClick={() => handleSetCover(index)}
                        sx={{
                          color: formData.coverPhotoIndex === index ? 'primary.main' : 'white',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        {formData.coverPhotoIndex === index ? 'Cover Photo' : 'Set as Cover'}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handlePhotoDelete(index)}
                        sx={{ 
                          color: 'error.light',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {formData.photos.length === 0 && (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary">
                  No photos uploaded yet
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 4:
        const priceCalculation = calculateTotalPrice(
          formData.basePrice,
          formData.cleaningFee,
          formData.securityDeposit
        );

        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review your property listing
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review all the information before creating your listing.
            </Typography>

            {/* Validation Summary */}
            <Paper sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                Listing Completion Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Basic Information</Typography>
                    {renderValidationStatus('basicInfo')}
                  </Box>
                  {!validations?.basicInfo.isValid && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                      Missing: {validations?.basicInfo.missingFields.join(', ')}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Location</Typography>
                    {renderValidationStatus('location')}
                  </Box>
                  {!validations?.location.isValid && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                      Missing: {validations?.location.missingFields.join(', ')}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Amenities</Typography>
                    {renderValidationStatus('amenities')}
                  </Box>
                  {!validations?.amenities.isValid && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                      Missing: {validations?.amenities.missingFields.join(', ')}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Photos</Typography>
                    {renderValidationStatus('photos')}
                  </Box>
                  {!validations?.photos.isValid && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                      Missing: {validations?.photos.missingFields.join(', ')}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Price Summary */}
            <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Price Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Nightly Breakdown
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Base price</Typography>
                      <Typography>${priceCalculation.subtotal}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Cleaning fee</Typography>
                      <Typography>${priceCalculation.cleaning}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Service fee (12%)</Typography>
                      <Typography>${priceCalculation.serviceFee.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Tax (8%)</Typography>
                      <Typography>${priceCalculation.tax.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <Typography>Total (per night)</Typography>
                      <Typography>${priceCalculation.total.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Additional Fees
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Security deposit</Typography>
                      <Typography>${priceCalculation.deposit}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Security deposit is refundable after checkout if no damages are reported.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Guest Preview */}
            <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Guest Preview
              </Typography>
              <Box sx={{ bgcolor: 'background.default', borderRadius: 2, overflow: 'hidden' }}>
                {/* Cover Photo */}
                <Box sx={{ position: 'relative', height: 300 }}>
                  {formData.photos[formData.coverPhotoIndex] && (
                    <Box
                      component="img"
                      src={formData.photos[formData.coverPhotoIndex].preview}
                      alt="Cover"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </Box>
                
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {formData.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Typography color="text.secondary">
                      {formData.location.address}
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Guests
                      </Typography>
                      <Typography>{formData.maxGuests}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Bedrooms
                      </Typography>
                      <Typography>{formData.bedrooms}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Beds
                      </Typography>
                      <Typography>{formData.beds}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Bathrooms
                      </Typography>
                      <Typography>{formData.bathrooms}</Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    About this space
                  </Typography>
                  <Typography paragraph>
                    {formData.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    What this place offers
                  </Typography>
                  <Grid container spacing={1}>
                    {formData.amenities.slice(0, 8).map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || null;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={amenity}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {IconComponent && <IconComponent fontSize="small" color="primary" />}
                            <Typography variant="body2">{amenity}</Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                    {formData.amenities.length > 8 && (
                      <Grid item xs={12}>
                        <Button variant="text">
                          Show all {formData.amenities.length} amenities
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Box>
            </Paper>

            {/* Existing sections */}
            <Grid container spacing={4}>
              {/* ... existing review sections ... */}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderValidationStatus = (section) => {
    if (!validations || !validations[section]) return null;

    return validations[section].isValid ? (
      <Chip
        size="small"
        color="success"
        label="Complete"
        sx={{ ml: 2 }}
      />
    ) : (
      <Chip
        size="small"
        color="error"
        label={`Missing ${validations[section].missingFields.length} items`}
        sx={{ ml: 2 }}
      />
    );
  };

  const SuccessView = () => (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h4" gutterBottom color="success.main">
        Property Created Successfully!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Your property has been submitted and is pending approval.
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => router.push('/dashboard/properties')}
        >
          View My Properties
        </Button>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => {
            setSuccess(false);
            resetForm();
          }}
        >
          Add Another Property
        </Button>
      </Box>
    </Box>
  );

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {success ? 'Property Created' : 'List a New Property'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <SuccessView />
          ) : (
            <>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ mt: 4 }}>
                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                  {activeStep > 0 && (
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Create Property'}
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
            </>
          )}
        </Paper>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          Property created successfully!
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
} 