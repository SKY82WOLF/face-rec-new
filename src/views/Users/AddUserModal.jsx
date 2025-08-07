'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  FormControlLabel,
  Switch,
  FormHelperText
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'

const AddUserModal = ({ open, onClose, onSubmit, isLoading = false }) => {
  const { t } = useTranslation()
  const [selectedImage, setSelectedImage] = useState(null)

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    is_active: false
  })

  const handleInputChange = e => {
    const { name, value } = e.target

    // For phone number, only allow digits and limit to 11 characters
    if (name === 'phone_number') {
      const numericValue = value.replace(/\D/g, '').slice(0, 11)

      setNewUser(prev => ({ ...prev, [name]: numericValue }))
    } else {
      setNewUser(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      const previewUrl = URL.createObjectURL(file)

      setSelectedImage(previewUrl)
      setNewUser(prev => ({ ...prev, avatar: file }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const userData = {
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      phone_number: newUser.phone_number,
      is_active: newUser.is_active
    }

    if (newUser.avatar) {
      const formData = new FormData()

      formData.append('avatar', newUser.avatar)

      // Append all other fields as strings
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key])
      })

      await onSubmit(formData)
    } else {
      await onSubmit(userData)
    }

    handleClose()
  }

  const handleClose = () => {
    setNewUser({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      is_active: false
    })
    setSelectedImage(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{t('users.addUser')}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 0 }}>
            {/* <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar src={selectedImage || '/images/avatars/1.png'} alt='Preview' sx={{ width: 100, height: 100 }} />
              <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />} disabled={isLoading}>
                {t('users.uploadAvatar')}
                <input type='file' hidden onChange={handleImageUpload} accept='image/*' />
              </Button>
            </Box> */}
            <CustomTextField
              label={t('users.username')}
              name='username'
              value={newUser.username}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
            <CustomTextField
              label={t('users.email')}
              name='email'
              type='email'
              value={newUser.email}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
            <CustomTextField
              label={t('users.password')}
              name='password'
              type='password'
              value={newUser.password}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={isLoading}
              error={newUser.password.length > 0 && newUser.password.length < 8}
              helperText={
                newUser.password.length > 0 && newUser.password.length < 8 ? t('users.passwordMinLength') : ''
              }
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <CustomTextField
                label={t('users.firstName')}
                name='first_name'
                value={newUser.first_name}
                onChange={handleInputChange}
                fullWidth
                disabled={isLoading}
              />
              <CustomTextField
                label={t('users.lastName')}
                name='last_name'
                value={newUser.last_name}
                onChange={handleInputChange}
                fullWidth
                disabled={isLoading}
              />
            </Box>
            <CustomTextField
              label={t('users.phoneNumber')}
              name='phone_number'
              value={newUser.phone_number}
              onChange={handleInputChange}
              fullWidth
              disabled={isLoading}
              error={newUser.phone_number.length > 0 && newUser.phone_number.length !== 11}
              helperText={
                newUser.phone_number.length > 0 && newUser.phone_number.length !== 11
                  ? t('users.phoneNumberFormat')
                  : ''
              }
              slotProps={{
                input: {
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 11
                }
              }}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newUser.is_active}
                  onChange={e => setNewUser(prev => ({ ...prev, is_active: e.target.checked }))}
                  disabled={isLoading}
                />
              }
              label={t(`users.statusOptions.${newUser.is_active ? 'active' : 'inactive'}`)}
              sx={{ mb: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={
              isLoading ||
              !newUser.username.trim() ||
              !newUser.email.trim() ||
              !newUser.password.trim() ||
              (newUser.password.length > 0 && newUser.password.length < 8) ||
              (newUser.phone_number.length > 0 && newUser.phone_number.length !== 11)
            }
          >
            {isLoading ? t('common.loading') : t('users.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddUserModal
