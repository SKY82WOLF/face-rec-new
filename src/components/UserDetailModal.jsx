'use client'

import { useState, useEffect } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Avatar,
  Typography,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import useUsers from '@/hooks/useUsers'

const UserDetailModal = ({ open, onClose, user }) => {
  const { t } = useTranslation()
  const { editUser, loading } = useUsers()

  // const [activeTab, setActiveTab] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    avatar: '',
    role: '',
    status: '',
    phone: '',
    address: '',
    bio: ''
  })

  // // Password tab states
  // const [isPasswordShown, setIsPasswordShown] = useState(false)
  // const [currentPassword, setCurrentPassword] = useState('')
  // const [newPassword, setNewPassword] = useState('')
  // const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user && open) {
      const statusText = user.is_active ? t('profile.statusActive') : t('profile.statusInactive')

      setFormData({
        fullName: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || '/images/avatars/1.png',
        role: user.role || '',
        status: statusText,
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      })
      setIsEditing(false)

      // setActiveTab(0)
      // setCurrentPassword('')
      // setNewPassword('')
      // setConfirmPassword('')
      // setIsPasswordShown(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, open]) // No t in deps

  // const handleTabChange = (event, newValue) => {
  //   setActiveTab(newValue)
  // }

  const handleInputChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // const togglePasswordVisibility = () => {
  //   setIsPasswordShown(!isPasswordShown)
  // }

  // const handlePasswordChange = e => {
  //   e.preventDefault()

  //   if (newPassword !== confirmPassword) {
  //     alert(t('messages.passwordMismatch'))

  //     return
  //   }

  //   // TODO: اضافه کردن منطق تغییر پسورد با API
  //   alert(t('messages.passwordChanged'))
  //   setCurrentPassword('')
  //   setNewPassword('')
  //   setConfirmPassword('')
  // }

  const handleSave = async () => {
    const dataToUpdate = {
      full_name: formData.fullName,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      bio: formData.bio

    }

    await editUser(user.id, dataToUpdate)
    setIsEditing(false)
    onClose()
  }

  const handleCancel = () => {
    setFormData({
      fullName: user.full_name || '',
      username: user.username || '',
      email: user.email || '',
      avatar: user.avatar || '/images/avatars/1.png',
      role: user.role || '',
      status: user.is_active ? t('profile.statusActive') : t('profile.statusInactive'),
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || ''
    })
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth scroll='paper'>
      <DialogTitle>{t('users.userDetail')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
          {/* User Info Card */}
          <Box
            sx={{
              p: 6,
              width: { xs: '100%', md: 300 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar src={formData.avatar} alt={formData.fullName} sx={{ width: 120, height: 120, mb: 2 }} />
            </Box>

            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant='h5'>{formData.fullName}</Typography>
              <Typography variant='body2' color='text.secondary'>
                @{formData.username}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                {formData.role}
              </Typography>

              {!isEditing && (
                <Button variant='contained' sx={{ mt: 4 }} fullWidth onClick={() => setIsEditing(true)}>
                  {t('profile.editProfile')}
                </Button>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('profile.status')}
                  </Typography>
                  <Typography variant='body2'>{formData.status}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('profile.email')}
                  </Typography>
                  <Typography variant='body2'>{formData.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('profile.phone')}
                  </Typography>
                  <Typography variant='body2'>{formData.phone}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ flexGrow: 1, p: 0 }}>
              <Box sx={{ p: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <CustomTextField
                      label={t('profile.fullName')}
                      name='fullName'
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      fullWidth
                      required
                      sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                    />
                    <CustomTextField
                      label={t('profile.username')}
                      name='username'
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      fullWidth
                      required
                      sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <CustomTextField
                      label={t('profile.email')}
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      fullWidth
                      required
                      sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                    />
                    <CustomTextField
                      label={t('profile.phone')}
                      name='phone'
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      fullWidth
                      required
                      sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                    />
                  </Box>

                  <CustomTextField
                    label={t('profile.address')}
                    name='address'
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    required
                  />

                  <CustomTextField
                    label={t('profile.bio')}
                    name='bio'
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    multiline
                    rows={4}
                  />

                  {isEditing && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <Button variant='outlined' onClick={handleCancel} disabled={loading}>
                        {t('common.cancel')}
                      </Button>
                      <Button variant='contained' onClick={handleSave} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : t('profile.saveChanges')}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>{!isEditing && <Button onClick={onClose}>{t('common.close')}</Button>}</DialogActions>
    </Dialog>
  )
}

export default UserDetailModal
