import React, { useState, useEffect, useRef } from 'react'

import { Box } from '@mui/material'

const ImageCarousel = ({
  images = [],
  defaultImage = null, // Default image to show when not hovered
  aspectRatio = { xs: '3 / 2', sm: '16 / 9' },
  objectFit = 'cover',
  objectPosition = 'center',
  transitionDuration = 2000, // 2 seconds between transitions
  onImageClick,
  alt = 'image',
  sx = {}
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef(null)

  // Filter out null/undefined images and ensure we have valid URLs
  const validImages = images.filter(img => img && img.trim() !== '')

  // If no valid images, use fallback
  const displayImages = validImages.length > 0 ? validImages : ['/images/avatars/1.png']

  // Use default image if provided, otherwise use first image from displayImages
  const defaultDisplayImage = defaultImage || displayImages[0]

  useEffect(() => {
    if (isHovered && displayImages.length > 0) {
      // Start cycling through images
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % displayImages.length)
      }, transitionDuration)
    } else {
      // Stop cycling and reset to first image
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setCurrentImageIndex(0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isHovered, displayImages.length, transitionDuration])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleImageClick = e => {
    if (onImageClick) {
      e.stopPropagation()

      // If hovered, use current cycling image, otherwise use default image
      const imageToShow = isHovered ? displayImages[currentImageIndex] : defaultDisplayImage

      onImageClick(imageToShow)
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        flex: '0 0 auto',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        ...sx
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Default image (shows when not hovered) */}
        <Box
          component='img'
          src={defaultDisplayImage}
          alt={alt}
          onClick={handleImageClick}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit,
            objectPosition,
            transition: 'opacity 500ms ease-in-out',
            opacity: isHovered ? 0 : 1,
            cursor: onImageClick ? 'pointer' : 'default'
          }}
        />

        {/* Cycling images (show when hovered) */}
        {displayImages.map((imageSrc, index) => (
          <Box
            key={`${imageSrc}-${index}`}
            component='img'
            src={imageSrc}
            alt={alt}
            onClick={handleImageClick}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit,
              objectPosition,
              transition: 'opacity 500ms ease-in-out',
              opacity: isHovered && index === currentImageIndex ? 1 : 0,
              cursor: onImageClick ? 'pointer' : 'default'
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default ImageCarousel
