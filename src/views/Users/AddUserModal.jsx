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
  Switch
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'

const AddUserModal = ({ open, onClose, onSubmit, isLoading = false }) => {
  const { t } = useTranslation()
  const [selectedImage, setSelectedImage] = useState(null)

  const [newUser, setNewUser] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    is_active: false
  })

  const handleInputChange = e => {
    const { name, value } = e.target

    setNewUser(prev => ({ ...prev, [name]: value }))
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
    const formData = new FormData()

    formData.append('full_name', newUser.full_name)
    formData.append('username', newUser.username)
    formData.append('email', newUser.email)
    formData.append('password', newUser.password)
    formData.append('is_active', newUser.is_active)

    if (newUser.avatar) {
      formData.append('avatar', newUser.avatar)
    }

    await onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setNewUser({
      full_name: '',
      username: '',
      email: '',
      password: '',
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar src={selectedImage || '/images/avatars/1.png'} alt='Preview' sx={{ width: 100, height: 100 }} />
              <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />} disabled={isLoading}>
                {t('users.uploadAvatar')}
                <input type='file' hidden onChange={handleImageUpload} accept='image/*' />
              </Button>
            </Box>
            <CustomTextField
              label={t('users.fullName')}
              name='full_name'
              value={newUser.full_name}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
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
              !newUser.full_name.trim() ||
              !newUser.username.trim() ||
              !newUser.email.trim() ||
              !newUser.password.trim()
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
