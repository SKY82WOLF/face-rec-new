import React, { useState } from 'react'

import { Card, Box, Typography, Button } from '@mui/material'
import { styled } from '@mui/system'
import InfoIcon from '@mui/icons-material/Info'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { useSelector } from 'react-redux'

import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import FullScreenImageModal from '@/components/FullScreenImageModal'
import ImageCarousel from '@/components/ImageCarousel'

const StyledReportCard = styled(Card)(({ theme, mode }) => ({
  ...commonStyles.transparentCard,
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  marginBottom: theme.spacing(2),
  width: '100%',
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

const LiveGridCard = ({ reportData, index = 0, onOpenDetail }) => {
  const { t } = useTranslation()
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null)

  // Prepare images for carousel
  const images = []

  // Add last person image if available
  if (reportData.last_person_image) {
    images.push(reportData.last_person_image)
  }

  // Add person image if available and different from last person image
  if (reportData.person_image && !images.includes(reportData.person_image)) {
    images.push(reportData.person_image)
  }

  // If no images found, use fallback
  if (images.length === 0) {
    images.push('/images/avatars/1.png')
  }

  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  return (
    <StyledReportCard sx={{ width: '100%', maxWidth: 360 }}>
      <ImageCarousel
        images={images}
        aspectRatio={{ xs: '3 / 2', sm: '16 / 9' }}
        objectFit='cover'
        objectPosition='center'
        transitionDuration={2000}
        onImageClick={imageUrl => setFullScreenImageUrl(imageUrl)}
        alt={`${reportData.first_name || ''} ${reportData.last_name || ''}`}
      />

      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          alignItems: 'center',
          justifyContent: 'center',
          flex: '1 1 auto',
          minHeight: { xs: 80, sm: 110 }
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Typography
            variant='h6'
            align='center'
            sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {reportData.first_name || reportData.last_name
              ? `${reportData.first_name || ''} ${reportData.last_name || ''}`
              : t('reportCard.unknown')}
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
            <Box sx={{ display: 'flex', gap: 1, minWidth: 0, justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexDirection: 'column' }}>
                {(() => {
                  if (genderTypes.loading) {
                    return (
                      <Typography variant='body2' color='textSecondary'>
                        {t('reportCard.loading')}
                      </Typography>
                    )
                  }

                  const genderId =
                    reportData.gender_id?.id || reportData.gender_id || reportData.person_id?.gender_id?.id

                  const icon =
                    genderId === 2 ? (
                      <i className='tabler tabler-gender-male' style={{ fontSize: 18, color: '#1976d2' }} />
                    ) : genderId === 3 ? (
                      <i className='tabler tabler-gender-female' style={{ fontSize: 18, color: '#d81b60' }} />
                    ) : null

                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {icon}
                      <Typography variant='body2' color='textSecondary'>
                        {genderId && genderTypes?.data ? getTypeTitle(genderTypes, genderId) : t('reportCard.unknown')}
                      </Typography>
                    </Box>
                  )
                })()}

                <Typography variant='body2' color='textSecondary'>
                  {t('reportCard.id')}:{' '}
                  {reportData.person_id || reportData.person_id?.person_id || t('reportCard.unknown')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant='body2'
                    sx={{
                      color:
                        reportData.access_id?.id === 5 || reportData.access_id === 5 ? 'success.main' : 'error.main'
                    }}
                  >
                    {accessTypes.loading
                      ? t('reportCard.loading')
                      : (() => {
                          const accessId =
                            reportData.access_id?.id || reportData.access_id || reportData.person_id?.access_id?.id

                          return accessId && accessTypes?.data
                            ? getTypeTitle(accessTypes, accessId)
                            : t('reportCard.unknown')
                        })()}
                  </Typography>
                  {reportData.access_id?.id === 5 || reportData.access_id === 5 ? (
                    <LockOpenIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <LockIcon sx={{ fontSize: 16, color: 'error.main' }} />
                  )}
                </Box>

                <Typography variant='caption' color='textSecondary'>
                  <ShamsiDateTime
                    dateTime={reportData.created_at || reportData.date || reportData.time}
                    format='time'
                  />
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pt: 1 }}>
            <Button
              sx={{ width: '100%' }}
              variant='outlined'
              onClick={e => {
                e.stopPropagation()
                onOpenDetail && onOpenDetail(index)
              }}
              startIcon={<InfoIcon />}
            >
              {t('reportCard.details')}
            </Button>
          </Box>
        </Box>
      </Box>
      <FullScreenImageModal
        open={!!fullScreenImageUrl}
        imageUrl={fullScreenImageUrl}
        onClose={() => setFullScreenImageUrl(null)}
      />
    </StyledReportCard>
  )
}

export default LiveGridCard
