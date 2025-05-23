'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Chip,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Star,
  Search,
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { Editor } from '@tinymce/tinymce-react';

// Import property types, amenity categories, etc. from your constants or directly define here
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

const propertyStatuses = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'ARCHIVED', label: 'Archived' },
];

// Define amenity categories (simplified version)
const amenityCategories = {
  essentials: {
    title: 'Essentials',
    items: [
      'Wifi',
      'Air conditioning',
      'Heating',
      'Washer',
      'Dryer',
      'TV',
      'Kitchen',
    ],
  },
  features: {
    title: 'Features',
    items: [
      'Pool',
      'Hot tub',
      'Free parking',
      'Gym',
      'Beach access',
    ],
  },
};

// Define house rules
const houseRules = {
  standard: [
    'No smoking',
    'No parties',
    'No pets',
    'Quiet hours',
  ],
};

const steps = ['Basic Information', 'Location', 'Amenities & Rules', 'Photos', 'Review'];

const PropertyForm = ({ 
  initialData = null, 
  isEditing = false,
  onSubmit,
  onCancel,
  submitting = false,
  error = '',
  success = false 
}) => {
  // Initialize form data with default values or provided initial data
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
    status: 'PENDING',
    ...initialData
  });

  const [activeStep, setActiveStep] = useState(0);
  const [autocomplete, setAutocomplete] = useState(null);
  const [validations, setValidations] = useState(null);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState([]);
  const [photosToUpload, setPhotosToUpload] = useState([]);

  // If editing, set existing photos from initialData
  useEffect(() => {
    if (isEditing && initialData?.photos?.length > 0) {
      setExistingPhotoUrls(initialData.photos);
      
      // Convert existing photos to the format needed for display
      const existingPhotos = initialData.photos.map((url, index) => ({
        preview: url,
        isExisting: true,
        url: url
      }));
      
      setFormData(prev => ({
        ...prev,
        photos: existingPhotos,
        coverPhotoIndex: initialData.coverPhotoIndex || 0
      }));
    }
  }, [isEditing, initialData]);

  // Validate form data when on review step
  useEffect(() => {
    if (activeStep === 4) {
      validateFormData();
    }
  }, [activeStep]);

  const validateFormData = () => {
    const validations = {
      basicInfo: {
        isValid: Boolean(
          formData.name &&
          formData.description &&
          formData.propertyType &&
          formData.basePrice &&
          formData.bedrooms &&
          formData.beds &&
          formData.bathrooms &&
          formData.maxGuests &&
          formData.checkInTime &&
          formData.checkOutTime
        ),
        missingFields: []
      },
      location: {
        isValid: Boolean(
          formData.location.address &&
          formData.location.latitude &&
          formData.location.longitude
        ),
        missingFields: []
      },
      amenities: {
        isValid: formData.amenities.length > 0,
        missingFields: []
      },
      photos: {
        isValid: formData.photos.length > 0,
        missingFields: []
      }
    };

    // Check missing fields
    if (!validations.basicInfo.isValid) {
      // Add missing basic info fields...
      if (!formData.name) validations.basicInfo.missingFields.push('Property Name');
      if (!formData.description) validations.basicInfo.missingFields.push('Description');
      // Add more checks as needed
    }

    if (!validations.location.isValid) {
      if (!formData.location.address) validations.location.missingFields.push('Address');
      if (!formData.location.latitude || !formData.location.longitude) {
        validations.location.missingFields.push('Map Location');
      }
    }

    if (!validations.amenities.isValid) {
      validations.amenities.missingFields.push('At least one amenity');
    }

    if (!validations.photos.isValid) {
      validations.photos.missingFields.push('At least one photo');
    }

    setValidations(validations);
    return validations;
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newPhotos = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));
    
    setPhotosToUpload(prev => [...prev, ...acceptedFiles]);
    
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
      if (status === 'OK' && results[0]) {
        setFormData(prev => ({
          ...prev,
          location: {
            address: results[0].formatted_address,
            latitude: lat,
            longitude: lng,
          }
        }));
      }
    });
  };

  const handlePhotoDelete = (index) => {
    // If it's an existing photo, mark it for deletion
    if (formData.photos[index].isExisting) {
      const photoUrl = formData.photos[index].url;
      // Logic to mark for deletion if needed
    }
    
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      coverPhotoIndex: prev.coverPhotoIndex === index ? 0 : 
                      prev.coverPhotoIndex > index ? prev.coverPhotoIndex - 1 : prev.coverPhotoIndex
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(formData);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Validate form data
      const validations = validateFormData(formData);
      const isFormValid = Object.values(validations).every(v => v.isValid);
      
      if (!isFormValid) {
        setActiveStep(4); // Go to review step
        setValidations(validations);
        throw new Error('Please complete all required fields');
      }
      
      // Create FormData for file upload
      const data = new FormData();
      
      // Add photos (only new ones that have a file property)
      formData.photos
        .filter(photo => photo.file)
        .forEach(photo => {
          data.append('photos', photo.file);
        });
      
      // For existing photos, just include URLs
      const existingPhotos = formData.photos
        .filter(photo => photo.isExisting)
        .map(photo => photo.url);
      
      // Add other form data
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('propertyType', formData.propertyType);
      data.append('price', formData.basePrice.toString());
      data.append('amenities', JSON.stringify(formData.amenities));
      data.append('location', JSON.stringify(formData.location));
      data.append('coverPhotoIndex', formData.coverPhotoIndex.toString());
      data.append('existingPhotos', JSON.stringify(existingPhotos));
      data.append('photosToDelete', JSON.stringify(formData.photosToDelete || []));
      
      // Add property details
      data.append('bedrooms', formData.bedrooms.toString());
      data.append('beds', formData.beds.toString());
      data.append('bathrooms', formData.bathrooms.toString());
      data.append('maxGuests', formData.maxGuests.toString());
      data.append('houseRules', JSON.stringify(formData.houseRules));
      data.append('customRules', JSON.stringify(formData.customRules));
      
      // Set API endpoint and method based on editing mode
      const url = isEditing 
        ? `/api/properties/${initialData.id}`
        : '/api/properties';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Get current user
      const user = JSON.parse(localStorage.getItem('auth') || '{}')?.user;
      
      // Submit data with auth headers
      const response = await fetch(url, {
        method,
        body: data,
        headers: {
          'Authorization': `Bearer ${user?.id || ''}`,
          'X-User-Role': user?.role || ''
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save property');
      }
      
      const result = await response.json();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
      
      setSubmitting(false);
      return result;
    } catch (error) {
      setSubmitting(false);
      setError(error.message);
      throw error;
    }
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
            {isEditing && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  {propertyStatuses.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
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
          </Grid>
        );

      case 1: // Location
        return (
          <Box sx={{ height: 500, width: '100%' }}>
            <LoadScript
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              libraries={['places']}
            >
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  onLoad={setAutocomplete}
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

      case 2: // Amenities & Rules
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
                    {items.map((amenity) => (
                      <Grid item xs={12} sm={6} md={4} key={amenity}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.amenities.includes(amenity)}
                              onChange={() => handleAmenityToggle(amenity)}
                            />
                          }
                          label={amenity}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Box>
            ))}

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              House Rules
            </Typography>
            <FormGroup>
              {houseRules.standard.map((rule) => (
                <FormControlLabel
                  key={rule}
                  control={
                    <Checkbox
                      checked={formData.houseRules.includes(rule)}
                      onChange={() => handleRuleToggle(rule)}
                    />
                  }
                  label={rule}
                />
              ))}
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
          </Box>
        );

      case 3: // Photos
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Property Photos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload photos of your property. Click the star icon to set your cover photo.
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
                  <Paper
                    sx={{
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden',
                      height: 200,
                      border: index === formData.coverPhotoIndex ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Box 
                      component="img" 
                      src={photo.preview} 
                      alt={`Property photo ${index + 1}`}
                      sx={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                    
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      p: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <Button
                        startIcon={<Star />}
                        size="small"
                        onClick={() => handleSetCover(index)}
                        sx={{
                          minWidth: 'auto',
                          px: 1,
                          color: index === formData.coverPhotoIndex ? 'warning.light' : 'white',
                        }}
                      >
                        {index === formData.coverPhotoIndex ? 'Cover' : 'Set as cover'}
                      </Button>
                      <Button
                        startIcon={<Delete />}
                        size="small"
                        onClick={() => handlePhotoDelete(index)}
                        sx={{
                          minWidth: 'auto',
                          px: 1,
                          color: 'error.light',
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
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

      case 4: // Review
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review your property listing
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review all the information before {isEditing ? 'updating' : 'creating'} your listing.
            </Typography>

            {/* Basic Information Summary */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Name</Typography>
                  <Typography variant="body2">{formData.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Property Type</Typography>
                  <Typography variant="body2">{formData.propertyType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Price per Night</Typography>
                  <Typography variant="body2">${formData.basePrice}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Typography variant="body2">{formData.status}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Location Summary */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Location
              </Typography>
              <Typography variant="body2">{formData.location.address}</Typography>
            </Paper>

            {/* Amenities Summary */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.amenities.map((amenity) => (
                  <Chip key={amenity} label={amenity} size="small" />
                ))}
              </Box>
            </Paper>

            {/* Photos Summary */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Photos
              </Typography>
              <Typography variant="body2">
                {formData.photos.length} photos uploaded
                {formData.coverPhotoIndex !== undefined && 
                  ` (Cover photo: ${formData.coverPhotoIndex + 1})`}
              </Typography>
            </Paper>
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

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack}>
                Back
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
              >
                {submitting ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
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
    </Box>
  );
};

export default PropertyForm; 