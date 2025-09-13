import React, { useState } from 'react'

import { Card, Box, Typography, Button, Avatar, Divider, IconButton } from '@mui/material'

import { styled } from '@mui/system'

import InfoIcon from '@mui/icons-material/Info'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'

import { useSelector } from 'react-redux'

import useCameras from '@/hooks/useCameras'

import { getBackendImgUrl2 } from '@/configs/routes'
import { useTranslation } from '@/translations/useTranslation'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import { commonStyles } from '@/@core/styles/commonStyles'
import { useSettings } from '@core/hooks/useSettings'
import ImageCarousel from '@/components/ImageCarousel'

const StyledReportCard = styled(Card)(({ theme, mode }) => ({
  ...commonStyles.transparentCard,
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  marginBottom: theme.spacing(2),

  width: '100%',
  maxWidth: 440,
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

const ReportsGridCard = ({
  reportData,
  allReports = [],
  index = 0,
  onOpenDetail,
  onEdit,
  onDelete,
  onOpenPersonAdd,
  onOpenPersonEdit
}) => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)
  const { cameras: camerasData } = useCameras({ page: 1, per_page: 200 })

  // get mode like AccessReportCard
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

  // Prepare images for carousel
  const base = getBackendImgUrl2()
  const join = url => (url ? (url.startsWith('/') ? `${base}${url}` : `${base}/${url}`) : null)

  // Get thumbnail as default image
  const thumbnailSrc = reportData.image_thumbnail_url
    ? join(reportData.image_thumbnail_url)
    : reportData.person_image_url
      ? join(reportData.person_image_url)
      : '/images/avatars/1.png'

  // Collect other images for hover cycling (excluding thumbnail)
  const hoverImages = []

  // Add full image if available and different from thumbnail
  if (reportData.image_url) {
    const fullImageUrl = join(reportData.image_url)

    if (fullImageUrl !== thumbnailSrc) {
      hoverImages.push(fullImageUrl)
    }
  }

  // Add person image if available and different from thumbnail
  if (reportData.person_image_url) {
    const personImageUrl = join(reportData.person_image_url)

    if (personImageUrl !== thumbnailSrc && !hoverImages.includes(personImageUrl)) {
      hoverImages.push(personImageUrl)
    }
  }

  // If no hover images found, use fallback
  if (hoverImages.length === 0) {
    hoverImages.push('/images/avatars/1.png')
  }

  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  return (
    <StyledReportCard mode={currentMode} onClick={() => onOpenDetail && onOpenDetail(index)}>
      <ImageCarousel
        images={hoverImages}
        defaultImage={thumbnailSrc}
        aspectRatio={{ xs: '3 / 2', sm: '16 / 9' }}
        objectFit='cover'
        objectPosition='center'
        transitionDuration={2000}
        alt={`${reportData.person_id?.first_name || ''} ${reportData.person_id?.last_name || ''}`}
        sx={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0
        }}
      />

      <Divider sx={{ borderColor: 'divider' }} />

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
          {(() => {
            if (reportData.person_id?.first_name && reportData.person_id?.last_name) {
              return (
                <Typography
                  variant='h6'
                  align='center'
                  sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {reportData.person_id?.first_name + ' ' + reportData.person_id?.last_name}
                </Typography>
              )
            } else {
              return (
                <Typography
                  variant='h6'
                  align='center'
                  sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {t('reportCard.unknown')}
                </Typography>
              )
            }
          })()}
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
            <Box sx={{ display: 'flex', gap: 0.5, minWidth: 0, flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
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
                        {genderId && genderTypes?.data ? getTypeTitle(genderTypes, genderId) : t('reportCard.unknown')}
                      </Typography>
                    </>
                  )
                })()}
              </Box>
              <Typography variant='caption' color='textSecondary'>
                <ShamsiDateTime dateTime={reportData.created_at} format='date' />
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center', minWidth: 0 }}>
              <Typography variant='body2' color='primary.main' sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CameraAltIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                {(camerasData || []).find?.(c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id)
                  ? camerasData.find(c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id)
                      .title ||
                    camerasData.find(c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id).name
                  : `Camera ${reportData.camera_id}`}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                {t('reportCard.id')}: {reportData.person_id?.person_id}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Typography
                  variant='body2'
                  sx={{
                    color: reportData.access_id?.id === 5 || reportData.access_id === 5 ? 'success.main' : 'error.main'
                  }}
                >
                  {accessTypes.loading
                    ? t('reportCard.loading')
                    : (() => {
                        const accessId = reportData.access_id?.id || reportData.access_id

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
                <ShamsiDateTime dateTime={reportData.created_at} format='time' />
              </Typography>
            </Box>
          </Box>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
            <Button
              sx={{ flex: 1, mr: 1 }}
              variant='outlined'
              onClick={e => {
                e.stopPropagation()
                onOpenDetail && onOpenDetail(index)
              }}
              startIcon={<InfoIcon />}
            >
              {t('reportCard.details')}
            </Button>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                const accessId = reportData.access_id?.id || reportData.access_id || reportData.person_id?.access_id?.id
                const isUnknown = accessId === 7 || accessId === 'unknown' || !accessId

                if (isUnknown) onOpenPersonAdd && onOpenPersonAdd()
                else onOpenPersonEdit && onOpenPersonEdit()
              }}
            >
              {(() => {
                const accessId = reportData.access_id?.id || reportData.access_id || reportData.person_id?.access_id?.id
                const isUnknown = accessId === 7 || accessId === 'unknown' || !accessId

                return isUnknown ? <AddIcon fontSize='small' /> : <EditIcon fontSize='small' />
              })()}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </StyledReportCard>
  )
}

export default ReportsGridCard
