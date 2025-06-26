import { useState, useRef } from 'react'

import {
  Card,
  Box,
  Typography,
  Button,
  Modal,
  Fade,
  Backdrop,
  TextField,
  Switch,
  FormControlLabel,
  Avatar,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material'
import { styled } from '@mui/system'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import Info from '@mui/icons-material/Info'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'

import { useTranslation } from '@/translations/useTranslation'
import { useAddPerson } from '@/hooks/usePersons'

const StyledReportCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexGrow: 1
}))

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4
}

const editModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

const LiveReportCard = ({ reportData, allReports }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [isAllowed, setIsAllowed] = useState(reportData.access)
  const [modalData, setModalData] = useState(reportData)
  const [formData, setFormData] = useState({})
  const fileInputRef = useRef(null)

  const addPersonMutation = useAddPerson()

  const setReportDataByIndex = index => {
    const data = allReports[index]

    setCurrentIndex(index)
    setModalData({
      id: data.id || '',
      name: data.name || '',
      last_name: data.last_name || '',
      national_code: data.national_code || '',
      gender: data.gender ?? '',
      access: data.access || false,
      profile_image: data.profile_image || null,
      last_image: data.last_image || null,
      index: data.index
    })
    setIsAllowed(data.access)
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

  const handleEditOpen = () => {
    setFormData(modalData)
    setEditOpen(true)
    setOpen(false)
  }

  const handleEditClose = () => setEditOpen(false)

  const handleInputChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStatusChange = event => {
    setIsAllowed(event.target.checked)
    setFormData(prev => ({
      ...prev,
      access: event.target.checked
    }))
  }

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profile_image: reader.result
        }))
      }

      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData }

      if (!isAllowed) {
        await addPersonMutation.mutateAsync(submitData)
      }

      handleEditClose()
    } catch (error) {
      console.error('Failed to add person:', error)
    }
  }

  const handleNavigate = direction => {
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < allReports.length) {
      setReportDataByIndex(newIndex)
    }
  }

  const displayImage = reportData.profile_image || reportData.last_image || '/images/avatars/1.png'

  return (
    <>
      <StyledReportCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar variant='rounded' src={displayImage} alt={reportData.name} sx={{ width: 60, height: 60, mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' gutterBottom>
              {`${reportData.name || ''} ${reportData.last_name || ''}`}
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
          <Box sx={modalStyle}>
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
                    src={modalData.profile_image || '/images/defaultAvatar.png'}
                    alt={modalData.name}
                    sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant='subtitle1'>{t('reportCard.apiImage')}</Typography>
                  <Avatar
                    variant='rounded'
                    src={modalData.last_image || '/images/defaultAvatar.png'}
                    alt={modalData.name}
                    sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                  />
                </Box>
              </Grid>
            </Grid>
            <Box>
              <Typography variant='h5'>{`${modalData.name || ''} ${modalData.last_name || ''}`}</Typography>
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
              <Typography
                variant='body1'
                color={isAllowed ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {t('reportCard.status')}: {isAllowed ? t('reportCard.allowed') : t('reportCard.notAllowed')}
                {isAllowed ? (
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
              {!isAllowed && (
                <Button variant='contained' onClick={handleEditOpen} startIcon={<PersonAddIcon />}>
                  {t('reportCard.addToAllowed')}
                </Button>
              )}
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Edit/Add Modal */}
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={editOpen}>
          <Box sx={editModalStyle}>
            <Typography variant='h6'>{t('reportCard.addToAllowed')}</Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  variant='rounded'
                  src={formData.profile_image || '/images/defaultAvatar.png'}
                  alt={formData.name}
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                />
                <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />}>
                  {t('reportCard.uploadImage')}
                  <VisuallyHiddenInput type='file' ref={fileInputRef} onChange={handleImageUpload} accept='image/*' />
                </Button>
              </Box>
              <TextField
                fullWidth
                variant='outlined'
                label={t('reportCard.name')}
                name='name'
                value={formData.name || ''}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                variant='outlined'
                label={t('reportCard.lastName')}
                name='last_name'
                value={formData.last_name || ''}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                variant='outlined'
                label={t('reportCard.nationalCode')}
                name='national_code'
                value={formData.national_code || ''}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id='gender-label'>{t('reportCard.gender')}</InputLabel>
                <Select
                  labelId='gender-label'
                  name='gender'
                  value={formData.gender ?? ''} // Use nullish coalescing for undefined/null
                  onChange={handleInputChange}
                  label={t('reportCard.gender')}
                >
                  <MenuItem value={false}>{t('reportCard.male')}</MenuItem>
                  <MenuItem value={true}>{t('reportCard.female')}</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={isAllowed} onChange={handleStatusChange} />}
                label={isAllowed ? t('reportCard.allowed') : t('reportCard.notAllowed')}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant='outlined' onClick={handleEditClose}>
                {t('reportCard.cancel')}
              </Button>
              <Button variant='contained' onClick={handleSubmit}>
                {t('reportCard.add')}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

export default LiveReportCard
