'use client';

import { useState, useEffect } from 'react';
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
  CardMedia,
  IconButton,
  Skeleton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Hotel as HotelIcon,
  Star as StarIcon,
  Favorite,
  FavoriteBorder,
  Share as ShareIcon,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  BrokenImage,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import LoginModal from '@/components/auth/LoginModal';

const MotionCard = motion(Card);

// Fallback to a colored background if no image is available
const defaultImage = '/images/properties/villa-1.jpg';

export default function PropertyCard({ property, variant = 'default', isLoggedIn = false }) {
  const router = useRouter();
  const [imageLoading, setImageLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    id,
    name = 'Untitled Property',
    location = 'Location not specified',
    propertyType = 'Property',
    price = 0,
    photos = [],
    coverPhotoIndex = 0,
    amenities = [],
    avgRating = 0,
    reviewCount = 0,
    status,
  } = property;

  // Process amenities to handle both new and old formats
  const amenitiesList = typeof amenities === 'object' && amenities.items ? amenities.items : amenities;

  useEffect(() => {
    // Reset states when property changes
    setImageLoading(true);
    setIsImageError(false);
    
    // Use the cover photo index to get the selected image
    const imageUrl = photos && photos.length > 0 
      ? photos[coverPhotoIndex] || photos[0] || defaultImage
      : defaultImage;
    setCurrentImageUrl(imageUrl);
    
    // Preload image using window.Image to avoid conflicts
    if (typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        setImageLoading(false);
      };
      img.onerror = () => {
        console.error('Failed to load image:', imageUrl);
        setIsImageError(true);
        setImageLoading(false);
      };
    }
  }, [photos, coverPhotoIndex]);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setIsFavorite(!isFavorite);
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    setShareAnchorEl(e.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShare = (platform) => {
    const url = `${window.location.origin}/properties/${id}`;
    const text = `Check out this amazing property: ${name}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    };

    window.open(shareUrls[platform], '_blank');
    handleShareClose();
  };

  const handleViewDetails = () => {
    router.push(`/properties/${id}`);
  };

  const isCompact = variant === 'compact';

  return (
    <Link href={`/properties/${id}`} style={{ textDecoration: 'none' }}>
      <MotionCard
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut'
        }}
        sx={{
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
            '& .property-image': {
              transform: 'scale(1.03)',
            },
          },
        }}
      >
        <Box 
          sx={{ 
            position: 'relative',
            height: 240,
            width: '100%',
            bgcolor: 'grey.100',
            flexShrink: 0, // Prevent image from shrinking
          }}
        >
          {imageLoading && (
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height="100%"
              animation="wave"
            />
          )}
          
          {isImageError ? (
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200',
              }}
            >
              <BrokenImage sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Image not available
              </Typography>
            </Box>
          ) : (
            <Image
              src={currentImageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="property-image"
              style={{
                objectFit: 'cover',
                display: imageLoading ? 'none' : 'block',
                transition: 'transform 0.3s ease-in-out',
              }}
              priority
            />
          )}

          <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton
              onClick={handleFavoriteClick}
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(2px)',
                zIndex: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
              }}
            >
              {isFavorite ? (
                <Favorite sx={{ color: 'error.main' }} />
              ) : (
                <FavoriteBorder sx={{ color: 'grey.600' }} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton
              onClick={handleShareClick}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(2px)',
                zIndex: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
              }}
            >
              <ShareIcon sx={{ color: 'grey.600' }} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={shareAnchorEl}
            open={Boolean(shareAnchorEl)}
            onClose={handleShareClose}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuItem 
              onClick={() => handleShare('facebook')} 
              sx={{ 
                gap: 1,
                '&:hover': {
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              <Facebook sx={{ color: 'primary.main' }} /> 
              <Typography variant="body2" color="text.primary">Facebook</Typography>
            </MenuItem>
            <MenuItem 
              onClick={() => handleShare('twitter')} 
              sx={{ 
                gap: 1,
                '&:hover': {
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              <Twitter sx={{ color: 'primary.main' }} /> 
              <Typography variant="body2" color="text.primary">Twitter</Typography>
            </MenuItem>
            <MenuItem 
              onClick={() => handleShare('linkedin')} 
              sx={{ 
                gap: 1,
                '&:hover': {
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              <LinkedIn sx={{ color: 'primary.main' }} /> 
              <Typography variant="body2" color="text.primary">LinkedIn</Typography>
            </MenuItem>
            <MenuItem 
              onClick={() => handleShare('whatsapp')} 
              sx={{ 
                gap: 1,
                '&:hover': {
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              <WhatsApp sx={{ color: 'primary.main' }} /> 
              <Typography variant="body2" color="text.primary">WhatsApp</Typography>
            </MenuItem>
          </Menu>

          {!isImageError && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                height: '60%',
                zIndex: 0,
              }}
            />
          )}
        </Box>

        <CardContent 
          sx={{ 
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1, // Allow content to grow
            '& > *': { mb: 2 }, // Add margin bottom to all direct children
            '& > *:last-child': { mb: 0 }, // Remove margin from last child
          }}
        >
          {/* Property Title Section - Fixed Height */}
          <Box sx={{ height: 64 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                color: 'text.primary',
                mb: 1,
              }}
            >
              {name}
            </Typography>
          </Box>

          {/* Location Section - Fixed Height */}
          <Box sx={{ height: 24 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <LocationIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {location}
              </Typography>
            </Box>
          </Box>

          {/* Property Type and Rating Section - Fixed Height */}
          <Box sx={{ height: 24, display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
            <Chip
              icon={<HotelIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
              label={propertyType}
              size="small"
              sx={{ 
                borderRadius: 1,
                height: 24,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                fontWeight: 400,
              }}
            />
            {avgRating > 0 ? (
              <Chip
                icon={<StarIcon sx={{ fontSize: 16 }} />}
                label={`${avgRating.toFixed(1)} (${reviewCount})`}
                size="small"
                sx={{ 
                  borderRadius: 1,
                  height: 24,
                  bgcolor: 'rgba(255, 180, 0, 0.1)',
                  color: '#FFB400',
                  fontWeight: 400,
                }}
              />
            ) : (
              <Chip
                label="No ratings yet"
                size="small"
                sx={{ 
                  borderRadius: 1,
                  height: 24,
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                  fontWeight: 400,
                }}
              />
            )}
          </Box>

          {/* Amenities Section - Fixed Height */}
          <Box sx={{ height: 24, display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'hidden' }}>
            {amenitiesList.length > 0 ? (
              <>
                {amenitiesList.slice(0, 2).map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1,
                      height: 24,
                      borderColor: 'primary.lighter',
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                      },
                    }}
                  />
                ))}
                {amenitiesList.length > 2 && (
                  <Chip
                    label={`+${amenitiesList.length - 2} more`}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1,
                      height: 24,
                      borderColor: 'primary.lighter',
                      color: 'text.secondary',
                    }}
                  />
                )}
              </>
            ) : (
              <Chip
                label="No amenities listed"
                size="small"
                variant="outlined"
                sx={{ 
                  borderRadius: 1,
                  height: 24,
                  borderColor: 'grey.200',
                  color: 'text.secondary',
                }}
              />
            )}
          </Box>

          {/* Price and Action Section - Fixed Height */}
          <Box 
            sx={{ 
              height: 48,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 'auto', // Push to bottom
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              ${price.toLocaleString()}
              <Typography 
                component="span" 
                variant="body2" 
                color="text.secondary" 
                sx={{ ml: 0.5 }}
              >
                /night
              </Typography>
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                px: 2,
                py: 0.5,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.lighter',
                  borderColor: 'primary.dark',
                  color: 'primary.dark',
                },
              }}
            >
              View Details
            </Button>
          </Box>
        </CardContent>

        <LoginModal 
          open={showLoginModal} 
          onClose={handleLoginModalClose}
        />
      </MotionCard>
    </Link>
  );
} 