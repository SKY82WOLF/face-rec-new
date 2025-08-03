import { useRef } from 'react'

import { Box, Typography, Button, Modal, Fade, Backdrop, Avatar, Divider, IconButton, Grid } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import * as htmlToImage from 'html-to-image'

import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'

const modalStyle = {
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 600
}

const ReportsDetailModal = ({ open, onClose, reportData, allReports, currentIndex, onNavigate }) => {
  const { t } = useTranslation()
  const modalRef = useRef(null)

  // Info table similar to AccessDetailModal
  const modalInfo = [
    { label: t('reportCard.fullName'), value: `${reportData.first_name || ''} ${reportData.last_name || ''}` },
    { label: t('reportCard.nationalCode'), value: reportData.national_code || t('reportCard.unknown') },
    { label: t('reportCard.id'), value: reportData.id || t('reportCard.unknown') },
    { label: t('reportCard.date'), value: reportData.date || t('reportCard.unknown') },
    {
      label: t('reportCard.status'),
      value: (
        <>
          {reportData.status === 'allowed' ? t('reportCard.allowed') : t('reportCard.notAllowed')}
          {reportData.status === 'allowed' ? (
            <LockOpenIcon sx={{ fontSize: 20, ml: 1 }} />
          ) : (
            <LockIcon sx={{ fontSize: 20, ml: 1 }} />
          )}
        </>
      ),
      valueColor: reportData.status === 'allowed' ? 'success.main' : 'error.main'
    }
  ]

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
    >
      <Fade in={open}>
        <Box sx={modalStyle} ref={modalRef}>
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
                <Typography variant='subtitle1'>{t('reportCard.userImage')}</Typography>
                <Avatar
                  variant='rounded'
                  src={reportData.person_image || '/images/avatars/1.png'}
                  alt={reportData.first_name}
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
                <Typography variant='subtitle1'>{t('reportCard.apiImage')}</Typography>
                <Avatar
                  variant='rounded'
                  src={reportData.last_image || '/images/avatars/1.png'}
                  alt={reportData.first_name}
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
              variant='outlined'
              color='secondary'
              onClick={() =>
                handleDownloadImage(reportData.person_image || '/images/avatars/1.png', 'person_image.png')
              }
            >
              {t('reportCard.downloadProfileImage')}
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => handleDownloadImage(reportData.last_image || '/images/avatars/1.png', 'last_image.png')}
            >
              {t('reportCard.downloadLastImage')}
            </Button>
            <Button variant='outlined' color='secondary' onClick={handleDownloadCardImage}>
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
