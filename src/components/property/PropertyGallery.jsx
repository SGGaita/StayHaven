'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Box, Container, Grid, IconButton, Modal } from '@mui/material';
import { Close, NavigateNext, NavigateBefore } from '@mui/icons-material';

// Default images from Unsplash (high-quality vacation rental images)
const defaultImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80', // Modern villa
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80', // Living room
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80', // Kitchen
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&q=80', // Bedroom
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80', // Pool
];

export default function PropertyGallery({ photos = [], propertyName }) {
  const [openModal, setOpenModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use provided photos or fall back to default images
  const allPhotos = photos.length >= 5 ? photos : defaultImages;

  const handleOpenModal = (index) => {
    setCurrentImageIndex(index);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Grid container spacing={1}>
            {/* Main Large Image */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 250, md: 400 },
                  cursor: 'pointer',
                  '&:hover': {
                    '& .overlay': {
                      opacity: 1,
                    },
                  },
                }}
                onClick={() => handleOpenModal(0)}
              >
                <Image
                  src={allPhotos[0]}
                  alt={`${propertyName} - Main View`}
                  fill
                  style={{ 
                    objectFit: 'cover',
                    borderRadius: '8px 0 0 8px',
                  }}
                  priority
                />
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0,0,0,0.3)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    borderRadius: '8px 0 0 8px',
                  }}
                />
              </Box>
            </Grid>

            {/* Grid of Smaller Images */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={1}>
                {allPhotos.slice(1, 5).map((photo, index) => (
                  <Grid item xs={6} key={index}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: { xs: 120, md: 198 },
                        cursor: 'pointer',
                        '&:hover': {
                          '& .overlay': {
                            opacity: 1,
                          },
                        },
                        borderRadius: index === 0 || index === 2 ? '0' : '0 8px 0 0',
                      }}
                      onClick={() => handleOpenModal(index + 1)}
                    >
                      <Image
                        src={photo}
                        alt={`${propertyName} - View ${index + 2}`}
                        fill
                        style={{ 
                          objectFit: 'cover',
                          borderRadius: index === 0 ? '0 8px 0 0' : 
                                      index === 1 ? '0 0 0 0' : 
                                      index === 2 ? '0 0 0 8px' : 
                                      '0 0 8px 0',
                        }}
                      />
                      <Box
                        className="overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(0,0,0,0.3)',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          borderRadius: index === 0 ? '0 8px 0 0' : 
                                        index === 1 ? '0 0 0 0' : 
                                        index === 2 ? '0 0 0 8px' : 
                                        '0 0 8px 0',
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Fullscreen Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.9)',
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
              zIndex: 1,
            }}
          >
            <Close />
          </IconButton>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: 'absolute',
                left: 16,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
                zIndex: 1,
              }}
            >
              <NavigateBefore />
            </IconButton>

            <Box
              sx={{
                position: 'relative',
                width: '90%',
                height: '90%',
              }}
            >
              <Image
                src={allPhotos[currentImageIndex]}
                alt={`${propertyName} - View ${currentImageIndex + 1}`}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>

            <IconButton
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: 16,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
                zIndex: 1,
              }}
            >
              <NavigateNext />
            </IconButton>
          </Box>
        </Box>
      </Modal>
    </>
  );
} 