'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'

// Import Translation Hook
import { useTranslation } from '@/translations/useTranslation'

// SEO Component
import SEO from '@/components/SEO'

export default function UserEditClient({ initialUser }) {
  const { t } = useTranslation()
  const router = useRouter()

  // States
  const [userData, setUserData] = useState({
    ...initialUser,
    status: initialUser.status || 'inactive',
    role: initialUser.role || 'user'
  })

  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    ...initialUser,
    status: initialUser.status || 'inactive',
    role: initialUser.role || 'user'
  })

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

  // Handle form input change
  const handleInputChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle save
  const handleSave = async () => {
    // TODO: Implement API call
    // try {
    //   await fetch(`/api/users/${userData.id}`, {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(formData)
    //   })
    //   setUserData(formData)
    //   setIsEditing(false)
    // } catch (error) {
    //   console.error('Error updating user:', error)
    // }

    // Mock update for development
    setUserData(formData)
    setIsEditing(false)
  }

  // Handle cancel
  const handleCancel = () => {
    setFormData(userData)
    setIsEditing(false)
  }

  // Handle file upload for avatar
  const handleAvatarChange = e => {
    const file = e.target.files[0]

    if (file) {
      const previewUrl = URL.createObjectURL(file)

      setSelectedImage(previewUrl)
      setFormData(prev => ({
        ...prev,
        avatar: file
      }))
    }
  }

  return (
    <Box className='flex flex-col gap-6'>
      <SEO
        title={t('users.userEdit.title')}
        description={t('users.userEdit.description')}
        keywords={t('users.userEdit.keywords')}
      />

      <Typography variant='h4'>{t('users.editUser')}</Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
        {/* User Info Card */}
        <Card sx={{ p: { xs: 3, sm: 6 }, width: { xs: '100%', md: '300px' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={isEditing ? selectedImage || formData.avatar : userData.avatar}
                alt={userData.fullName}
                sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 } }}
              />
              {isEditing && (
                <Button
                  component='label'
                  variant='outlined'
                  startIcon={<i className='tabler-camera' />}
                  sx={{ width: 'fit-content' }}
                >
                  {t('users.userEdit.actions.uploadAvatar')}
                  <input type='file' accept='image/*' style={{ display: 'none' }} onChange={handleAvatarChange} />
                </Button>
              )}
            </Box>

            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant='h5' sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {userData.fullName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                @{userData.username}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                {t(`users.roleOptions.${userData.role}`)}
              </Typography>

              {!isEditing && (
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-edit' />}
                  sx={{ mt: 4 }}
                  fullWidth
                  onClick={() => setIsEditing(true)}
                >
                  {t('users.userEdit.actions.edit')}
                </Button>
              )}
            </Box>

            <Divider sx={{ width: '100%', my: 2 }} />

            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('users.status')}
                </Typography>
                <Typography variant='body2' color={userData.status === 'active' ? 'success.main' : 'error.main'}>
                  {t(`users.statusOptions.${userData.status}`)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('users.role')}
                </Typography>
                <Typography variant='body2'>{t(`users.roleOptions.${userData.role}`)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('users.userEdit.userInfo.email')}
                </Typography>
                <Typography variant='body2'>{userData.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('users.userEdit.userInfo.phone')}
                </Typography>
                <Typography variant='body2'>{userData.phone}</Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Main Content */}
        <Card sx={{ p: 0, flexGrow: 1 }}>
          <Box sx={{ p: { xs: 3, sm: 6 } }}>
            <Typography variant='h6' sx={{ mb: 4, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              {t('users.userEdit.accountDetails.title')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
                <CustomTextField
                  label={t('users.userEdit.accountDetails.fullName')}
                  name='fullName'
                  value={isEditing ? formData.fullName : userData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  fullWidth
                  required
                />
                <CustomTextField
                  label={t('users.userEdit.accountDetails.username')}
                  name='username'
                  value={isEditing ? formData.username : userData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  fullWidth
                  required
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
                <CustomTextField
                  label={t('users.userEdit.accountDetails.email')}
                  name='email'
                  type='email'
                  value={isEditing ? formData.email : userData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  fullWidth
                  required
                />
                <CustomTextField
                  label={t('users.userEdit.accountDetails.phone')}
                  name='phone'
                  value={isEditing ? formData.phone : userData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  fullWidth
                  required
                />
              </Box>

              <CustomTextField
                label={t('users.userEdit.accountDetails.address')}
                name='address'
                value={isEditing ? formData.address : userData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                required
              />

              <CustomTextField
                label={t('users.userEdit.accountDetails.bio')}
                name='bio'
                value={isEditing ? formData.bio : userData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={4}
              />

              {isEditing && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('users.role')}</InputLabel>
                    <Select name='role' value={formData.role} onChange={handleInputChange} label={t('users.role')}>
                      <MenuItem value='admin'>{t('users.roleOptions.admin')}</MenuItem>
                      <MenuItem value='user'>{t('users.roleOptions.user')}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.status === 'active'}
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            status: e.target.checked ? 'active' : 'inactive'
                          }))
                        }}
                      />
                    }
                    label={t(`users.statusOptions.${formData.status}`)}
                  />
                </Box>
              )}

              {isEditing && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button variant='outlined' onClick={handleCancel}>
                    {t('users.userEdit.actions.cancel')}
                  </Button>
                  <Button variant='contained' onClick={handleSave}>
                    {t('users.userEdit.actions.save')}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
