'use client'

import { useRef, useEffect } from 'react'

import { Modal, Fade, Backdrop, Box, Typography, Button, Avatar, Divider, IconButton, Grid } from '@mui/material'
import { styled } from '@mui/system'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import EditIcon from '@mui/icons-material/Edit'

import * as htmlToImage from 'html-to-image'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { useSettings } from '@core/hooks/useSettings'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import { commonStyles } from '@/@core/styles/commonStyles'

const modalStyle = mode => ({
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 600,
  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`
})

const LiveDetailModal = ({
  open,
  onClose,
  modalData,
  currentIndex,
  allReports,
  onNavigate,
  onPersonModalOpen,
  mode
}) => {
  const { t } = useTranslation()
  const modalRef = useRef(null)

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)

  // Permission checks (hooks must be called unconditionally)
  const canCreate = useHasPermission('createPerson')
  const canUpdate = useHasPermission('updatePerson')

  // Helper function to get type title by ID
  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

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

  // Download image from URL
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

  // Helper to determine if access is unknown
  const isUnknownAccess = accessId => {
    return accessId === 7 || accessId === 'unknown' || !accessId
  }

  // Helper to determine if access is allowed (access_id === 5 means allowed)
  const isAccessAllowed = accessId => {
    const id = accessId?.id || accessId

    return id === 5
  }

  const accessId = modalData.access_id?.id || modalData.access_id
  const isAdd = isUnknownAccess(accessId) || modalData.id <= 0
  const isAllowed = isAccessAllowed(accessId)

  // Function to handle opening add/edit modal
  const handlePersonModalOpen = () => {
    if (isAdd) {
      // Open add modal
      onPersonModalOpen('add')
    } else {
      // Open edit modal
      onPersonModalOpen('edit')
    }
  }

  const genderValue = genderTypes.loading
    ? t('reportCard.loading')
    : (() => {
        const genderId = modalData.gender_id?.id || modalData.gender_id

        if (genderId && genderTypes?.data) {
          return <>{getTypeTitle(genderTypes, genderId)}</>
        }

        return t('reportCard.unknown')
      })()

  const accessValue = accessTypes.loading
    ? t('reportCard.loading')
    : (() => {
        const accessId = modalData.access_id?.id || modalData.access_id

        if (accessId && accessTypes?.data) {
          return getTypeTitle(accessTypes, accessId)
        }

        return t('reportCard.unknown')
      })()

  // Data for the details table in the modal
  const modalInfo = [
    { label: t('reportCard.fullName'), value: `${modalData.first_name || ''} ${modalData.last_name || ''}` },
    { label: t('reportCard.nationalCode'), value: modalData.national_code || t('reportCard.unknown') },
    { label: t('reportCard.id'), value: modalData.person_id || t('reportCard.unknown') },
    {
      label: t('reportCard.gender'),
      value: genderValue
    },
    { label: t('reportCard.date'), value: <ShamsiDateTime dateTime={modalData.date} format='date' /> },
    {
      label: t('reportCard.time'),
      value: <ShamsiDateTime dateTime={modalData.date} format='time' disableTimeConversion />
    },
    {
      label: t('reportCard.status'),
      value: (
        <>
          {accessValue}
          {isAllowed ? <LockOpenIcon sx={{ fontSize: 20, ml: 1 }} /> : <LockIcon sx={{ fontSize: 20, ml: 1 }} />}
        </>
      ),
      valueColor: isAllowed ? 'success.main' : 'error.main'
    }
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box sx={modalStyle(mode)} ref={modalRef}>
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
                  src={modalData.person_image || '/images/avatars/1.png'}
                  alt={modalData.first_name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    maxWidth: 200,
                    maxHeight: 200,
                    minHeight: 100,
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
                  src={modalData.last_person_image || '/images/avatars/1.png'}
                  alt={modalData.first_name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    maxWidth: 200,
                    maxHeight: 200,
                    minHeight: 100,
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
                  backgroundColor:
                    index % 2 !== 0
                      ? mode === 'dark'
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
            {isAdd
              ? canCreate && (
                  <Button variant='contained' onClick={handlePersonModalOpen} startIcon={<PersonAddIcon />}>
                    {t('reportCard.addToAllowed')}
                  </Button>
                )
              : canUpdate && (
                  <Button variant='contained' onClick={handlePersonModalOpen} startIcon={<EditIcon />}>
                    {t('reportCard.editInfo')}
                  </Button>
                )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default LiveDetailModal
