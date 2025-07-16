import { useState, useRef, useEffect } from 'react'

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
import { commonStyles } from '@/@core/styles/commonStyles'

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
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 500,
  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`
})

const AddModal = ({ open, onClose, onSubmit, initialData, mode }) => {
  const { t } = useTranslation()
  const [selectedImage, setSelectedImage] = useState(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    national_code: '',
    gender: initialData?.gender ?? '',
    access: initialData?.access || false,
    profile_image: null,
    feature_vector: initialData?.feature_vector || '',
    report_id: initialData?.report_id || '',
    image_quality: initialData?.image_quality || ''
  })

  const fileInputRef = useRef(null)

  // Set preview image from initialData if no new image is uploaded
  useEffect(() => {
    if (initialData?.profile_image && !selectedImage) {
      setSelectedImage(initialData.profile_image)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.profile_image])

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
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert(t('reportCard.invalidImageType'))

        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(t('reportCard.imageTooLarge'))

        return
      }

      setSelectedImage(URL.createObjectURL(file))
      setFormData(prev => ({
        ...prev,
        profile_image: file
      }))
    }
  }

  // Convert URL to File object
  const urlToFile = async (url, filename) => {
    try {
      const response = await fetch(url)

      if (!response.ok) throw new Error('Failed to fetch image')
      const blob = await response.blob()

      return new File([blob], filename, { type: blob.type })
    } catch (error) {
      console.error('Failed to convert URL to File:', error)

      return null
    }
  }

  const handleFormSubmit = async e => {
    e.preventDefault()

    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.national_code || formData.gender === '') {
      alert(t('reportCard.fillRequiredFields'))

      return
    }

    let profileImage = formData.profile_image

    // If no new image is uploaded and initialData.profile_image is a URL, convert it to File
    if (!profileImage && initialData?.profile_image) {
      profileImage = await urlToFile(initialData.profile_image, 'profile_image.jpg')
    }

    const submitData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      national_code: formData.national_code,
      gender: formData.gender,
      access: formData.access,
      profile_image: profileImage // File object or null
    }

    // Only include optional fields if they have valid values
    if (formData.report_id) {
      submitData.report_id = formData.report_id
    }

    if (formData.feature_vector) {
      submitData.feature_vector = formData.feature_vector
    }

    if (formData.image_quality) {
      submitData.image_quality = formData.image_quality
    }

    // Log submitData for debugging
    console.log('submitData:', submitData)

    try {
      await onSubmit(submitData)

      // Reset form after successful submission
      setFormData({
        first_name: '',
        last_name: '',
        national_code: '',
        gender: '',
        access: false,
        profile_image: null,
        feature_vector: '',
        report_id: '',
        image_quality: ''
      })
      setSelectedImage(null)
    } catch (error) {
      console.error('Submission failed:', error)
      alert(t('reportCard.submissionFailed'))
    }
  }

  // Clean up URL.createObjectURL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (selectedImage && selectedImage.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImage)
      }
    }
  }, [selectedImage])

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
          <Typography variant='h6'>{t('reportCard.addToAllowed')}</Typography>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                variant='rounded'
                src={selectedImage || '/images/avatars/1.png'}
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
                  target: { name: 'national_code', value }
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
            <FormControl fullWidth style={{ mb: 2, mt: '16px' }}>
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
              {t('reportCard.add')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddModal
