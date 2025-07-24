'use client';

import { useState, useEffect, useRef } from 'react';
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

const MotionCard = motion.create(Card);

// Use a placeholder image URL that will always work
const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

export default function PropertyCard({ property, variant = 'default', isLoggedIn = false }) {
  const router = useRouter();
  const [imageLoading, setImageLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const imageRef = useRef(null);

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

  // Calculate the image URL immediately, not in useEffect
  const imageUrl = photos && photos.length > 0 
    ? photos[coverPhotoIndex] || photos[0] || defaultImage
    : defaultImage;

  // Validate the URL to ensure it's not empty or just the domain
  const validImageUrl = imageUrl && imageUrl.trim() && imageUrl !== 'http://localhost:3000/' ? imageUrl : defaultImage;

  useEffect(() => {
    // Cleanup previous image loader
    if (imageRef.current) {
      imageRef.current.onload = null;
      imageRef.current.onerror = null;
      imageRef.current = null;
    }

    // Reset states when property changes
    setImageLoading(true);
    setIsImageError(false);
    
    // Preload image using window.Image to avoid conflicts
    if (typeof window !== 'undefined' && validImageUrl) {
      imageRef.current = new window.Image();
      imageRef.current.onload = () => {
        setImageLoading(false);
      };
      imageRef.current.onerror = () => {
        console.error('Failed to load image:', validImageUrl);
        setIsImageError(true);
        setImageLoading(false);
      };
      imageRef.current.src = validImageUrl;
    }
    
    // Cleanup on unmount
    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null;
        imageRef.current.onerror = null;
        imageRef.current = null;
      }
    };
  }, [validImageUrl, property.id]); // Use validImageUrl and property.id for dependencies

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
        whileHover={{ y: -3 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut'
        }}
        sx={{
          height: 280, // Square aspect ratio for 4-per-row layout
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
            '& .overlay-content': {
              transform: 'translateY(-4px)',
            },
          },
        }}
      >
        {/* Full Image Background */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'grey.100',
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
              <BrokenImage sx={{ fontSize: 36, color: 'grey.400', mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                Image not available
              </Typography>
            </Box>
          ) : validImageUrl ? (
            <Image
              src={validImageUrl}
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
          ) : null}

          {/* Dark gradient overlay for text readability */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
              height: '70%',
              zIndex: 1,
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
          <IconButton
            onClick={handleFavoriteClick}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              zIndex: 2,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            {isFavorite ? (
              <Favorite sx={{ color: 'error.main', fontSize: 18 }} />
            ) : (
              <FavoriteBorder sx={{ color: 'grey.600', fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Share">
          <IconButton
            onClick={handleShareClick}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              zIndex: 2,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            <ShareIcon sx={{ color: 'grey.600', fontSize: 18 }} />
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

        {/* Overlaid Content */}
        <Box
          className="overlay-content"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2.5,
            zIndex: 2,
            color: 'white',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          {/* Property Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              color: 'white',
              mb: 1,
              lineHeight: 1.3,
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {name}
          </Typography>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'rgba(255,255,255,0.9)' }} />
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {location}
            </Typography>
          </Box>

          {/* Property Type and Rating */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              icon={<HotelIcon sx={{ fontSize: 14 }} />}
              label={propertyType}
              size="small"
              sx={{ 
                borderRadius: 1,
                height: 24,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontWeight: 500,
                fontSize: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '& .MuiChip-icon': { color: 'rgba(255,255,255,0.8)' },
              }}
            />
            {avgRating > 0 ? (
              <Chip
                icon={<StarIcon sx={{ fontSize: 14, color: '#FFD700' }} />}
                label={`${avgRating.toFixed(1)} (${reviewCount})`}
                size="small"
                sx={{ 
                  borderRadius: 1,
                  height: 24,
                  bgcolor: 'rgba(255, 215, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFD700',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                }}
              />
            ) : (
              <Chip
                label="No ratings"
                size="small"
                sx={{ 
                  borderRadius: 1,
                  height: 24,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 400,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
            )}
          </Box>

          {/* Amenities Section - Reduced Height and Simplified */}
          <Box sx={{ height: 20, display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'hidden' }}>
            {amenitiesList.length > 0 ? (
              <>
                <Chip
                  label={amenitiesList[0]}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1,
                    height: 20, // Reduced from 24
                    borderColor: 'primary.lighter',
                    color: 'text.secondary',
                    fontSize: '0.7rem', // Made smaller
                    '& .MuiChip-label': { px: 1 }, // Reduced padding
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                    },
                  }}
                />
                {amenitiesList.length > 1 && (
                  <Chip
                    label={`+${amenitiesList.length - 1} more`}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1,
                      height: 20, // Reduced from 24
                      borderColor: 'primary.lighter',
                      color: 'text.secondary',
                      fontSize: '0.7rem', // Made smaller
                      '& .MuiChip-label': { px: 1 }, // Reduced padding
                    }}
                  />
                )}
              </>
            ) : (
              <Chip
                label="No amenities"
                size="small"
                variant="outlined"
                sx={{ 
                  borderRadius: 1,
                  height: 20, // Reduced from 24
                  borderColor: 'grey.200',
                  color: 'text.secondary',
                  fontSize: '0.7rem', // Made smaller
                  '& .MuiChip-label': { px: 1 }, // Reduced padding
                }}
              />
            )}
          </Box>

          {/* Price and Action */}
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                display: 'flex',
                alignItems: 'baseline',
                fontSize: '1.2rem',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              ${price.toLocaleString()}
              <Typography 
                component="span" 
                variant="body2" 
                sx={{ 
                  ml: 0.5,
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.85rem',
                }}
              >
                /night
              </Typography>
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 2,
                py: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                color: 'primary.main',
                fontSize: '0.8rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                },
              }}
            >
              View Details
            </Button>
          </Box>
        </Box>

        <LoginModal 
          open={showLoginModal} 
          onClose={handleLoginModalClose}
        />
      </MotionCard>
    </Link>
  );
} 