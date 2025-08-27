import { useState, useRef, useEffect } from 'react'

import { Box, Typography, Button, Modal, Fade, Backdrop, Avatar, Divider, IconButton, Grid } from '@mui/material'

import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import * as htmlToImage from 'html-to-image'

import { useSelector } from 'react-redux'

import FullScreenImageModal from '@/components/FullScreenImageModal'

import { useTranslation } from '@/translations/useTranslation'
import { useDeletePerson } from '@/hooks/usePersons'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import { useSettings } from '@core/hooks/useSettings'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import { commonStyles } from '@/@core/styles/commonStyles'
import useHasPermission from '@/utils/HasPermission'
import { backendImgUrl } from '@/configs/routes'

const modalStyle = mode => ({
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 600,
  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`
})

const AccessDetailModal = ({
  open,
  onClose,
  modalData,
  currentIndex,
  allReports,
  onNavigate,
  onEditOpen,
  onDeleteOpen
}) => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const modalRef = useRef(null)
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null)

  const deletePersonMutation = useDeletePerson()

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)

  // Helper function to get type title by ID
  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  // Get current mode from settings
  const getCurrentMode = () => {
    if (settings?.mode === 'system') {
      // Check if we're on the client side and get system preference
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }

      return 'light' // fallback for server-side
    }

    return settings?.mode || 'light'
  }

  const currentMode = getCurrentMode()

  // Keyboard navigation: left/right arrow to navigate reports
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

  // Data for the details table in the modal
  const modalInfo = [
    { label: t('reportCard.fullName'), value: `${modalData.first_name || ''} ${modalData.last_name || ''}` },
    { label: t('reportCard.nationalCode'), value: modalData.national_code || t('reportCard.unknown') },
    { label: t('reportCard.id'), value: modalData.person_id || t('reportCard.unknown') },
    {
      label: t('reportCard.gender'),
      value: genderTypes.loading
        ? t('reportCard.loading')
        : (() => {
            const genderId = modalData.gender_id?.id || modalData.gender_id

            return getTypeTitle(genderTypes, genderId)
          })()
    },
    { label: t('reportCard.date'), value: <ShamsiDateTime dateTime={modalData.created_at} format='date' /> },
    { label: t('reportCard.time'), value: <ShamsiDateTime dateTime={modalData.created_at} format='time' /> },
    {
      label: t('reportCard.status'),
      value: accessTypes.loading
        ? t('reportCard.loading')
        : (() => {
            const accessId = modalData.access_id?.id || modalData.access_id

            // Handle case where access_id is false/null
            if (!accessId || accessId === false) {
              return (
                <>
                  {t('reportCard.unknown')}
                  <LockIcon sx={{ fontSize: 20, ml: 1 }} />
                </>
              )
            }

            return (
              <>
                {getTypeTitle(accessTypes, accessId)}
                {accessId === 5 ? (
                  <LockOpenIcon sx={{ fontSize: 20, ml: 1 }} />
                ) : (
                  <LockIcon sx={{ fontSize: 20, ml: 1 }} />
                )}
              </>
            )
          })(),
      valueColor: (() => {
        const accessId = modalData.access_id?.id || modalData.access_id

        return !accessId || accessId === false ? 'error.main' : accessId === 5 ? 'success.main' : 'error.main'
      })()
    }
  ]

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

  // Download modal/card as image
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

  const hasUpdatePermission = useHasPermission('updatePerson')

  const personImageUrl = modalData.person_image ? backendImgUrl + modalData.person_image : null
  const lastPersonImageUrl = modalData.last_person_image ? backendImgUrl + modalData.last_person_image : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      disableAutoFocus
      sx={{
        '&:focus': {
          outline: 'none'
        }
      }}
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
      ref={modalRef}
    >
      <Fade in={open}>
        <Box sx={modalStyle(currentMode)}>
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
                  src={personImageUrl || '/images/avatars/1.png'}
                  alt={modalData.first_name}
                  onClick={() => setFullScreenImageUrl(personImageUrl || '/images/avatars/1.png')}
                  sx={{
                    cursor: 'pointer',
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
                  src={lastPersonImageUrl || '/images/avatars/1.png'}
                  alt={modalData.first_name}
                  onClick={() => setFullScreenImageUrl(lastPersonImageUrl || '/images/avatars/1.png')}
                  sx={{
                    cursor: 'pointer',
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

          {/* Information Table */}
          <Box
            sx={{
              mt: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            {modalInfo.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  px: 3,
                  backgroundColor:
                    index % 2 !== 0
                      ? currentMode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.02)'
                      : 'transparent',
                  '&:not(:last-of-type)': {
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }
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
              onClick={() => handleDownloadImage(modalData.person_image || '/images/avatars/1.png', 'person_image.png')}
            >
              {t('reportCard.downloadProfileImage')}
            </Button>
            <Button
              sx={{
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main'
                }
              }}
              variant='outlined'
              color='secondary'
              onClick={() =>
                handleDownloadImage(modalData.last_person_image || '/images/avatars/1.png', 'last_image.png')
              }
            >
              {t('reportCard.downloadLastImage')}
            </Button>
            <Button
              sx={{
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main'
                }
              }}
              variant='outlined'
              color='secondary'
              onClick={handleDownloadCardImage}
            >
              {t('reportCard.downloadCardAsImage')}
            </Button>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
            <Button color='error' variant='outlined' onClick={onClose}>
              {t('common.close')}
            </Button>
            <Button
              variant='contained'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={onDeleteOpen}
              disabled={deletePersonMutation.isLoading}
            >
              {deletePersonMutation.isLoading ? t('access.deleting') : t('access.delete')}
            </Button>
            {hasUpdatePermission && (
              <Button variant='contained' onClick={onEditOpen} startIcon={<PersonAddIcon />}>
                {t('reportCard.editInfo')}
              </Button>
            )}
            {fullScreenImageUrl && (
              <FullScreenImageModal
                open={!!fullScreenImageUrl}
                imageUrl={fullScreenImageUrl}
                onClose={() => setFullScreenImageUrl(null)}
              />
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AccessDetailModal
