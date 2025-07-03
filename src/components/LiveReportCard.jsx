import { useState, useRef } from 'react'

import { Card, Box, Typography, Button, Modal, Fade, Backdrop, Avatar, Divider, IconButton, Grid } from '@mui/material'
import { styled } from '@mui/system'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import Info from '@mui/icons-material/Info'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import EditIcon from '@mui/icons-material/Edit'

import moment from 'jalali-moment'

import { useTranslation } from '@/translations/useTranslation'
import { useAddPerson } from '@/hooks/usePersons'
import { useSettings } from '@core/hooks/useSettings'
import AddModal from './AddModal'
import EditModal from './EditModal'

const StyledReportCard = styled(Card)(({ theme, mode }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexGrow: 1,
  border: `2px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.12)'}`,
  boxShadow: mode === 'dark' ? '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)' : theme.shadows[1],
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow:
      mode === 'dark' ? '0px 6px 12px rgba(36, 18, 18, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.3)' : theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}))

const modalStyle = mode => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`
})

const LiveReportCard = ({ reportData, allReports }) => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isAllowed, setIsAllowed] = useState(reportData.access)
  const [modalData, setModalData] = useState(reportData)
  const addPersonMutation = useAddPerson()

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

  const setReportDataByIndex = index => {
    const data = allReports[index]

    setCurrentIndex(index)
    setModalData({
      id: data.id || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      national_code: data.national_code || '',
      gender: data.gender ?? '',
      access: data.access || false,
      profile_image: data.profile_image || null,
      last_image: data.last_image || null,
      index: data.index,
      feature_vector: data.feature_vector,
      report_id: data.report_id,
      date: data.date
    })
  }

  const handleOpen = () => {
    const index = allReports.findIndex(r => r.index === reportData.index)

    if (index >= 0) {
      setCurrentIndex(index)
      setReportDataByIndex(index)
    } else {
      setCurrentIndex(0)
      setReportDataByIndex(0)
    }

    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleAddOpen = () => {
    setAddOpen(true)
    setOpen(false)
  }

  const handleEditOpen = () => {
    setEditOpen(true)
    setOpen(false)
  }

  const handleAddClose = () => setAddOpen(false)

  const handleEditClose = () => setEditOpen(false)

  const handleSubmit = async formData => {
    try {
      await addPersonMutation.mutateAsync(formData)
      handleAddClose()
      handleEditClose()
    } catch (error) {
      console.error('Failed to add/edit person:', error)
    }
  }

  const handleNavigate = direction => {
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < allReports.length) {
      setReportDataByIndex(newIndex)
    }
  }

  // Format time for main card (HH:mm:ss)
  const formatTime = date => {
    if (!date) return t('reportCard.unknown')

    return moment(date).format('HH:mm:ss')
  }

  // Format Shamsi date and time for modal
  const formatShamsiDate = date => {
    if (!date) return t('reportCard.unknown')

    return moment(date).locale('fa').format('YYYY/MM/DD')
  }

  const formatShamsiTime = date => {
    if (!date) return t('reportCard.unknown')

    return moment(date).format('HH:mm:ss')
  }

  const displayImage = reportData.last_image || reportData.profile_image || '/images/avatars/1.png'


  return (
    <>
      <StyledReportCard mode={currentMode}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            variant='rounded'
            src={displayImage}
            alt={reportData.first_name}
            sx={{ width: 60, height: 60, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' gutterBottom>
              {`${reportData.first_name || ''} ${reportData.last_name || ''}`}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              {t('reportCard.id')}: {reportData.id || t('reportCard.unknown')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' color='textSecondary' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {reportData.gender === false ? (
                <>
                  {t('reportCard.male')}
                  <i className='tabler-gender-male' style={{ color: 'rgb(0, 83, 255)' }} />
                </>
              ) : reportData.gender === true ? (
                <>
                  {t('reportCard.female')}
                  <i className='tabler-gender-female' style={{ color: '#ff1dc8' }} />
                </>
              ) : (
                t('reportCard.unknown')
              )}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography
            variant='body2'
            color={isAllowed ? 'success.main' : 'error.main'}
            sx={{ display: 'flex', alignItems: 'center', mr: 1 }}
          >
            {isAllowed ? t('reportCard.allowed') : t('reportCard.notAllowed')}
            {isAllowed ? <LockOpenIcon sx={{ fontSize: 16, ml: 0.5 }} /> : <LockIcon sx={{ fontSize: 16, ml: 0.5 }} />}
          </Typography>
          <Typography variant='body2' color='var(--mui-palette-primary-main)' sx={{ ml: 1 }}>
            {formatTime(reportData.date)}
          </Typography>
          <Button variant='outlined' size='small' onClick={handleOpen} startIcon={<Info />}>
            {t('reportCard.details')}
          </Button>
        </Box>
      </StyledReportCard>

      {/* Details Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={open}>
          <Box sx={modalStyle(currentMode)}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <IconButton disabled={currentIndex === 0} onClick={() => handleNavigate(-1)}>
                <NavigateNextIcon />
              </IconButton>
              <IconButton disabled={currentIndex === allReports.length - 1} onClick={() => handleNavigate(1)}>
                <NavigateBeforeIcon />
              </IconButton>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant='subtitle1'>{t('reportCard.userImage')}</Typography>
                  <Avatar
                    variant='rounded'
                    src={modalData.profile_image || '/images/avatars/1.png'}
                    alt={modalData.first_name}
                    sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant='subtitle1'>{t('reportCard.apiImage')}</Typography>
                  <Avatar
                    variant='rounded'
                    src={modalData.last_image || '/images/avatars/1.png'}
                    alt={modalData.first_name}
                    sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                  />
                </Box>
              </Grid>
            </Grid>
            <Box>
              <Typography variant='h5'>{`${modalData.first_name || ''} ${modalData.last_name || ''}`}</Typography>
              <Typography variant='body1' color='textSecondary'>
                {t('reportCard.nationalCode')}: {modalData.national_code || t('reportCard.unknown')}
              </Typography>
              <Typography variant='body1' color='textSecondary'>
                {t('reportCard.id')}: {modalData.id || t('reportCard.unknown')}
              </Typography>
              <Typography variant='body1' color='textSecondary'>
                {t('reportCard.gender')}:{' '}
                {modalData.gender === false
                  ? t('reportCard.male')
                  : modalData.gender === true
                    ? t('reportCard.female')
                    : t('reportCard.unknown')}
              </Typography>
              <Typography variant='body1' color='textSecondary'>
                {t('reportCard.date')}: {formatShamsiDate(modalData.date)}
              </Typography>
              <Typography variant='body1' color='textSecondary'>
                {t('reportCard.time')}: {formatShamsiTime(modalData.date)}
              </Typography>
              <Typography
                variant='body1'
                color={modalData.access ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {t('reportCard.status')}: {modalData.access ? t('reportCard.allowed') : t('reportCard.notAllowed')}
                {modalData.access ? (
                  <LockOpenIcon sx={{ fontSize: 20, ml: 0.5 }} />
                ) : (
                  <LockIcon sx={{ fontSize: 20, ml: 0.5 }} />
                )}
              </Typography>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant='outlined' onClick={handleClose}>
                {t('common.close')}
              </Button>
              <Button
                variant='contained'
                onClick={modalData.id <= 0 ? handleAddOpen : handleEditOpen}
                startIcon={modalData.id <= 0 ? <PersonAddIcon /> : <EditIcon />}
              >
                {modalData.id <= 0 ? t('reportCard.addToAllowed') : t('reportCard.editInfo')}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Add Modal */}
      <AddModal
        open={addOpen}
        onClose={handleAddClose}
        onSubmit={handleSubmit}
        initialData={{
          id: modalData.id,
          first_name: modalData.first_name || '',
          last_name: modalData.last_name || '',
          national_code: modalData.national_code || '',
          gender: modalData.gender ?? '',
          access: modalData.access || false,
          profile_image: modalData.profile_image || null,
          feature_vector: modalData.feature_vector,
          report_id: modalData.report_id,
          image_quality: modalData.image_quality
        }}
        mode={currentMode}
      />

      {/* Edit Modal */}
      {/* <EditModal
          open={editOpen}
          onClose={handleEditClose}
          onSubmit={handleSubmit}
          initialData={{
            id: modalData.id,
            first_name: modalData.first_name || '',
            last_name: modalData.last_name || '',
            national_code: modalData.national_code || '',
            gender: modalData.gender ?? '',
            access: modalData.access || false,
            profile_image: modalData.profile_image || null,
            feature_vector: modalData.feature_vector,
            report_id: modalData.report_id
          }}
          mode={currentMode}
        /> */}
    </>
  )
}

export default LiveReportCard
