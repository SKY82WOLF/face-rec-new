import { useEffect, useRef, useState } from 'react'

import { Box, Typography, Button, Modal, Fade, Backdrop, Avatar, Divider, IconButton, Grid, Chip } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import * as htmlToImage from 'html-to-image'

import { useSelector } from 'react-redux'

import FullScreenImageModal from '@/components/FullScreenImageModal'

// cameras are passed from parent to avoid refetching on every modal open

import { useTranslation } from '@/translations/useTranslation'
import { getBackendImgUrl2 } from '@/configs/routes'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import { commonStyles } from '@/@core/styles/commonStyles'

const modalStyle = {
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 600,
  maxHeight: { xs: '90vh', md: '100%' },
  overflow: 'auto'
}

const ReportsDetailModal = ({
  open,
  onClose,
  reportData,
  allReports,
  currentIndex,
  onNavigate,
  camerasDataProp,
  onPersonModalOpen
}) => {
  const { t } = useTranslation()
  const modalRef = useRef(null)
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null)

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)
  const camerasData = camerasDataProp || []

  // Helper function to get type title by ID
  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  const personObj = reportData.person_id && typeof reportData.person_id === 'object' ? reportData.person_id : null

  // Safely derive a primitive person code (avoid rendering objects or 0)
  const derivedPersonId = (() => {
    if (personObj) {
      const idFromNested = typeof personObj.person_id === 'number' ? personObj.person_id : personObj.id

      return typeof idFromNested === 'number' ? idFromNested : undefined
    }

    return typeof reportData.person_id === 'number' ? reportData.person_id : undefined
  })()

  const personCode = derivedPersonId && derivedPersonId !== 0 ? String(derivedPersonId) : t('reportCard.unknown')
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

  // Info table with actual API data — include id, camera, date and time
  const modalInfo = [
    { label: t('reportCard.name'), value: fullName },
    { label: t('reportCard.personId'), value: personCode },
    {
      label: t('reportCard.gender'),
      value: (
        <>
          {(() => {
            const genderId = reportData.gender_id?.id || reportData.gender_id

            if (genderTypes.loading) return t('reportCard.loading')

            const icon =
              genderId === 2 ? (
                <i className='tabler tabler-gender-male' style={{ fontSize: 18, color: '#1976d2' }} />
              ) : genderId === 3 ? (
                <i className='tabler tabler-gender-female' style={{ fontSize: 18, color: '#d81b60' }} />
              ) : null

            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icon}
                <Box component='span' sx={{ color: 'text.secondary' }}>
                  {genderId && genderTypes?.data ? getTypeTitle(genderTypes, genderId) : t('reportCard.unknown')}
                </Box>
              </Box>
            )
          })()}
        </>
      )
    },
    {
      label: t('reportCard.camera'),
      value: (camerasData || []).find?.(c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id)
        ? camerasData.find(c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id).title ||
          camerasData.find(c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id).name
        : `Camera ${reportData.camera_id || 'Unknown'}`
    },
    {
      label: t('reportCard.access'),
      value: (
        <>
          {(() => {
            const accessId = reportData.access_id?.id || reportData.access_id

            if (accessTypes.loading) return t('reportCard.loading')

            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component='span' sx={{ color: accessId === 5 ? 'success.main' : 'error.main' }}>
                  {accessId && accessTypes?.data ? getTypeTitle(accessTypes, accessId) : t('reportCard.unknown')}
                </Box>
                {accessId === 5 ? (
                  <LockOpenIcon sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <LockIcon sx={{ fontSize: 18, color: 'error.main' }} />
                )}
              </Box>
            )
          })()}
        </>
      )
    },
    { label: t('reportCard.date'), value: <ShamsiDateTime dateTime={reportData.created_at} format='date' /> },
    { label: t('reportCard.time'), value: <ShamsiDateTime dateTime={reportData.created_at} format='time' /> },
    {
      label: t('reportCard.confidence'),
      value: `${confidencePercentage}%`,
      valueColor: getConfidenceColor(reportData.confidence)
    },
    { label: t('reportCard.fiqa'), value: `${fiqaPercentage}%`, valueColor: getFiqaColor(reportData.fiqa) },
    {
      label: t('reportCard.similarityScore'),
      value:
        typeof reportData.similarity_score === 'number' && reportData.similarity_score >= 0
          ? `${(reportData.similarity_score * 100).toFixed(4)}%`
          : t('reportCard.unknown')
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
                  onClick={() => setFullScreenImageUrl(detectedImageUrl)}
                  sx={{
                    cursor: 'pointer',
                    width: 'auto',
                    height: { xs: 100, sm: 140, md: 200 },
                    mx: 'auto',
                    mb: 2,
                    border: '1px solid',
                    height: 'auto',
                    objectFit: 'contain'
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
                  onClick={() => setFullScreenImageUrl(personImageUrl)}
                  sx={{
                    cursor: 'pointer',
                    width: { xs: 100, sm: 140, md: 200 },
                    height: { xs: 100, sm: 140, md: 200 },
                    mx: 'auto',
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Fullscreen image modal for detail modal images */}
          <FullScreenImageModal
            open={!!fullScreenImageUrl}
            imageUrl={fullScreenImageUrl}
            onClose={() => setFullScreenImageUrl(null)}
          />

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
                  component='div'
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
            {reportData.access_id === 7 && (
              <Button
                variant='contained'
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onPersonModalOpen && onPersonModalOpen('add')
                }}
              >
                {t('reportCard.addToAllowed')}
              </Button>
            )}
            {(reportData.access_id === 5 || reportData.access_id === 6) && (
              <Button
                variant='outlined'
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onPersonModalOpen && onPersonModalOpen('edit')
                }}
              >
                {t('reportCard.editInfo')}
              </Button>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ReportsDetailModal
