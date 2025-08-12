import { useEffect, useRef } from 'react'

import { Box, Typography, Button, Modal, Fade, Backdrop, Avatar, Divider, IconButton, Grid, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import PersonIcon from '@mui/icons-material/Person'
import * as htmlToImage from 'html-to-image'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { getBackendImgUrl2 } from '@/configs/routes'
import { selectGenderTypes } from '@/store/slices/typesSlice'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import { commonStyles } from '@/@core/styles/commonStyles'

const modalStyle = {
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 600
}

const ReportsDetailModal = ({ open, onClose, reportData, allReports, currentIndex, onNavigate }) => {
  const { t } = useTranslation()
  const modalRef = useRef(null)

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)

  // Helper function to get type title by ID
  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  const personObj = reportData.person_id && typeof reportData.person_id === 'object' ? reportData.person_id : null
  const personCode = personObj?.person_id || personObj?.id || reportData.person_id || t('reportCard.unknown')
  const firstName = personObj?.first_name?.trim?.() || ''
  const lastName = personObj?.last_name?.trim?.() || ''
  const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : t('reportCard.unknown')

  // Get proper image URLs
  const backendImgUrl = getBackendImgUrl2()
  const detectedImageUrl = reportData.image_url ? `${backendImgUrl}/${reportData.image_url}` : '/images/avatars/1.png'

  // Prefer reportData.person_image_url; if absent, try nested person last image
  const personImageUrl = reportData.person_image_url
    ? `${backendImgUrl}/${reportData.person_image_url}`
    : personObj?.last_person_image
      ? personObj.last_person_image
      : '/images/avatars/1.png'

  const confidencePercentage = Math.round((reportData.confidence || 0) * 100)
  const fiqaPercentage = Math.round((reportData.fiqa || 0) * 100)

  const getConfidenceColor = confidence => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'warning'

    return 'error'
  }

  const getFiqaColor = fiqa => {
    if (fiqa >= 0.4) return 'success'
    if (fiqa >= 0.3) return 'warning'

    return 'error'
  }

  // Info table with actual API data
  const modalInfo = [
    { label: t('reportCard.name'), value: fullName },
    { label: t('reportCard.id'), value: reportData.id || t('reportCard.unknown') },
    { label: t('reportCard.personId'), value: personCode },
    {
      label: t('reportCard.gender'),
      value: genderTypes.loading ? t('reportCard.loading') : getTypeTitle(genderTypes, reportData.gender_id)
    },
    { label: t('reportCard.camera'), value: `Camera ${reportData.camera_id || 'Unknown'}` },
    {
      label: t('reportCard.confidence'),
      value: `${confidencePercentage}%`,
      valueColor: getConfidenceColor(reportData.confidence)
    },
    { label: t('reportCard.fiqa'), value: `${fiqaPercentage}%`, valueColor: getFiqaColor(reportData.fiqa) },
    { label: t('reportCard.similarityScore'), value: reportData.similarity_score || t('reportCard.unknown') },
    {
      label: t('reportCard.createdAt'),
      value: <ShamsiDateTime dateTime={reportData.created_at} format='dateTime' />
    },
    {
      label: t('reportCard.updatedAt'),
      value: <ShamsiDateTime dateTime={reportData.updated_at} format='dateTime' />
    }
  ]

  useEffect(() => {
    if (!open) return

    const handleKeyDown = event => {
      if (event.key === 'ArrowRight' && currentIndex > 0) {
        onNavigate(-1)
      } else if (event.key === 'ArrowLeft' && currentIndex < allReports.length - 1) {
        onNavigate(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, currentIndex, allReports.length, onNavigate])

  // Download helpers
  const handleDownloadImage = (url, filename) => {
    if (!url) return
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a')

        link.href = URL.createObjectURL(blob)
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch(err => console.error('Download failed:', err))
  }

  const handleDownloadCardImage = () => {
    if (!modalRef.current) return
    htmlToImage
      .toPng(modalRef.current)
      .then(dataUrl => {
        const link = document.createElement('a')

        link.href = dataUrl
        link.download = 'report_card.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch(err => console.error('Download card image failed:', err))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
      sx={{
        '&:focus': {
          outline: 'none'
        }
      }}
    >
      <Fade in={open}>
        <Box sx={{ ...modalStyle, '&:focus': { outline: 'none' } }} ref={modalRef}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <IconButton disabled={currentIndex === 0} onClick={() => onNavigate(-1)}>
              <NavigateNextIcon />
            </IconButton>
            <Typography variant='h6' component='h2'>
              {t('reportCard.details')}
            </Typography>
            <IconButton disabled={currentIndex === allReports.length - 1} onClick={() => onNavigate(1)}>
              <NavigateBeforeIcon />
            </IconButton>
          </Box>
          <Grid justifyContent={'center'} container spacing={3}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant='subtitle1'>{t('reportCard.detectedImage')}</Typography>
                <Avatar
                  variant='rounded'
                  src={detectedImageUrl}
                  alt={`Person ${fullName || personCode}`}
                  sx={{
                    width: { xs: 100, sm: 140, md: 200 },
                    height: { xs: 100, sm: 140, md: 200 },
                    mx: 'auto',
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant='subtitle1'>{t('reportCard.personImage')}</Typography>
                <Avatar
                  variant='rounded'
                  src={personImageUrl}
                  alt={`Person ${fullName || personCode}`}
                  sx={{
                    width: { xs: 100, sm: 140, md: 200 },
                    height: { xs: 100, sm: 140, md: 200 },
                    mx: 'auto',
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Bounding Box Info */}
          {reportData.bounding_box && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                {t('reportCard.boundingBox')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography variant='caption' color='textSecondary'>
                    X: {reportData.bounding_box.x}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant='caption' color='textSecondary'>
                    Y: {reportData.bounding_box.y}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant='caption' color='textSecondary'>
                    W: {reportData.bounding_box.w}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant='caption' color='textSecondary'>
                    H: {reportData.bounding_box.h}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Info Table */}
          <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
            {modalInfo.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  px: 3,
                  backgroundColor: index % 2 !== 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                  '&:not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'divider' }
                }}
              >
                <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {item.label}
                </Typography>
                <Typography
                  variant='body1'
                  color={item.valueColor || 'text.primary'}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
          {/* Download Buttons */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              sx={{
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main'
                }
              }}
              variant='outlined'
              color='secondary'
              onClick={() => handleDownloadImage(detectedImageUrl, 'detected_image.png')}
            >
              {t('reportCard.downloadDetectedImage')}
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => handleDownloadImage(personImageUrl, 'person_image.png')}
              sx={{
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main'
                }
              }}
            >
              {t('reportCard.downloadPersonImage')}
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              onClick={handleDownloadCardImage}
              sx={{
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main'
                }
              }}
            >
              {t('reportCard.downloadCardAsImage')}
            </Button>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
            <Button color='error' variant='outlined' onClick={onClose}>
              {t('common.close')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ReportsDetailModal
