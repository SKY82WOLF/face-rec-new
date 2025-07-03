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
  Grid,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Dialog
} from '@mui/material'
import { styled } from '@mui/system'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import Info from '@mui/icons-material/Info'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'

import { useTranslation } from '@/translations/useTranslation'
import { useAddPerson, useDeletePerson } from '@/hooks/usePersons'
import { useSettings } from '@core/hooks/useSettings'

const StyledReportCard = styled(Card)(({ theme, mode }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexGrow: 1,

  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.12)'}`,
  boxShadow: mode === 'dark' ? '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)' : theme.shadows[1],

  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: mode === 'dark' ? '0px 6px 12px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.3)' : theme.shadows[4],
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

const editModalStyle = mode => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`
})

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

const ReportCard = ({ reportData, allReports }) => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isAllowed, setIsAllowed] = useState(reportData.access === 'allowed')
  const [modalData, setModalData] = useState(reportData)
  const [formData, setFormData] = useState({})
  const fileInputRef = useRef(null)

  const addPersonMutation = useAddPerson()
  const deletePersonMutation = useDeletePerson()

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

  const setReportDataByIndex = index => {
    const data = allReports[index]

    setCurrentIndex(index)
    setModalData({
      id: data.id || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      national_code: data.national_code || '',
      gender: data.gender ?? '',
      access: data.access || 'not_allowed',
      profile_image: data.profile_image || null,
      last_image: data.last_image || null,
      index
    })
    setIsAllowed(data.access === 'allowed')
  }

  const handleOpen = () => {
    setCurrentIndex(reportData.index)
    setReportDataByIndex(reportData.index)
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleEditOpen = () => {
    setFormData({
      ...modalData,
      access: isAllowed // Ensure access is boolean in formData
    })
    setEditOpen(true)
    setOpen(false)
  }

  const handleEditClose = () => setEditOpen(false)

  const handleDeleteOpen = () => setDeleteConfirmOpen(true)
  const handleDeleteClose = () => setDeleteConfirmOpen(false)

  const handleDelete = async () => {
    try {
      await deletePersonMutation.mutateAsync(modalData.id)
      handleDeleteClose()
      handleClose()
    } catch (error) {
      console.error('Failed to delete person:', error)
    }
  }

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
      access: event.target.checked // Store as boolean
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
      const submitData = {
        ...formData,
        access: isAllowed ? 'allowed' : 'not_allowed' // Convert to string for API
      }

      await addPersonMutation.mutateAsync(submitData)
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
                    src={modalData.profile_image || '/images/defaultAvatar.png'}
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
                    src={modalData.last_image || '/images/defaultAvatar.png'}
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
              <Button
                variant='contained'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={handleDeleteOpen}
                disabled={deletePersonMutation.isLoading}
              >
                {deletePersonMutation.isLoading ? t('access.deleting') : t('access.delete')}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteClose}
        aria-labelledby="delete-confirm-dialog-title"
      >
        <DialogTitle id="delete-confirm-dialog-title">{t('access.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('access.confirmDeleteMessage', {
              name: `${modalData.first_name || ''} ${modalData.last_name || ''}`.trim() || t('reportCard.unknown')
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} variant="outlined">
            {t('reportCard.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={deletePersonMutation.isLoading}
          >
            {deletePersonMutation.isLoading ? t('access.deleting') : t('access.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Add Modal */}
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={editOpen}>
          <Box sx={editModalStyle(currentMode)}>
            <Typography variant='h6'>{t('reportCard.addToAllowed')}</Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  variant='rounded'
                  src={formData.profile_image || '/images/defaultAvatar.png'}
                  alt={formData.first_name}
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
                name='first_name'
                value={formData.first_name || ''}
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

export default ReportCard
