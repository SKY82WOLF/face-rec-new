'use client'

import { useState } from 'react'

import {
  Modal,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import { useSelector } from 'react-redux'

import { useAddPerson } from '@/hooks/usePersons'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import { useTranslation } from '@/translations/useTranslation'
import CustomTextField from '@/@core/components/mui/TextField'
import { commonStyles } from '@/@core/styles/commonStyles'

const AccessAddModal = ({ open, onClose }) => {
  const { t } = useTranslation()
  const [selectedImage, setSelectedImage] = useState(null)

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)

  const [newPerson, setNewPerson] = useState({
    first_name: '',
    last_name: '',
    national_code: '',
    access_id: 7, // Default to unknown
    gender_id: '',
    person_image: null,
    last_person_image: '',
    feature_vector: '',
    index: '',
    last_person_report_id: '',
    image_quality: ''
  })

  const addPersonMutation = useAddPerson()

  const handleInputChange = e => {
    const { name, value, checked } = e.target

    setNewPerson(prev => ({
      ...prev,
      [name]: name === 'access_id' ? value : value
    }))
  }

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      const previewUrl = URL.createObjectURL(file)

      setSelectedImage(previewUrl)
      setNewPerson(prev => ({
        ...prev,
        person_image: file
      }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const submitData = {
        ...newPerson,
        access_id: newPerson.access_id
      }

      await addPersonMutation.mutateAsync(submitData)
      handleClose()
    } catch (error) {
      console.error('Failed to add person:', error)
    }
  }

  const handleClose = () => {
    setNewPerson({
      first_name: '',
      last_name: '',
      national_code: '',
      access_id: '', // Reset to default
      gender_id: '',
      person_image: null
    })
    setSelectedImage(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby='add-person-modal'>
      <Box sx={commonStyles.modalContainer}>
        <Typography variant='h6' component='h2' gutterBottom>
          {t('access.addPersonModal.title')}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
            <Box
              component='img'
              src={selectedImage || '/images/avatars/1.png'}
              alt='Preview'
              sx={{
                width: 150,
                height: 150,
                borderRadius: '10%',
                objectFit: 'cover',
                mb: 2
              }}
            />
            <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />} sx={{ mb: 2 }}>
              {t('access.addPersonModal.uploadImage')}
              <input type='file' hidden onChange={handleImageUpload} accept='image/*' />
            </Button>
          </Box>
          <CustomTextField
            fullWidth
            label={t('access.addPersonModal.name')}
            name='first_name'
            value={newPerson.first_name}
            onChange={handleInputChange}
            margin='normal'
            required
          />
          <CustomTextField
            fullWidth
            label={t('access.addPersonModal.lastName')}
            name='last_name'
            value={newPerson.last_name}
            onChange={handleInputChange}
            margin='normal'
            required
          />
          <CustomTextField
            fullWidth
            label={t('access.addPersonModal.nationalCode')}
            name='national_code'
            value={newPerson.national_code}
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
            error={newPerson.national_code.length > 0 && newPerson.national_code.length !== 10}
            helperText={
              newPerson.national_code.length > 0 && newPerson.national_code.length !== 10
                ? t('access.addPersonModal.nationalCodeLimit')
                : ''
            }
          />
          <FormControl fullWidth margin='normal'>
            <InputLabel>{t('access.addPersonModal.gender')}</InputLabel>
            <Select
              name='gender_id'
              value={newPerson.gender_id}
              onChange={handleInputChange}
              label={t('access.addPersonModal.gender')}
              required
            >
              {genderTypes?.data?.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.translate?.trim() || type.title?.trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin='normal'>
            <InputLabel>{t('access.addPersonModal.access')}</InputLabel>
            <Select
              name='access_id'
              value={newPerson.access_id}
              onChange={handleInputChange}
              label={t('access.addPersonModal.access')}
              required
            >
              {accessTypes?.data?.filter(type => type.id !== 7).map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.translate?.trim() || type.title?.trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleClose}>{t('access.addPersonModal.cancel')}</Button>
            <Button type='submit' variant='contained'>
              {t('access.addPersonModal.add')}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  )
}

export default AccessAddModal
