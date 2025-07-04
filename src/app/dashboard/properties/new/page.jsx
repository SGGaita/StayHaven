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
  CardContent,
  CardMedia,
  CardActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
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
  LinearProgress,
  Fade,
  Slide,
  Zoom,
  Tooltip,
  Avatar,
  Stack,
  Skeleton,
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
  ArrowForward,
  SwapHoriz,
  CheckCircle,
  RadioButtonUnchecked,
  Info,
  Home,
  LocationOn,
  PhotoCamera,
  Preview,
  TrendingUp,
} from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { Editor } from '@tinymce/tinymce-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';
import { useRouter } from 'next/navigation';

// Styled Components for Enhanced UI
const StyledStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${StepConnector.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${StepConnector.active}`]: {
    [`& .${StepConnector.line}`]: {
      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
      height: 3,
      border: 0,
      borderRadius: 1,
    },
  },
  [`&.${StepConnector.completed}`]: {
    [`& .${StepConnector.line}`]: {
      background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
      height: 3,
      border: 0,
      borderRadius: 1,
    },
  },
  [`& .${StepConnector.line}`]: {
    height: 1,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300],
    borderRadius: 1,
  },
}));

const StyledStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  ...(ownerState.active && {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: 'scale(1.1)',
    transition: 'all 0.3s ease-in-out',
  }),
  ...(ownerState.completed && {
    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
    boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.4)}`,
  }),
}));

const StepCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.9)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: 20,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.7)})`,
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  padding: theme.spacing(2.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(2),
}));

// Step Icons
const stepIcons = {
  1: <Home />,
  2: <LocationOn />,
  3: <Star />,
  4: <PhotoCamera />,
  5: <Preview />,
};

function StyledStepIcon(props) {
  const { active, completed, className } = props;
  const icon = stepIcons[String(props.icon)];

  return (
    <StyledStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <CheckCircle /> : icon}
    </StyledStepIconRoot>
  );
}

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

const steps = [
  { 
    label: 'Basic Information', 
    description: 'Property details and pricing',
    icon: <Home />
  },
  { 
    label: 'Location', 
    description: 'Set your property location',
    icon: <LocationOn />
  },
  { 
    label: 'Amenities & Rules', 
    description: 'What your place offers',
    icon: <Star />
  },
  { 
    label: 'Photos', 
    description: 'Showcase your property',
    icon: <PhotoCamera />
  },
  { 
    label: 'Review', 
    description: 'Final review and submit',
    icon: <Preview />
  }
];

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

// Amenity icons mapping
const amenityIcons = {
  'Wifi': Wifi,
  'Air conditioning': AcUnit,
  'Heating': LocalFireDepartment,
  'Hot water': Shower,
  'Washer': LocalLaundryService,
  'Dryer': Dry,
  'Iron': Iron,
  'TV': Tv,
  'Workspace': Computer,
  'Hair dryer': Dry,
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
  'Wine glasses': WineBar,
  'Smoke alarm': Security,
  'Security cameras': Security,
  'Step-free entrance': Accessible,
  'Elevator': Elevator,
  'No smoking': SmokeFree,
  'No pets': Block,
  'No parties': VolumeOff,
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
  const theme = useTheme();
  const router = useRouter();
  const currentUser = useSelector(selectCurrentUser);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [formProgress, setFormProgress] = useState(0);
  
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

  useEffect(() => {
    if (activeStep === 4) {
      setFormProgress(100);
    }
  }, [activeStep]);

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
    setFormData(prev => {
      const newPhotos = prev.photos.filter((_, i) => i !== index);
      let newCoverPhotoIndex = prev.coverPhotoIndex;
      
      // Adjust cover photo index when deleting photos
      if (index === prev.coverPhotoIndex) {
        // If we're deleting the cover photo, set to first photo (index 0)
        newCoverPhotoIndex = 0;
      } else if (index < prev.coverPhotoIndex) {
        // If we're deleting a photo before the cover photo, decrement the index
        newCoverPhotoIndex = prev.coverPhotoIndex - 1;
      }
      
      // If no photos left, reset cover index to 0
      if (newPhotos.length === 0) {
        newCoverPhotoIndex = 0;
      }
      
      return {
      ...prev,
        photos: newPhotos,
        coverPhotoIndex: newCoverPhotoIndex
      };
    });
  };

  const handleSetCover = (index) => {
    setFormData(prev => ({
      ...prev,
      coverPhotoIndex: index
    }));
  };

  const handleMovePhoto = (fromIndex, direction) => {
    setFormData(prev => {
      const newPhotos = [...prev.photos];
      const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
      
      // Check bounds
      if (toIndex < 0 || toIndex >= newPhotos.length) {
        return prev;
      }
      
      // Swap photos
      [newPhotos[fromIndex], newPhotos[toIndex]] = [newPhotos[toIndex], newPhotos[fromIndex]];
      
      // Update cover photo index if needed
      let newCoverPhotoIndex = prev.coverPhotoIndex;
      if (prev.coverPhotoIndex === fromIndex) {
        newCoverPhotoIndex = toIndex;
      } else if (prev.coverPhotoIndex === toIndex) {
        newCoverPhotoIndex = fromIndex;
      }
      
      return {
        ...prev,
        photos: newPhotos,
        coverPhotoIndex: newCoverPhotoIndex
      };
    });
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
      data.append('userId', currentUser?.id || '');
      data.append('userRole', currentUser?.role || '');

      const response = await fetch('/api/properties', {
        method: 'POST',
        body: data,
        credentials: 'include',
        headers: {
          // Add authorization header using user info from Redux store
          'Authorization': `Bearer ${currentUser?.id || ''}`,
          'X-User-Role': currentUser?.role || ''
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
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Tell us about your property
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Start with the basics - we'll help you create an amazing listing
              </Typography>
            </Box>

            <FormSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Home color="primary" />
                Basic Details
              </Typography>
              
              <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                    placeholder="e.g., Cozy Downtown Apartment with City Views"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
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
                    label="Maximum Guests"
                    name="maxGuests"
                    value={formData.maxGuests}
                onChange={handleInputChange}
                required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                }}
              />
            </Grid>
            </Grid>
            </FormSection>

            <FormSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <KingBed color="primary" />
                Sleeping Arrangements
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
              />
            </Grid>
                <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Beds"
                name="beds"
                value={formData.beds}
                onChange={handleInputChange}
                required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
              />
            </Grid>
                <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
              />
            </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Check-in Time
                    </Typography>
              <TextField
                fullWidth
                      type="time"
                      name="checkInTime"
                      value={formData.checkInTime}
                onChange={handleInputChange}
                required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
              />
                  </Box>
            </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Check-out Time
                    </Typography>
              <TextField
                fullWidth
                type="time"
                      name="checkOutTime"
                      value={formData.checkOutTime}
                onChange={handleInputChange}
                required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
              />
                  </Box>
            </Grid>
              </Grid>
            </FormSection>

            <FormSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUp color="primary" />
                Pricing
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
              />
            </Grid>
                <Grid item xs={12} sm={6} md={4}>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
          </Grid>
                <Grid item xs={12} sm={6} md={4}>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
              
              {formData.basePrice && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}>
                  <Typography variant="body2" color="primary" fontWeight="600">
                    Total per night: ${calculateTotalPrice(formData.basePrice, formData.cleaningFee, formData.securityDeposit).total.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </FormSection>

            <FormSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Info color="primary" />
                Description
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
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Help guests understand what makes your place special
              </Typography>
            </FormSection>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Where is your property located?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Help guests find your place with an accurate location
              </Typography>
            </Box>

            <FormSection>
          <Box sx={{ height: 500, width: '100%' }}>
            <LoadScript
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              libraries={['places']}
            >
                  <Box sx={{ mb: 3 }}>
                <Autocomplete
                  onLoad={onLoad}
                  onPlaceChanged={onPlaceSelected}
                >
                  <TextField
                    fullWidth
                        placeholder="Search for your property address..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                              <Search color="primary" />
                        </InputAdornment>
                      ),
                    }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                  />
                </Autocomplete>
              </Box>
                  <Paper
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
              <GoogleMap
                mapContainerStyle={{ height: '400px', width: '100%' }}
                center={
                  formData.location.latitude && formData.location.longitude
                    ? {
                        lat: formData.location.latitude,
                        lng: formData.location.longitude,
                      }
                          : { lat: 40.7128, lng: -74.0060 }
                }
                      zoom={formData.location.latitude ? 15 : 10}
                onClick={handleLocationSelect}
              >
                {formData.location.latitude && formData.location.longitude && (
                  <Marker
                    position={{
                      lat: formData.location.latitude,
                            lng: formData.location.longitude,
                    }}
                  />
                )}
              </GoogleMap>
                  </Paper>
            </LoadScript>
              </Box>
              
            {formData.location.address && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                }}>
                  <Typography variant="body2" color="success.main" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle fontSize="small" />
                    Selected Address: {formData.location.address}
              </Typography>
                </Box>
            )}
            </FormSection>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                What does your place offer?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select amenities and set house rules for your guests
              </Typography>
            </Box>

            <FormSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Star color="primary" />
              Amenities
            </Typography>
              
              {Object.entries(amenityCategories).map(([categoryKey, category]) => (
                <Box key={categoryKey} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom color="text.primary">
                    {category.title}
                </Typography>
                  <Grid container spacing={2}>
                    {category.items.map((amenity) => {
                      const IconComponent = amenityIcons[amenity];
                      const isSelected = formData.amenities.includes(amenity);
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={amenity}>
                          <Card
                            onClick={() => handleAmenityToggle(amenity)}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              borderRadius: 2,
                              border: `2px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                              bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                                borderColor: theme.palette.primary.main,
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ 
                                p: 1, 
                                borderRadius: 1, 
                                bgcolor: isSelected ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                                color: isSelected ? 'white' : 'primary.main',
                              }}>
                                {IconComponent ? <IconComponent fontSize="small" /> : <Star fontSize="small" />}
                              </Box>
                              <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                                {amenity}
                              </Typography>
                              {isSelected && <CheckCircle color="primary" fontSize="small" sx={{ ml: 'auto' }} />}
                              </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
              </Box>
            ))}
            </FormSection>

            <FormSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Security color="primary" />
              House Rules
            </Typography>
              
              <Grid container spacing={2}>
              {houseRules.standard.map((rule) => {
                  const isSelected = formData.houseRules.includes(rule);
                  
                return (
                    <Grid item xs={12} sm={6} key={rule}>
                  <FormControlLabel
                    control={
                      <Checkbox
                            checked={isSelected}
                        onChange={() => handleRuleToggle(rule)}
                            sx={{
                              '&.Mui-checked': {
                                color: 'primary.main',
                              },
                            }}
                      />
                    }
                    label={
                          <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                        {rule}
                          </Typography>
                        }
                        sx={{
                          m: 0,
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                          transition: 'all 0.2s ease-in-out',
                          width: '100%',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      />
                    </Grid>
                );
              })}
              </Grid>
            </FormSection>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Add photos of your property
            </Typography>
              <Typography variant="body1" color="text.secondary">
                High-quality photos help your listing stand out and attract more guests
            </Typography>
            </Box>

            <FormSection>
              {formData.photos.length === 0 ? (
            <Box
              {...getRootProps()}
              sx={{
                    border: `3px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                    borderRadius: 3,
                    p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-2px)',
                    },
              }}
            >
              <input {...getInputProps()} />
                  <CloudUpload 
                    sx={{ 
                      fontSize: 64, 
                      color: 'primary.main', 
                      mb: 2,
                    }} 
                  />
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Drop your photos here
              </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    or click to browse your files
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Upload high-quality photos (JPG, PNG) • Minimum 5 photos recommended
              </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">
                      Your Photos ({formData.photos.length})
                    </Typography>
                    <Button
                      {...getRootProps()}
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      sx={{ borderRadius: 2 }}
                    >
                      <input {...getInputProps()} />
                      Add More Photos
                    </Button>
            </Box>

                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 2, 
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Photo #{formData.coverPhotoIndex + 1}</strong> is set as your cover photo. 
                      This will be the main image guests see first.
                    </Typography>
                  </Alert>

            <Grid container spacing={2}>
              {formData.photos.map((photo, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      position: 'relative',
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: index === formData.coverPhotoIndex ? `3px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }}
                  >
                          {index === formData.coverPhotoIndex && (
                            <Chip
                              label="Cover Photo"
                              color="primary"
                              size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 2,
                                fontWeight: 600,
                              }}
                            />
                          )}
                          
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 2,
                              bgcolor: alpha(theme.palette.common.black, 0.6),
                              color: 'white',
                            }}
                          />

                    <CardMedia
                      component="img"
                      height="200"
                      image={photo.preview}
                      alt={`Property photo ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />

                          <CardActions 
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                              p: 1.5,
                            }}
                          >
                            <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
                              {index !== formData.coverPhotoIndex && (
                                <Tooltip title="Set as cover photo">
                                  <IconButton
                        size="small"
                        onClick={() => handleSetCover(index)}
                        sx={{
                                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                                      color: 'primary.main',
                          '&:hover': {
                                        bgcolor: 'background.paper',
                          },
                        }}
                      >
                                    <Star fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {index > 0 && (
                                <Tooltip title="Move left">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMovePhoto(index, 'left')}
                                    sx={{
                                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                                      color: 'text.primary',
                                      '&:hover': {
                                        bgcolor: 'background.paper',
                                      },
                                    }}
                                  >
                                    <ArrowBack fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {index < formData.photos.length - 1 && (
                                <Tooltip title="Move right">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMovePhoto(index, 'right')}
                                    sx={{
                                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                                      color: 'text.primary',
                                      '&:hover': {
                                        bgcolor: 'background.paper',
                                      },
                                    }}
                                  >
                                    <ArrowForward fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              <Tooltip title="Delete photo">
                      <IconButton
                        size="small"
                        onClick={() => handlePhotoDelete(index)}
                        sx={{ 
                                    bgcolor: alpha(theme.palette.error.main, 0.9),
                                    color: 'white',
                          '&:hover': {
                                      bgcolor: 'error.main',
                          },
                        }}
                      >
                                  <Delete fontSize="small" />
                      </IconButton>
                              </Tooltip>
                    </Box>
                          </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
              </Box>
            )}
            </FormSection>
          </Box>
        );

      case 4:
        const priceCalculation = calculateTotalPrice(
          formData.basePrice,
          formData.cleaningFee,
          formData.securityDeposit
        );

        const validations = validateFormData(formData);

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

        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Review your listing
            </Typography>
              <Typography variant="body1" color="text.secondary">
                Take a final look at your property details before publishing
            </Typography>
            </Box>

            {/* Validation Overview */}
            <FormSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircle color="primary" />
                Listing Completeness
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight="600">Basic Info</Typography>
                    {renderValidationStatus('basicInfo')}
                  </Box>
                  {validations && !validations?.basicInfo?.isValid && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                      Missing: {validations?.basicInfo?.missingFields?.join(', ')}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight="600">Location</Typography>
                    {renderValidationStatus('location')}
                  </Box>
                  {validations && !validations?.location?.isValid && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                      Missing: {validations?.location?.missingFields?.join(', ')}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight="600">Amenities</Typography>
                    {renderValidationStatus('amenities')}
                  </Box>
                  {validations && !validations?.amenities?.isValid && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                      Missing: {validations?.amenities?.missingFields?.join(', ')}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight="600">Photos</Typography>
                    {renderValidationStatus('photos')}
                  </Box>
                  {validations && !validations?.photos?.isValid && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                      Missing: {validations?.photos?.missingFields?.join(', ')}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </FormSection>

            {/* Price Summary */}
            <FormSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUp color="primary" />
                Price Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2.5, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Nightly Breakdown
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Base price</Typography>
                        <Typography fontWeight="600">${priceCalculation.subtotal}</Typography>
                    </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Cleaning fee</Typography>
                      <Typography>${priceCalculation.cleaning}</Typography>
                    </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Service fee (12%)</Typography>
                      <Typography>${priceCalculation.serviceFee.toFixed(2)}</Typography>
                    </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Tax (8%)</Typography>
                      <Typography>${priceCalculation.tax.toFixed(2)}</Typography>
                    </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight="bold">Total per night</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          ${priceCalculation.total.toFixed(2)}
                        </Typography>
                    </Box>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2.5, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Additional Information
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Security deposit</Typography>
                        <Typography fontWeight="600">${priceCalculation.deposit}</Typography>
                    </Box>
                      <Typography variant="caption" color="text.secondary">
                      Security deposit is refundable after checkout if no damages are reported.
                    </Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </FormSection>

            {/* Guest Preview */}
            <FormSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Preview color="primary" />
                Guest Preview
              </Typography>
              
              <Box sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                bgcolor: 'background.paper',
              }}>
                {/* Cover Photo */}
                  {formData.photos[formData.coverPhotoIndex] && (
                  <Box sx={{ position: 'relative', height: 300 }}>
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
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        p: 3,
                      }}
                    >
                      <Typography variant="h4" color="white" fontWeight="bold">
                    {formData.name}
                  </Typography>
                      <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
                      {formData.location.address}
                    </Typography>
                  </Box>
                  </Box>
                )}

                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Guests
                      </Typography>
                      <Typography variant="h6" fontWeight="600">{formData.maxGuests}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Bedrooms
                      </Typography>
                      <Typography variant="h6" fontWeight="600">{formData.bedrooms}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Beds
                      </Typography>
                      <Typography variant="h6" fontWeight="600">{formData.beds}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Bathrooms
                      </Typography>
                      <Typography variant="h6" fontWeight="600">{formData.bathrooms}</Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    About this space
                  </Typography>
                  <Typography 
                    paragraph 
                    color="text.secondary"
                    dangerouslySetInnerHTML={{ __html: formData.description }}
                  />

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    What this place offers
                  </Typography>
                  <Grid container spacing={2}>
                    {formData.amenities.slice(0, 12).map((amenity) => {
                      const IconComponent = amenityIcons[amenity];
                      return (
                        <Grid item xs={12} sm={6} md={4} key={amenity}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                            <Box sx={{ 
                              p: 0.5, 
                              borderRadius: 1, 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                            }}>
                              {IconComponent ? <IconComponent fontSize="small" /> : <Star fontSize="small" />}
                            </Box>
                            <Typography variant="body2">{amenity}</Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                    {formData.amenities.length > 12 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          + {formData.amenities.length - 12} more amenities
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {formData.houseRules.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        House Rules
                      </Typography>
                      <Stack spacing={1}>
                        {formData.houseRules.map((rule) => (
                          <Typography key={rule} variant="body2" color="text.secondary">
                            • {rule}
                          </Typography>
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              </Box>
            </FormSection>
          </Box>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Step content for step {step + 1}</Typography>
          </Box>
        );
    }
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {success ? 'Property Created Successfully! 🎉' : 'List Your Property'}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              {success 
                ? 'Your property has been submitted and is pending approval' 
                : 'Share your space with travelers from around the world'
              }
            </Typography>
          </Box>

          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4, 
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.2)}`,
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {success ? (
            <Zoom in={success}>
              <StepCard sx={{ p: 6, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      bgcolor: 'success.main',
                      fontSize: '2rem',
                    }}
                  >
                    ✓
                  </Avatar>
                  <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">
        Property Created Successfully!
      </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Your property has been submitted and is pending approval. You'll receive an email notification once it's reviewed.
      </Typography>
                </Box>
      
                <Stack direction="row" spacing={2} justifyContent="center">
        <Button 
          variant="outlined" 
          size="large"
                    startIcon={<TrendingUp />}
          onClick={() => router.push('/dashboard/properties')}
                    sx={{ borderRadius: 3 }}
        >
          View My Properties
        </Button>
        <Button 
          variant="contained" 
          size="large"
                    startIcon={<Home />}
          onClick={() => {
            setSuccess(false);
            resetForm();
          }}
                    sx={{ borderRadius: 3 }}
        >
          Add Another Property
        </Button>
                </Stack>
              </StepCard>
            </Zoom>
          ) : (
            <StepCard sx={{ overflow: 'hidden' }}>
              {/* Progress Bar */}
              <Box sx={{ p: 3, pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="600">
                    Step {activeStep + 1} of {steps.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
                  </Typography>
      </Box>
                <LinearProgress
                  variant="determinate"
                  value={((activeStep + 1) / steps.length) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    },
                  }}
                />
    </Box>

              {/* Enhanced Stepper */}
              <Box sx={{ p: 3 }}>
                <Stepper 
                  activeStep={activeStep} 
                  connector={<StyledStepConnector />}
                  alternativeLabel
                  sx={{ mb: 4 }}
                >
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel 
                        StepIconComponent={StyledStepIcon}
                        sx={{
                          '& .MuiStepLabel-label': {
                            fontSize: '0.9rem',
                            fontWeight: activeStep === index ? 600 : 400,
                            color: activeStep === index ? 'primary.main' : 'text.secondary',
                          },
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={activeStep === index ? 600 : 400}>
                            {step.label}
          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {step.description}
                          </Typography>
                        </Box>
                      </StepLabel>
                  </Step>
                ))}
              </Stepper>

                {/* Step Content with Animation */}
                <Fade in={true} key={activeStep}>
                  <Box>
                {renderStepContent(activeStep)}
                  </Box>
                </Fade>

                {/* Navigation Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 6,
                  pt: 3,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}>
                  <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    startIcon={<ArrowBack />}
                    sx={{ 
                      borderRadius: 3,
                      visibility: activeStep === 0 ? 'hidden' : 'visible',
                    }}
                  >
                      Back
                    </Button>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Step Indicators */}
                    <Stack direction="row" spacing={1}>
                      {steps.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: index <= activeStep ? 'primary.main' : alpha(theme.palette.primary.main, 0.2),
                            transition: 'all 0.3s ease-in-out',
                          }}
                        />
                      ))}
                    </Stack>

                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                        size="large"
                      onClick={handleSubmit}
                      disabled={loading}
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                        sx={{ 
                          borderRadius: 3,
                          minWidth: 160,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          },
                        }}
                      >
                        {loading ? 'Creating...' : 'Create Property'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                        size="large"
                      onClick={handleNext}
                        endIcon={<ArrowForward />}
                        sx={{ 
                          borderRadius: 3,
                          minWidth: 120,
                        }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
              </Box>
            </StepCard>
          )}
      </Container>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 3,
            boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.3)}`,
          }}
          variant="filled"
        >
          Property created successfully!
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
} 