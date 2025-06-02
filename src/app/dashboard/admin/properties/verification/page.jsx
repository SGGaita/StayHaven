'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Rating,
  Snackbar,
  Stack,
  Tooltip,
  Container,
  useTheme,
  alpha,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  IconButton,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  PhotoLibrary as PhotoIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const verificationSteps = [
  {
    id: 'basic_info',
    label: 'Basic Information',
    description: 'Property name, type, location, and description',
    icon: <InfoIcon />,
  },
  {
    id: 'photos',
    label: 'Photos & Media',
    description: 'Property images, virtual tours, and media quality',
    icon: <PhotoIcon />,
  },
  {
    id: 'amenities',
    label: 'Amenities & Features',
    description: 'Listed amenities, features, and accuracy verification',
    icon: <HomeIcon />,
  },
  {
    id: 'pricing',
    label: 'Pricing & Policies',
    description: 'Pricing structure, cancellation, and house rules',
    icon: <MoneyIcon />,
  },
  {
    id: 'legal',
    label: 'Legal & Compliance',
    description: 'Permits, licenses, and regulatory compliance',
    icon: <GavelIcon />,
  },
  {
    id: 'safety',
    label: 'Safety & Security',
    description: 'Safety features, emergency procedures, and security',
    icon: <SecurityIcon />,
  },
];

const verificationCriteria = {
  basic_info: [
    { id: 'property_name', label: 'Property name is descriptive and accurate', required: true },
    { id: 'property_type', label: 'Property type matches actual property', required: true },
    { id: 'location_accurate', label: 'Location and address are accurate', required: true },
    { id: 'description_complete', label: 'Description is complete and honest', required: true },
    { id: 'contact_info', label: 'Contact information is valid', required: true },
  ],
  photos: [
    { id: 'photo_quality', label: 'Photos are high quality and well-lit', required: true },
    { id: 'photo_accuracy', label: 'Photos accurately represent the property', required: true },
    { id: 'photo_coverage', label: 'All main areas are photographed', required: true },
    { id: 'photo_recent', label: 'Photos appear recent and current', required: false },
    { id: 'virtual_tour', label: 'Virtual tour is available (if applicable)', required: false },
  ],
  amenities: [
    { id: 'amenities_accurate', label: 'Listed amenities are present and functional', required: true },
    { id: 'capacity_accurate', label: 'Guest capacity matches actual accommodation', required: true },
    { id: 'accessibility', label: 'Accessibility features are accurately described', required: false },
    { id: 'special_features', label: 'Special features are verified', required: false },
  ],
  pricing: [
    { id: 'pricing_reasonable', label: 'Pricing is reasonable for the market', required: true },
    { id: 'pricing_transparent', label: 'All fees and charges are clearly stated', required: true },
    { id: 'cancellation_policy', label: 'Cancellation policy is fair and clear', required: true },
    { id: 'house_rules', label: 'House rules are reasonable and legal', required: true },
  ],
  legal: [
    { id: 'business_license', label: 'Valid business license (if required)', required: true },
    { id: 'rental_permit', label: 'Short-term rental permit (if required)', required: true },
    { id: 'tax_compliance', label: 'Tax registration and compliance', required: true },
    { id: 'insurance', label: 'Adequate insurance coverage', required: true },
    { id: 'zoning_compliance', label: 'Complies with local zoning laws', required: true },
  ],
  safety: [
    { id: 'smoke_detectors', label: 'Smoke detectors installed and functional', required: true },
    { id: 'carbon_monoxide', label: 'Carbon monoxide detectors (if applicable)', required: true },
    { id: 'fire_extinguisher', label: 'Fire extinguisher available', required: true },
    { id: 'emergency_exits', label: 'Clear emergency exits and procedures', required: true },
    { id: 'first_aid', label: 'First aid kit available', required: false },
    { id: 'security_measures', label: 'Adequate security measures in place', required: false },
  ],
};

const statusConfig = {
  PENDING: { 
    color: 'warning', 
    icon: <PendingIcon />, 
    label: 'Pending Verification',
    description: 'Awaiting verification review'
  },
  IN_REVIEW: { 
    color: 'info', 
    icon: <AssignmentIcon />, 
    label: 'Under Review',
    description: 'Currently being verified'
  },
  VERIFIED: { 
    color: 'success', 
    icon: <VerifiedIcon />, 
    label: 'Verified',
    description: 'Successfully verified'
  },
  REJECTED: { 
    color: 'error', 
    icon: <ErrorIcon />, 
    label: 'Rejected',
    description: 'Verification failed'
  },
  NEEDS_REVISION: { 
    color: 'warning', 
    icon: <WarningIcon />, 
    label: 'Needs Revision',
    description: 'Requires updates'
  },
};

// Statistics Card Component
const StatCard = ({ title, value, icon, color, trend, description, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: theme.palette.background.paper,
        border: '1px solid',
        borderColor: alpha('#FF385C', 0.1),
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: '#FF385C',
          opacity: 0.8,
        },
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha('#FF385C', 0.15)}`,
          borderColor: alpha('#FF385C', 0.3),
          '& .stat-icon': {
            transform: 'scale(1.05)',
          },
          '& .stat-value': {
            color: '#FF385C',
          },
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{ 
                  mb: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h4" 
                component="div" 
                className="stat-value"
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  transition: 'all 0.3s ease-in-out',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {value}
              </Typography>
              {description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.7rem',
                    opacity: 0.8,
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
            <Avatar 
              className="stat-icon"
              sx={{ 
                width: 48,
                height: 48,
                background: alpha('#FF385C', 0.1),
                color: '#FF385C',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `2px solid ${alpha('#FF385C', 0.1)}`,
              }}
            >
              {icon}
            </Avatar>
          </Box>
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                icon={<TrendingUpIcon fontSize="small" />}
                label={trend}
                color="success"
                sx={{ 
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                vs last month
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Property Verification Card Component
const PropertyVerificationCard = ({ property, onVerify, onReject, onViewDetails }) => {
  const theme = useTheme();
  const statusInfo = statusConfig[property.verificationStatus] || statusConfig.PENDING;
  
  const getVerificationProgress = () => {
    if (!property.verificationChecks) return 0;
    const totalChecks = Object.values(verificationCriteria).flat().length;
    const completedChecks = Object.values(property.verificationChecks).filter(Boolean).length;
    return Math.round((completedChecks / totalChecks) * 100);
  };

  const progress = getVerificationProgress();

  return (
    <Card 
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha('#FF385C', 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha('#FF385C', 0.15)}`,
          borderColor: alpha('#FF385C', 0.3),
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={property.photos?.[0] || '/placeholder-property.jpg'}
          alt={property.name}
          sx={{ 
            borderRadius: '12px 12px 0 0',
            objectFit: 'cover',
          }}
        />
        <Box sx={{ 
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 1,
        }}>
          <Chip
            icon={statusInfo.icon}
            label={statusInfo.label}
            size="small"
            color={statusInfo.color}
            sx={{ 
              fontWeight: 600,
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(8px)',
            }}
          />
        </Box>
        <Box sx={{ 
          position: 'absolute',
          bottom: 12,
          left: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
        }}>
          <AssignmentIcon fontSize="small" />
          <Typography variant="caption" fontWeight="medium">
            {progress}% Complete
          </Typography>
        </Box>
      </Box>
      
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                cursor: 'pointer',
                '&:hover': { color: '#FF385C' },
                transition: 'color 0.2s ease-in-out',
              }}
              onClick={() => onViewDetails(property)}
            >
              {property.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {property.location}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography 
                variant="body2" 
                color="primary"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {`${property.manager?.firstName || 'Unknown'} ${property.manager?.lastName || 'Manager'}`}
              </Typography>
            </Box>
          </Box>
          
          {/* Verification Progress */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Verification Progress
              </Typography>
              <Typography variant="caption" fontWeight="bold" color="primary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha('#FF385C', 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress === 100 ? theme.palette.success.main : '#FF385C',
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {/* Submission Date */}
          {property.submittedAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Submitted {new Date(property.submittedAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
      
      <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onViewDetails(property)}
              sx={{
                backgroundColor: alpha('#FF385C', 0.1),
                color: '#FF385C',
                '&:hover': {
                  backgroundColor: alpha('#FF385C', 0.2),
                },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {property.verificationStatus === 'PENDING' && (
            <>
              <Tooltip title="Approve Verification">
                <IconButton
                  size="small"
                  onClick={() => onVerify(property)}
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.success.main, 0.2),
                    },
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject Verification">
                <IconButton
                  size="small"
                  onClick={() => onReject(property)}
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.2),
                    },
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

// Verification Detail Dialog
const VerificationDetailDialog = ({ open, property, onClose, onVerify, onReject }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [verificationChecks, setVerificationChecks] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (property?.verificationChecks) {
      setVerificationChecks(property.verificationChecks);
    }
  }, [property]);

  if (!property) return null;

  const handleCheckChange = (stepId, checkId, checked) => {
    setVerificationChecks(prev => ({
      ...prev,
      [`${stepId}_${checkId}`]: checked
    }));
  };

  const getStepCompletion = (stepId) => {
    const stepCriteria = verificationCriteria[stepId] || [];
    const completedChecks = stepCriteria.filter(criteria => 
      verificationChecks[`${stepId}_${criteria.id}`]
    ).length;
    return stepCriteria.length > 0 ? (completedChecks / stepCriteria.length) * 100 : 0;
  };

  const isStepComplete = (stepId) => {
    const stepCriteria = verificationCriteria[stepId] || [];
    const requiredCriteria = stepCriteria.filter(c => c.required);
    return requiredCriteria.every(criteria => 
      verificationChecks[`${stepId}_${criteria.id}`]
    );
  };

  const canVerify = verificationSteps.every(step => isStepComplete(step.id));

  return (
    <Dialog 
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme.palette.background.paper,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
        borderBottom: `1px solid ${alpha('#FF385C', 0.1)}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={property.photos?.[0]}
              variant="rounded"
              sx={{ 
                width: 56, 
                height: 56,
                borderRadius: 2,
                border: `2px solid ${alpha('#FF385C', 0.1)}`,
              }}
            >
              <HomeIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Property Verification
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {property.name} • {property.location}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Grid container sx={{ height: '70vh' }}>
          {/* Verification Steps Sidebar */}
          <Grid item xs={12} md={4} sx={{ 
            borderRight: `1px solid ${alpha('#FF385C', 0.1)}`,
            background: alpha('#FF385C', 0.01),
          }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Verification Steps
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {verificationSteps.map((step, index) => {
                  const completion = getStepCompletion(step.id);
                  const isComplete = isStepComplete(step.id);
                  
                  return (
                    <Step key={step.id} completed={isComplete}>
                      <StepLabel 
                        onClick={() => setActiveStep(index)}
                        sx={{ 
                          cursor: 'pointer',
                          '& .MuiStepLabel-label': {
                            fontWeight: activeStep === index ? 'bold' : 'normal',
                          },
                        }}
                        icon={
                          <Badge 
                            badgeContent={`${Math.round(completion)}%`}
                            color={isComplete ? 'success' : 'primary'}
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.6rem',
                                height: 16,
                                minWidth: 16,
                              },
                            }}
                          >
                            {step.icon}
                          </Badge>
                        }
                      >
                        <Typography variant="subtitle2" fontWeight="medium">
                          {step.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {step.description}
                        </Typography>
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Box>
          </Grid>

          {/* Verification Content */}
          <Grid item xs={12} md={8}>
            <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
              {verificationSteps[activeStep] && (
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {verificationSteps[activeStep].label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {verificationSteps[activeStep].description}
                  </Typography>

                  {/* Verification Criteria */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      border: `1px solid ${alpha('#FF385C', 0.1)}`,
                      background: alpha('#FF385C', 0.01),
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Verification Criteria
                    </Typography>
                    <FormGroup>
                      {(verificationCriteria[verificationSteps[activeStep].id] || []).map((criteria) => (
                        <FormControlLabel
                          key={criteria.id}
                          control={
                            <Checkbox
                              checked={verificationChecks[`${verificationSteps[activeStep].id}_${criteria.id}`] || false}
                              onChange={(e) => handleCheckChange(
                                verificationSteps[activeStep].id,
                                criteria.id,
                                e.target.checked
                              )}
                              color="primary"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {criteria.label}
                              </Typography>
                              {criteria.required && (
                                <Chip 
                                  label="Required" 
                                  size="small" 
                                  color="error" 
                                  sx={{ height: 20, fontSize: '0.6rem' }}
                                />
                              )}
                            </Box>
                          }
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </FormGroup>
                  </Paper>

                  {/* Property Information for Current Step */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      mt: 3,
                      borderRadius: 2,
                      border: `1px solid ${alpha('#FF385C', 0.1)}`,
                      background: alpha('#FF385C', 0.01),
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Property Information
                    </Typography>
                    {/* Add step-specific property information here */}
                    <Typography variant="body2" color="text.secondary">
                      Review the property details relevant to this verification step.
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        gap: 1,
        borderTop: `1px solid ${alpha('#FF385C', 0.1)}`,
        background: alpha('#FF385C', 0.01),
      }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Add verification notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="small"
            sx={{ borderRadius: 2 }}
          />
        </Box>
        <Button
          onClick={onClose}
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => onReject(property, rejectionReason)}
          sx={{ borderRadius: 2 }}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          onClick={() => onVerify(property, notes)}
          disabled={!canVerify}
          sx={{
            borderRadius: 2,
            background: '#FF385C',
            '&:hover': {
              background: '#E61E4D',
            },
          }}
        >
          {canVerify ? 'Approve Verification' : 'Complete All Required Checks'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function PropertyVerification() {
  const theme = useTheme();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    inReview: 0,
    verified: 0,
    rejected: 0,
    needsRevision: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, [searchQuery, filterStatus]);

  const fetchProperties = async () => {
    try {
      setError(null);
      // Mock data for now - replace with actual API call
      const mockProperties = [
        {
          id: 1,
          name: 'Luxury Downtown Apartment',
          location: 'New York, NY',
          photos: ['/placeholder-property.jpg'],
          manager: { firstName: 'John', lastName: 'Doe' },
          verificationStatus: 'PENDING',
          submittedAt: '2024-01-15',
          verificationChecks: {},
        },
        {
          id: 2,
          name: 'Cozy Beach House',
          location: 'Miami, FL',
          photos: ['/placeholder-property.jpg'],
          manager: { firstName: 'Jane', lastName: 'Smith' },
          verificationStatus: 'IN_REVIEW',
          submittedAt: '2024-01-14',
          verificationChecks: {
            'basic_info_property_name': true,
            'basic_info_property_type': true,
          },
        },
      ];
      
      setProperties(mockProperties);
    } catch (err) {
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats for now - replace with actual API call
      setStats({
        pending: 12,
        inReview: 8,
        verified: 156,
        rejected: 3,
        needsRevision: 5,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setVerificationDialogOpen(true);
  };

  const handleVerifyProperty = async (property, notes) => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Verifying property:', property.id, 'Notes:', notes);
      
      await fetchProperties();
      await fetchStats();
      setVerificationDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Property verified successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to verify property',
        severity: 'error'
      });
    }
  };

  const handleRejectProperty = async (property, reason) => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Rejecting property:', property.id, 'Reason:', reason);
      
      await fetchProperties();
      await fetchStats();
      setVerificationDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Property verification rejected',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to reject property',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={500} height={24} />
          </Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[...Array(5)].map((_, index) => (
              <Grid item xs={12} sm={6} lg={2.4} key={index}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#FF385C' }}>
            Property Verification 🔍
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and verify property listings to ensure quality and compliance
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard
              title="Pending Review"
              value={stats.pending.toLocaleString()}
              icon={<PendingIcon />}
              description="Awaiting verification"
              trend="+3"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard
              title="In Review"
              value={stats.inReview.toLocaleString()}
              icon={<AssignmentIcon />}
              description="Currently reviewing"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard
              title="Verified"
              value={stats.verified.toLocaleString()}
              icon={<VerifiedIcon />}
              description="Successfully verified"
              trend="+12"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard
              title="Needs Revision"
              value={stats.needsRevision.toLocaleString()}
              icon={<WarningIcon />}
              description="Requires updates"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard
              title="Rejected"
              value={stats.rejected.toLocaleString()}
              icon={<ErrorIcon />}
              description="Verification failed"
            />
          </Grid>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchProperties}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Filters and Search */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha('#FF385C', 0.1)}`,
            background: alpha('#FF385C', 0.01),
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search properties for verification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Verification Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Verification Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_REVIEW">In Review</MenuItem>
                  <MenuItem value="VERIFIED">Verified</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="NEEDS_REVISION">Needs Revision</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title="Refresh">
                  <IconButton 
                    onClick={fetchProperties}
                    sx={{
                      backgroundColor: alpha('#FF385C', 0.1),
                      color: '#FF385C',
                      '&:hover': {
                        backgroundColor: alpha('#FF385C', 0.2),
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton 
                    sx={{
                      backgroundColor: alpha('#FF385C', 0.1),
                      color: '#FF385C',
                      '&:hover': {
                        backgroundColor: alpha('#FF385C', 0.2),
                      },
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Properties Grid */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha('#FF385C', 0.1)}`,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
            borderBottom: `1px solid ${alpha('#FF385C', 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Properties for Verification ({properties.length.toLocaleString()})
              </Typography>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {properties.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
                borderRadius: 3,
                border: `2px dashed ${alpha('#FF385C', 0.2)}`,
              }}>
                <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No properties pending verification
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All properties are up to date with verification
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {properties.map((property) => (
                  <Grid item xs={12} sm={6} md={4} key={property.id}>
                    <PropertyVerificationCard
                      property={property}
                      onVerify={handleVerifyProperty}
                      onReject={handleRejectProperty}
                      onViewDetails={handleViewDetails}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Paper>

        {/* Verification Detail Dialog */}
        <VerificationDetailDialog
          open={verificationDialogOpen}
          property={selectedProperty}
          onClose={() => setVerificationDialogOpen(false)}
          onVerify={handleVerifyProperty}
          onReject={handleRejectProperty}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
} 