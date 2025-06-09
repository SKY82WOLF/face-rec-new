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
import EditIcon from '@mui/icons-material/Edit'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Info } from '@mui/icons-material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import { useTranslation } from '@/translations/useTranslation'
import { useAddPerson } from '@/hooks/usePersons'

// Create a styled Card component with consistent styling
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

/**
 * Universal ReportCard component that handles both display and data operations
 * @param {Object} props
 * @param {Object} props.reportData - The report data to display and manage
 */
const ReportCard = ({ reportData }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isAllowed, setIsAllowed] = useState(reportData.access)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: reportData.name || '',
    lastname: reportData.last_name || '',
    national_code: reportData.national_code || '',
    gender: reportData.gender || '',
    access: reportData.access || false,
    userImage: reportData.user_image || null,
    apiImage: reportData.api_image || null
  })

  const addPersonMutation = useAddPerson()

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleEditOpen = () => {
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
          userImage: reader.result
        }))
      }

      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        user_image: formData.userImage
      }

      if (!isAllowed) {
        // Add new person
        await addPersonMutation.mutateAsync(submitData)
      }

      handleEditClose()
    } catch (error) {
      console.error('Failed to add person:', error)
    }
  }

  // Determine which image to show in the card
  const displayImage = formData.userImage || formData.apiImage || '/images/avatars/1.png'

  return (
    <>
      <StyledReportCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={displayImage} alt={reportData.name} sx={{ width: 60, height: 60, mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' gutterBottom>
              {`${reportData.name || ''} ${reportData.last_name || ''}`}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              {t('reportCard.nationalCode')}: {reportData.national_code || t('reportCard.unknown')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant='body2'
              color={isAllowed ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center', mr: 1 }}
            >
              {isAllowed ? t('reportCard.allowed') : t('reportCard.notAllowed')}
              {isAllowed && <LockIcon sx={{ fontSize: 16, ml: 0.5 }} />}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant='body2' color='textSecondary'>
            {t('reportCard.gender')}:{' '}
            {reportData.gender === false
              ? t('reportCard.male')
              : reportData.gender === true
                ? t('reportCard.female')
                : t('reportCard.unknown')}
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
        slotProps={{
          backdrop: {
            timeout: 500
          }
        }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    {t('reportCard.userImage')}
                  </Typography>
                  <Avatar
                    src={formData.userImage || '/images/avatars/1.png'}
                    alt={reportData.name}
                    sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    {t('reportCard.apiImage')}
                  </Typography>
                  <Avatar
                    src={formData.apiImage || '/images/avatars/1.png'}
                    alt={reportData.name}
                    sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                  />
                </Box>
              </Grid>
            </Grid>
            <Box>
              <Typography variant='h5' gutterBottom>
                {`${reportData.name || ''} ${reportData.last_name || ''}`}
              </Typography>
              <Typography variant='body1' color='textSecondary'>
                {t('reportCard.nationalCode')}: {reportData.national_code || t('reportCard.unknown')}
              </Typography>
              <Typography variant='body1' color='textSecondary'>
                {t('reportCard.gender')}:{' '}
                {reportData.gender === false
                  ? t('reportCard.male')
                  : reportData.gender === true
                    ? t('reportCard.female')
                    : t('reportCard.unknown')}
              </Typography>
              <Typography
                variant='body1'
                color={isAllowed ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {t('reportCard.status')}: {isAllowed ? t('reportCard.allowed') : t('reportCard.notAllowed')}
                {isAllowed && <LockIcon sx={{ fontSize: 20, ml: 0.5 }} />}
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

      {/* Add Modal */}
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500
          }
        }}
      >
        <Fade in={editOpen}>
          <Box sx={editModalStyle}>
            <Typography variant='h6' gutterBottom>
              {t('reportCard.addToAllowed')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  src={formData.userImage || '/images/avatars/1.png'}
                  alt={reportData.name}
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                />
                <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />} sx={{ mb: 2 }}>
                  {t('reportCard.uploadImage')}
                  <VisuallyHiddenInput type='file' ref={fileInputRef} onChange={handleImageUpload} accept='image/*' />
                </Button>
              </Box>
              <TextField
                fullWidth
                label={t('reportCard.name')}
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('reportCard.lastName')}
                name='lastname'
                value={formData.lastname}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('reportCard.nationalCode')}
                name='national_code'
                value={formData.national_code}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('reportCard.gender')}</InputLabel>
                <Select
                  name='gender'
                  value={formData.gender}
                  onChange={handleInputChange}
                  label={t('reportCard.gender')}
                >
                  <MenuItem value={false}>{t('reportCard.male')}</MenuItem>
                  <MenuItem value={true}>{t('reportCard.female')}</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={isAllowed} onChange={handleStatusChange} color='primary' />}
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
