'use client'

import { useState } from 'react'

import { Card, Box, Typography, Button, Avatar, Divider, IconButton, Tooltip } from '@mui/material'
import { styled } from '@mui/system'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import Info from '@mui/icons-material/Info'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DownloadIcon from '@mui/icons-material/Download'

import FullScreenImageModal from '@/components/FullScreenImageModal'

import { useTranslation } from '@/translations/useTranslation'
import { getBackendImgUrl2 } from '@/configs/routes'
import { commonStyles } from '@/@core/styles/commonStyles'
import { useSettings } from '@core/hooks/useSettings'

const StyledReportCard = styled(Card)(({ theme, mode }) => ({
  ...commonStyles.transparentCard,
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  width: '100%',
  maxWidth: '100%',
  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.12)'}`,
  boxShadow: mode === 'dark' ? '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)' : theme.shadows[1],
  transition: 'all 0.2s ease-in-out',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  height: '100%',
  boxSizing: 'border-box',
  '&:hover': {
    boxShadow: mode === 'dark' ? '0px 6px 12px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.3)' : theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}))

const AttendancePersonCard = ({ personData, onViewDetails, onViewImage, onDownloadImage }) => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [hovered, setHovered] = useState(false)
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null)
  const backendImgUrl = getBackendImgUrl2()

  if (!personData) return null

  // Get current mode from settings
  const getCurrentMode = () => {
    if (settings?.mode === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }

      return 'light'
    }

    return settings?.mode || 'light'
  }

  const currentMode = getCurrentMode()
  const isAllowed = personData.access_id?.id === 5 || personData.access_id === 5

  const handleImageClick = () => {
    const img = personData.person_image || personData.last_person_image

    if (img) {
      setFullScreenImageUrl(backendImgUrl + img)
    }
  }

  const handleDetailsClick = e => {
    e.stopPropagation()

    if (onViewDetails) {
      onViewDetails(personData)
    }
  }

  // Prepare images for display
  const images = []

  if (personData.person_image) {
    images.push(getBackendImgUrl2() + personData.person_image)
  }

  if (personData.last_person_image) {
    const lastPersonImageUrl = getBackendImgUrl2() + personData.last_person_image

    if (!images.includes(lastPersonImageUrl)) {
      images.push(lastPersonImageUrl)
    }
  }

  return (
    <StyledReportCard
      mode={currentMode}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Image section - exactly like AccessReportCard */}
      <Box
        sx={{
          aspectRatio: { xs: '3 / 2', sm: '16 / 9' },
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.50',
          overflow: 'hidden',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          cursor: 'pointer'
        }}
        onClick={handleImageClick}
      >
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={`${personData.first_name || ''} ${personData.last_name || ''}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              backgroundColor: 'primary.main',
              color: 'white'
            }}
          >
            {personData.first_name?.[0]}
            {personData.last_name?.[0]}
          </Avatar>
        )}
      </Box>

      <FullScreenImageModal
        open={!!fullScreenImageUrl}
        imageUrl={fullScreenImageUrl}
        onClose={() => setFullScreenImageUrl(null)}
      />

      {/* Divider between image and details */}
      <Divider sx={{ borderColor: 'divider' }} />

      {/* Details section beneath image - compact, centered, responsive - exactly like AccessReportCard */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          alignItems: 'center',
          justifyContent: 'center',
          flex: '1 1 auto',
          minHeight: { xs: 56, sm: 72 }
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Typography
            variant='h6'
            align='center'
            sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {`${personData.first_name || ''} ${personData.last_name || ''}`}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 0.5,
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              {(() => {
                const genderId = personData.gender_id?.id || personData.gender_id
                let icon = null

                if (genderId === 2) {
                  icon = <i className='tabler tabler-gender-male' style={{ fontSize: 18, color: '#1976d2' }} />
                } else if (genderId === 3) {
                  icon = <i className='tabler tabler-gender-female' style={{ fontSize: 18, color: '#d81b60' }} />
                }

                return (
                  <>
                    {icon}
                    <Typography variant='body2' color='textSecondary'>
                      {genderId === 2
                        ? t('reportCard.male')
                        : genderId === 3
                          ? t('reportCard.female')
                          : t('reportCard.unknown')}
                    </Typography>
                  </>
                )
              })()}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Typography
                variant='body2'
                color={isAllowed ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                {isAllowed ? t('reportCard.allowed') : t('reportCard.notAllowed')}
              </Typography>
              {isAllowed ? (
                <LockOpenIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <LockIcon sx={{ fontSize: 16, color: 'error.main' }} />
              )}
            </Box>
          </Box>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pt: 1 }}>
            <Button sx={{ width: '100%' }} variant='outlined' onClick={handleDetailsClick} startIcon={<Info />}>
              {t('reportCard.details')}
            </Button>
          </Box>
        </Box>
      </Box>
    </StyledReportCard>
  )
}

export default AttendancePersonCard
