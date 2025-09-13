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
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import useUsers from '@/hooks/useUsers'
import useHasPermission from '@/utils/HasPermission'

const UserDetailModal = ({ open, onClose, user }) => {
  const hasUpdatePermission = useHasPermission('updateUser')

  const { t } = useTranslation()
  const { editUser, loading } = useUsers()

  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    is_active: false
  })

  useEffect(() => {
    if (user && open) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        is_active: user.is_active || false
      })
      setIsEditing(false)
    }
  }, [user, open])

  const handleInputChange = e => {
    const { name, value } = e.target

    // For phone number, only allow digits and limit to 11 characters
    if (name === 'phone_number') {
      const numericValue = value.replace(/\D/g, '').slice(0, 11)

      setFormData(prev => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    const dataToUpdate = {
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number,
      is_active: Boolean(formData.is_active)
    }

    await editUser({ id: user.id, data: dataToUpdate })
    setIsEditing(false)
    onClose()
  }

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      is_active: user.is_active || false
    })
    setIsEditing(false)
  }

  if (!user) return null

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username

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
              <Avatar
                src={user.avatar || '/images/avatars/1.png'}
                alt={fullName}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
            </Box>

            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant='h5'>{fullName}</Typography>
              <Typography variant='body2' color='text.secondary'>
                @{user.username}
              </Typography>
              {hasUpdatePermission && (
                <>
                  {!isEditing && (
                    <Button variant='contained' sx={{ mt: 4 }} fullWidth onClick={() => setIsEditing(true)}>
                      {t('profile.editProfile')}
                    </Button>
                  )}
                </>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('profile.status')}
                  </Typography>
                  <Typography variant='body2' color={user.is_active ? 'success.main' : 'error.main'}>
                    {t(`users.statusOptions.${user.is_active ? 'active' : 'inactive'}`)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('profile.email')}
                  </Typography>
                  <Typography variant='body2'>{user.email || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('profile.phone')}
                  </Typography>
                  <Typography variant='body2'>{user.phone_number || '-'}</Typography>
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
                    label={t('users.username')}
                    name='username'
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    required
                    sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                  />
                  <CustomTextField
                    label={t('users.email')}
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  <CustomTextField
                    label={t('users.firstName')}
                    name='first_name'
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                  />
                  <CustomTextField
                    label={t('users.lastName')}
                    name='last_name'
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                  />
                </Box>

                <CustomTextField
                  label={t('users.phoneNumber')}
                  name='phone_number'
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  fullWidth
                  error={formData.phone_number.length > 0 && formData.phone_number.length !== 11}
                  helperText={
                    formData.phone_number.length > 0 && formData.phone_number.length !== 11
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
                />

                {isEditing && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        disabled={loading}
                      />
                    }
                    label={t(`users.statusOptions.${formData.is_active ? 'active' : 'inactive'}`)}
                    sx={{ mb: 1 }}
                  />
                )}

                {isEditing && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button variant='outlined' onClick={handleCancel} disabled={loading}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant='contained'
                      onClick={handleSave}
                      disabled={loading || (formData.phone_number.length > 0 && formData.phone_number.length !== 11)}
                    >
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
