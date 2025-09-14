import React, { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Typography,
  IconButton,
  Card,
  CardContent,
  Divider,
  Grid,
  Chip
} from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import CameraAltIcon from '@mui/icons-material/CameraAlt'

import { useSelector } from 'react-redux'

import EmotionDetection from './EmotionDetection'
import { getBackendImgUrl2 } from '@/configs/routes'
import { useTranslation } from '@/translations/useTranslation'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import useCameras from '@/hooks/useCameras'
import FullScreenImageModal from '@/components/FullScreenImageModal'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogPaper': {
    borderRadius: theme.spacing(2),
    minWidth: { xs: '95%', sm: '80%', md: '600px' },
    overflowX: 'hidden'
  }
}))

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`
}))

const EmotionAnalysisModal = ({ open, onClose, reportData }) => {
  const { t } = useTranslation()
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null)
  const backendImgUrl = getBackendImgUrl2()

  // Get selectors and hooks
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)
  const { cameras: camerasData } = useCameras({ page: 1, per_page: 200 })

  // Helper function to get type title by ID
  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  // Get the image URL to analyze - prefer person_image_url as requested
  const imageUrl = reportData?.person_image_url || reportData?.last_person_image || reportData?.image_url

  // Get image_url specifically for display
  const displayImageUrl = reportData?.image_url || reportData?.person_image_url || reportData?.last_person_image

  // Get proper image URLs with backend prefix
  const fullImageUrl = imageUrl
    ? `${backendImgUrl}/${imageUrl}`.replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://')
    : null

  const fullDisplayImageUrl = displayImageUrl
    ? `${backendImgUrl}/${displayImageUrl}`
        .replace(/\/+/g, '/')
        .replace('http:/', 'http://')
        .replace('https:/', 'https://')
    : null

  // Extract person information
  const personObj =
    typeof reportData.person_id === 'object' && reportData.person_id !== null ? reportData.person_id : null

  const personCodeRaw =
    personObj?.person_id ?? personObj?.id ?? (typeof reportData.person_id === 'object' ? null : reportData.person_id)

  const personCode = personCodeRaw == null ? t('reportCard.unknown') : String(personCodeRaw)
  const firstName = personObj?.first_name?.trim?.() || ''
  const lastName = personObj?.last_name?.trim?.() || ''
  const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : t('reportCard.unknown')

  // Get gender and access info
  const genderId = reportData.gender_id?.id || reportData.gender_id || reportData.person_id?.gender_id?.id
  const accessId = reportData.access_id?.id || reportData.access_id

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
      <StyledDialogTitle>
        <Typography variant='h6' component='div'>
          {t('reportCard.emotionAnalysis')}
        </Typography>
        <IconButton aria-label='close' onClick={onClose} sx={{ color: theme => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {fullDisplayImageUrl ? (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Avatar
                variant='rounded'
                src={fullDisplayImageUrl}
                alt={fullName}
                onClick={() => setFullScreenImageUrl(fullDisplayImageUrl)}
                sx={{
                  cursor: 'pointer',
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  objectFit: 'contain',
                  boxShadow: 1
                }}
              />
            </Box>
          ) : (
            <Typography variant='body2' color='error'>
              {t('reportCard.noImageProvided')}
            </Typography>
          )}
          {/* Right side - Emotion analysis */}
          <Grid item xs={12} md={7} sx={{ width: '100%' }}>
            {/* Left side - Person info */}
            <Grid item xs={12} md={5} sx={{ width: '100%' }}>
              <Card variant='outlined' sx={{ height: '100%', width: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={fullImageUrl || '/images/avatars/1.png'}
                      alt={fullName}
                      sx={{ width: 60, height: 60, mr: 2, cursor: 'pointer' }}
                      onClick={() => setFullScreenImageUrl(fullImageUrl)}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant='h6' fontWeight={600}>
                        {fullName}
                      </Typography>
                      <Typography variant='body2' color='textSecondary'>
                        {t('reportCard.personId')}: {personCode}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {genderId === 2 && (
                          <i className='tabler tabler-gender-male' style={{ fontSize: 18, color: '#1976d2' }} />
                        )}
                        {genderId === 3 && (
                          <i className='tabler tabler-gender-female' style={{ fontSize: 18, color: '#d81b60' }} />
                        )}
                        <Typography variant='body2' color='textSecondary'>
                          {genderId && genderTypes?.data
                            ? getTypeTitle(genderTypes, genderId)
                            : t('reportCard.unknown')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {reportData?.camera_id && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant='body2'>{t('reportCard.camera')}:</Typography>
                      <Chip
                        icon={<CameraAltIcon sx={{ fontSize: 16 }} />}
                        label={
                          (camerasData || []).find?.(
                            c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id
                          )
                            ? camerasData.find(
                                c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id
                              ).title ||
                              camerasData.find(
                                c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id
                              ).name
                            : `Camera ${reportData.camera_id}`
                        }
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant='body2'>{t('reportCard.access')}:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant='body2' color={accessId === 5 ? 'success.main' : 'error.main'}>
                        {accessId && accessTypes?.data ? getTypeTitle(accessTypes, accessId) : t('reportCard.unknown')}
                      </Typography>
                      {accessId === 5 ? (
                        <LockOpenIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : (
                        <LockIcon sx={{ fontSize: 16, color: 'error.main' }} />
                      )}
                    </Box>
                  </Box>

                  {reportData?.created_at && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant='body2'>{t('reportCard.date')}:</Typography>
                      <Typography variant='body2' color='textSecondary'>
                        <ShamsiDateTime dateTime={reportData.created_at} format='date' />
                      </Typography>
                    </Box>
                  )}

                  {reportData?.created_at && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2'>{t('reportCard.time')}:</Typography>
                      <Typography variant='body2' color='textSecondary'>
                        <ShamsiDateTime dateTime={reportData.created_at} format='time' />
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 'auto',
                justifyContent: 'space-between'
              }}
            >
              {fullDisplayImageUrl ? (
                <>
                  <EmotionDetection imageUrl={fullDisplayImageUrl} />
                </>
              ) : (
                <Typography variant='body2' color='error'>
                  {t('reportCard.noImageProvided')}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Full screen image modal */}
        <FullScreenImageModal
          open={!!fullScreenImageUrl}
          imageUrl={fullScreenImageUrl}
          onClose={() => setFullScreenImageUrl(null)}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: theme => `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} variant='outlined'>
          {t('common.close')}
        </Button>
      </DialogActions>
    </StyledDialog>
  )
}

export default EmotionAnalysisModal
