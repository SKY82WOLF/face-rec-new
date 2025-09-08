'use client'

import { useState, useRef, useEffect } from 'react'

import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Typography,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { styled } from '@mui/system'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import { useSelector } from 'react-redux'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
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

export default function ReportsPersonEditModal({ open, onClose, onSubmit, initialData, mode }) {
  const { t } = useTranslation()
  const [selectedImage, setSelectedImage] = useState(null)
  const [showReportPreview, setShowReportPreview] = useState(true)
  const [personImageUrl, setPersonImageUrl] = useState(null)

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    national_code: '',
    gender_id: '',
    access_id: 6,
    person_image: null,
    last_person_image: null,
    feature_vector: '',
    last_person_report_id: '',
    person_id: '',
    image_quality: ''
  })

  const fileInputRef = useRef(null)

  // Initialize form data when modal opens
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        national_code: initialData.national_code || '',
        gender_id: initialData.gender_id?.id || initialData.gender_id || '',
        access_id: initialData.access_id?.id || initialData.access_id || 7,
        person_image: null,
        last_person_image: initialData.last_person_image || null,
        feature_vector: initialData.feature_vector || '',
        last_person_report_id: initialData.last_person_report_id || '',
        person_id: initialData.person_id || '',
        image_quality: initialData.image_quality || ''
      })

      // Default to person image if available; otherwise fall back to last image
      if (initialData.person_image) {
        setShowReportPreview(false)
        setSelectedImage(null)
      } else if (initialData.last_person_image) {
        setShowReportPreview(true)
        setSelectedImage(null)
      } else {
        setShowReportPreview(false)
        setSelectedImage(null)
      }

      // Keep absolute URL for person's profile image to use on toggle when no upload
      setPersonImageUrl(initialData.person_image || null)
    }
  }, [open, initialData])

  const handleInputChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      // Minimal validation as in LiveEditModal
      if (!file.type.startsWith('image/')) return
      if (file.size > 5 * 1024 * 1024) return

      setSelectedImage(URL.createObjectURL(file))
      setFormData(prev => ({
        ...prev,
        person_image: file
      }))
      setShowReportPreview(false)
    }
  }

  // Get the image source for the avatar with toggle support
  const getImageSource = () => {
    if (showReportPreview && formData.last_person_image) return formData.last_person_image

    if (!showReportPreview) {
      // Prefer uploaded preview, then existing person image URL
      if (selectedImage) return selectedImage
      if (personImageUrl) return personImageUrl
      if (formData.person_image && typeof formData.person_image === 'string') return formData.person_image
    }

    return '/images/avatars/1.png'
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
    if (!formData.first_name || !formData.last_name || !formData.national_code || formData.gender_id === '') {
      console.error('Validation failed: Required fields are missing')

      return
    }

    let profileImage = formData.person_image // Use the newly uploaded image if available

    // If no new image is uploaded and toggle shows report image, convert it to File
    if (!profileImage && showReportPreview && formData.last_person_image) {
      profileImage = await urlToFile(formData.last_person_image, 'profile_image.jpg')
    }

    // If toggled to person image and we only have URL (no uploaded file), convert it to File
    if (!profileImage && !showReportPreview && personImageUrl) {
      profileImage = await urlToFile(personImageUrl, 'profile_image.jpg')
    }

    const submitData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      national_code: formData.national_code,
      gender_id: formData.gender_id,
      access_id: formData.access_id,
      person_image: profileImage, // File object or null
      last_person_image: formData.last_person_image
    }

    // Only include optional fields if they have valid values
    submitData.last_person_report_id = formData.last_person_report_id
    submitData.person_id = formData.person_id
    if (formData.feature_vector) submitData.feature_vector = formData.feature_vector
    if (formData.image_quality) submitData.image_quality = formData.image_quality

    try {
      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Update failed:', error)
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
      disableAutoFocus
      sx={{
        '&:focus': { outline: 'none' }
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyle(mode)}>
          <Typography variant='h6'>{t('reportCard.editPerson')}</Typography>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                variant='rounded'
                src={getImageSource()}
                alt={formData.first_name}
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />}>
                  {t('reportCard.uploadImage')}
                  <VisuallyHiddenInput type='file' ref={fileInputRef} onChange={handleImageUpload} accept='image/*' />
                </Button>
                <Button variant='outlined' onClick={() => setShowReportPreview(p => !p)}>
                  {showReportPreview
                    ? t('reportCard.usePersonImage') || 'Use person image'
                    : t('reportCard.useReportImage') || 'Use report image'}
                </Button>
              </Box>
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

                handleInputChange({ target: { name: 'national_code', value } })
              }}
              margin='normal'
              required
              slotProps={{
                input: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 10 }
              }}
              error={formData.national_code.length > 0 && formData.national_code.length !== 10}
              helperText={
                formData.national_code.length > 0 && formData.national_code.length !== 10
                  ? t('access.addPersonModal.nationalCodeLimit')
                  : ''
              }
            />
            <FormControl margin='normal' fullWidth style={{ mb: 2, mt: '16px' }}>
              <InputLabel id='gender-label'>{t('reportCard.gender')}</InputLabel>
              <Select
                labelId='gender-label'
                name='gender_id'
                value={formData.gender_id}
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
                value={formData.access_id}
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
            <Button variant='contained' onClick={handleFormSubmit}>
              {t('reportCard.update')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}
