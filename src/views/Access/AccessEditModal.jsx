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

import { useTranslation } from '@/translations/useTranslation'
import { useAddPerson } from '@/hooks/usePersons'
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

  const addPersonMutation = useAddPerson()

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
          person_image: reader.result
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
      onClose()
    } catch (error) {
      console.error('Failed to add person:', error)
    }
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
          <Typography variant='h6'>{t('reportCard.addToAllowed')}</Typography>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                variant='rounded'
                src={formData.person_image || '/images/defaultAvatar.png'}
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
            <Button variant='outlined' onClick={onClose}>
              {t('reportCard.cancel')}
            </Button>
            <Button variant='contained' onClick={handleSubmit}>
              {t('reportCard.add')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AccessEditModal
