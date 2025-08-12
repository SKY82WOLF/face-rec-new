import { useState, useRef } from 'react'

import {
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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { styled } from '@mui/system'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { useUpdatePerson } from '@/hooks/usePersons'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import { useSettings } from '@core/hooks/useSettings'
import { commonStyles } from '@/@core/styles/commonStyles'

const editModalStyle = mode => ({
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 500,
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

const AccessEditModal = ({ open, onClose, formData, setFormData, isAllowed, setIsAllowed, onSubmit }) => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const fileInputRef = useRef(null)

  const updatePersonMutation = useUpdatePerson()

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)

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

  // Helper function to extract ID from object or return the value itself
  const extractId = value => {
    if (value && typeof value === 'object' && value.id !== undefined) {
      return value.id
    }

    return value
  }

  // Ensure formData has proper ID values for selects
  const normalizedFormData = {
    ...formData,
    gender_id: extractId(formData.gender_id) || '',
    access_id: extractId(formData.access_id) || ''
  }

  const handleInputChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: name === 'gender_id' || name === 'access_id' ? Number(value) : value
    }))
  }

  const handleStatusChange = event => {
    const newAccessId = event.target.checked ? 5 : 6 // 5 = allowed, 6 = not allowed

    setIsAllowed(event.target.checked)
    setFormData(prev => ({
      ...prev,
      access_id: newAccessId
    }))
  }

  const [imagePreview, setImagePreview] = useState(null)

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      setImagePreview(URL.createObjectURL(file))
      setFormData(prev => ({
        ...prev,
        person_image: file
      }))
    }
  }

  const handleSubmit = async () => {
    try {
      // Normalize gender_id and access_id before submission
      const normalizedGenderId = extractId(formData.gender_id)
      const normalizedAccessId = extractId(formData.access_id)

      const submitData = {
        ...formData,
        gender_id: normalizedGenderId,
        access_id: normalizedAccessId
      }

      // Only include person_image if it's actually a file (new upload)
      if (formData.person_image instanceof File) {
        submitData.person_image = formData.person_image
      } else {
        // Remove person_image field if it's not a new file upload
        delete submitData.person_image
      }

      await updatePersonMutation.mutateAsync({ id: formData.person_id, data: submitData })

      onClose()
    } catch (error) {
      console.error('Failed to add/update person:', error)
    }
  }

  // Get the image source for the avatar
  const getImageSource = () => {
    if (imagePreview) {
      return imagePreview
    }

    if (formData.person_image && typeof formData.person_image === 'string') {
      return formData.person_image
    }

    return '/images/defaultAvatar.png'
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
        <Box sx={editModalStyle(currentMode)}>
          <Typography variant='h6'>
            {formData.id ? t('reportCard.editPerson') : t('reportCard.addToAllowed')}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                variant='rounded'
                src={getImageSource()}
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
            <FormControl margin='normal' fullWidth style={{ mb: 2, mt: '16px' }}>
              <InputLabel id='gender-label'>{t('reportCard.gender')}</InputLabel>
              <Select
                labelId='gender-label'
                name='gender_id'
                value={normalizedFormData.gender_id || ''}
                onChange={handleInputChange}
                label={t('reportCard.gender')}
              >
                {genderTypes?.data?.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.translate?.trim() || type.title?.trim()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl margin='normal' fullWidth style={{ mb: 2, mt: '16px' }}>
              <InputLabel id='access-label'>{t('reportCard.access')}</InputLabel>
              <Select
                labelId='access-label'
                name='access_id'
                value={normalizedFormData.access_id || ''}
                onChange={handleInputChange}
                label={t('reportCard.access')}
              >
                {accessTypes?.data
                  ?.filter(type => type.id !== 7)
                  .map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.translate?.trim() || type.title?.trim()}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant='outlined' onClick={onClose}>
              {t('reportCard.cancel')}
            </Button>
            <Button variant='contained' onClick={handleSubmit}>
              {formData.id ? t('reportCard.update') : t('reportCard.add')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AccessEditModal
