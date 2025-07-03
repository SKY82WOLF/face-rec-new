import { useState, useRef } from 'react'

import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Typography,
  Button,
  Avatar,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { styled } from '@mui/system'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'

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

const modalStyle = mode => ({
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

const EditModal = ({ open, onClose, onSubmit, initialData, mode }) => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    national_code: initialData?.national_code || '',
    gender: initialData?.gender ?? '',
    access: initialData?.access || false,
    profile_image: initialData?.profile_image || null,
    ...initialData // Include additional fields like feature_vector, report_id
  })

  const fileInputRef = useRef(null)

  const handleInputChange = e => {
    const { name, value, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: name === 'access' ? checked : value
    }))
  }

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_image: file
      }))
    }
  }

  const handleFormSubmit = e => {
    e.preventDefault()
    onSubmit(formData)
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
        <Box sx={modalStyle(mode)}>
          <Typography variant='h6'>{t('reportCard.edit')}</Typography>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                variant='rounded'
                src={formData.profile_image || '/images/avatars/1.png'}
                alt={formData.first_name}
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
              />
              <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />}>
                {t('reportCard.uploadImage')}
                <VisuallyHiddenInput type='file' ref={fileInputRef} onChange={handleImageUpload} accept='image/*' />
              </Button>
            </Box>
            <CustomTextField
              fullWidth
              variant='outlined'
              label={t('reportCard.name')}
              name='first_name'
              value={formData.first_name}
              onChange={handleInputChange}
              margin='normal'
              required
            />
            <CustomTextField
              fullWidth
              label={t('reportCard.lastName')}
              name='last_name'
              value={formData.last_name}
              onChange={handleInputChange}
              margin='normal'
              required
            />
            <CustomTextField
              fullWidth
              variant='outlined'
              label={t('reportCard.nationalCode')}
              name='national_code'
              value={formData.national_code}
              onChange={e => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)

                handleInputChange({
                  target: {
                    name: 'national_code',
                    value
                  }
                })
              }}
              margin='normal'
              required
              slotProps={{
                input: {
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 10
                }
              }}
              error={formData.national_code.length > 0 && formData.national_code.length !== 10}
              helperText={
                formData.national_code.length > 0 && formData.national_code.length !== 10
                  ? t('access.addPersonModal.nationalCodeLimit')
                  : ''
              }
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id='gender-label'>{t('reportCard.gender')}</InputLabel>
              <Select
                labelId='gender-label'
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
              control={<Switch checked={formData.access} onChange={handleInputChange} name='access' />}
              label={formData.access ? t('reportCard.allowed') : t('reportCard.notAllowed')}
              sx={{ mb: 2 }}
            />
          </Box>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant='outlined' onClick={onClose}>
              {t('reportCard.cancel')}
            </Button>
            <Button variant='contained' onClick={handleFormSubmit}>
              {t('reportCard.save')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default EditModal
