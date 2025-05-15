'use client'

// React Imports
import { useState, useEffect } from 'react'

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

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Import Translation Hook
import { useTranslation } from '@/translations/useTranslation'

// SEO Component
import SEO from '@/components/SEO'

const ProfilePage = () => {
  const { t } = useTranslation()

  // States
  const [userData, setUserData] = useState({
    fullName: 'جان دو',
    username: 'johndoe',
    email: 'admin@vuexy.com',
    avatar: '/images/avatars/1.png',
    role: 'مدیر',
    status: 'فعال',
    phone: '+1 (123) 456-7890',
    address: '123 خیابان اصلی، نیویورک، NY 10001',
    bio: 'توسعه‌دهنده فرانت‌اند با تخصص در React، Next.js و Material UI.'
  })

  const [activeTab, setActiveTab] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(userData)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Handle form input change
  const handleInputChange = e => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle save
  const handleSave = () => {
    setUserData(formData)
    setIsEditing(false)
  }

  // Handle cancel
  const handleCancel = () => {
    setFormData(userData)
    setIsEditing(false)
  }

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setIsPasswordShown(!isPasswordShown)
  }

  // Handle password change form
  const handlePasswordChange = e => {
    e.preventDefault()

    // Simple validation
    if (newPassword !== confirmPassword) {
      // In a real app, you'd handle this with proper validation and error messages
      alert(t('messages.passwordMismatch'))

      return
    }

    // Logic to change password would go here
    alert(t('messages.passwordChanged'))

    // Reset form
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  // Handle file upload for avatar
  const handleAvatarChange = e => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onload = e => {
        setFormData({
          ...formData,
          avatar: e.target.result
        })
      }

      reader.readAsDataURL(file)
    }
  }

  // Don't render until mounted
  if (!mounted) {
    return null
  }

  return (
    <Box className='flex flex-col gap-6'>
      <SEO
        title='پروفایل کاربری | سیستم تشخیص چهره دیانا'
        description='مدیریت اطلاعات پروفایل کاربری در سیستم تشخیص چهره دیانا'
        keywords='پروفایل کاربری, حساب کاربری, مدیریت اطلاعات'
      />

      <Typography variant='h4'>{t('profile.title')}</Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
        {/* User Info Card */}
        <Card sx={{ p: 6, width: { xs: '100%', md: '300px' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={isEditing ? formData.avatar : userData.avatar}
                alt={userData.fullName}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              {isEditing && (
                <Box
                  component='label'
                  htmlFor='avatar-upload'
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 0,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <i className='tabler-camera' style={{ color: 'white', fontSize: '1.2rem' }} />
                  <input
                    type='file'
                    id='avatar-upload'
                    accept='image/*'
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant='h5'>{userData.fullName}</Typography>
              <Typography variant='body2' color='text.secondary'>
                @{userData.username}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                {userData.role}
              </Typography>

              {!isEditing && (
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-edit' />}
                  sx={{ mt: 4 }}
                  fullWidth
                  onClick={() => setIsEditing(true)}
                >
                  {t('profile.editProfile')}
                </Button>
              )}
            </Box>

            <Divider sx={{ width: '100%', my: 2 }} />

            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('profile.status')}
                </Typography>
                <Typography variant='body2'>{userData.status}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('profile.email')}
                </Typography>
                <Typography variant='body2'>{userData.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('profile.phone')}
                </Typography>
                <Typography variant='body2'>{userData.phone}</Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Main Content */}
        <Card sx={{ p: 0, flexGrow: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label='profile tabs'>
              <Tab label={t('sidebar.profile')} />
              <Tab label={t('profile.security')} />
            </Tabs>
          </Box>

          {/* Account Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 6 }}>
              <Typography variant='h6' sx={{ mb: 4 }}>
                {t('profile.accountDetails')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  <CustomTextField
                    label={t('profile.fullName')}
                    name='fullName'
                    value={isEditing ? formData.fullName : userData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    required
                    sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                  />
                  <CustomTextField
                    label={t('profile.username')}
                    name='username'
                    value={isEditing ? formData.username : userData.username}
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
                    value={isEditing ? formData.email : userData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    required
                    sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                  />
                  <CustomTextField
                    label={t('profile.phone')}
                    name='phone'
                    value={isEditing ? formData.phone : userData.phone}
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
                  value={isEditing ? formData.address : userData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  fullWidth
                  required
                />

                <CustomTextField
                  label={t('profile.bio')}
                  name='bio'
                  value={isEditing ? formData.bio : userData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  fullWidth
                  multiline
                  rows={4}
                />

                {isEditing && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button variant='outlined' onClick={handleCancel}>
                      {t('common.cancel')}
                    </Button>
                    <Button variant='contained' onClick={handleSave}>
                      {t('profile.saveChanges')}
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Security Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 6 }}>
              <Typography variant='h6' sx={{ mb: 4 }}>
                {t('profile.changePassword')}
              </Typography>

              <form onSubmit={handlePasswordChange}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <CustomTextField
                    label={t('profile.currentPassword')}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    type={isPasswordShown ? 'text' : 'password'}
                    fullWidth
                    required
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton edge='end' onClick={togglePasswordVisibility}>
                              <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />

                  <CustomTextField
                    label={t('profile.newPassword')}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    type={isPasswordShown ? 'text' : 'password'}
                    fullWidth
                    required
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton edge='end' onClick={togglePasswordVisibility}>
                              <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />

                  <CustomTextField
                    label={t('profile.confirmPassword')}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    type={isPasswordShown ? 'text' : 'password'}
                    fullWidth
                    required
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton edge='end' onClick={togglePasswordVisibility}>
                              <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button type='submit' variant='contained'>
                      {t('profile.changePassword')}
                    </Button>
                  </Box>
                </Box>
              </form>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  )
}

export default ProfilePage
