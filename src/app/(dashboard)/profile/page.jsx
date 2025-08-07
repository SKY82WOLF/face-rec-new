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
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Import Translation Hook
import { useTranslation } from '@/translations/useTranslation'

// SEO Component
import SEO from '@/components/SEO'

// API imports
import { getUser, updateUser } from '@/api/users'

const ProfilePage = () => {
  const { t } = useTranslation()

  // States
  const [userData, setUserData] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingUser, setFetchingUser] = useState(true)

  // Handle mounting and fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchingUser(true)

        // Get user from localStorage
        const storedUser = localStorage.getItem('user')

        if (!storedUser) {
          console.error('No user data found in localStorage')

          return
        }

        const user = JSON.parse(storedUser)

        if (!user.id) {
          console.error('No user ID found in localStorage')

          return
        }

        // Fetch user data from API
        const response = await getUser(user.id)

        const fetchedUser = response.results || response

        setUserData(fetchedUser)
        setFormData({
          username: fetchedUser.username || '',
          email: fetchedUser.email || '',
          first_name: fetchedUser.first_name || '',
          last_name: fetchedUser.last_name || '',
          phone_number: fetchedUser.phone_number || '',
          is_active: fetchedUser.is_active || false
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setFetchingUser(false)
        setMounted(true)
      }
    }

    fetchUserData()
  }, [])

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Handle form input change
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

  // Handle save
  const handleSave = async () => {
    try {
      setLoading(true)

      const updateData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        is_active: Boolean(formData.is_active)
      }

      await updateUser(userData.id, updateData)

      // Update local user data
      setUserData(prev => ({ ...prev, ...updateData }))
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      username: userData?.username || '',
      email: userData?.email || '',
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      phone_number: userData?.phone_number || '',
      is_active: userData?.is_active || false
    })
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

  // Don't render until mounted
  if (!mounted) {
    return null
  }

  if (fetchingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant='h6' color='text.secondary'>
          {t('messages.error')}
        </Typography>
      </Box>
    )
  }

  const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username

  return (
    <Box className='flex flex-col gap-6'>
      <SEO
        title='پروفایل کاربری | سیستم تشخیص چهره دیانا'
        description='مدیریت اطلاعات پروفایل کاربری در سیستم تشخیص چهره دیانا'
        keywords='پروفایل کاربری, حساب کاربری, مدیریت اطلاعات'
      />

      <Typography
        variant='h4'
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          position: 'relative',
          marginBottom: '10px',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: '0',
            width: '77px',
            height: '3px',
            backgroundColor: 'primary.main',
            borderRadius: '2px',
            marginBottom: '5px'
          }
        }}
      >
        {t('profile.title')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
        {/* User Info Card */}
        <Card sx={{ p: 6, width: { xs: '100%', md: '300px' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={userData.avatar || '/images/avatars/1.png'}
                alt={fullName}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
            </Box>

            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant='h5'>{fullName}</Typography>
              <Typography variant='body2' color='text.secondary'>
                @{userData.username}
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
                <Typography variant='body2' color={userData.is_active ? 'success.main' : 'error.main'}>
                  {t(`users.statusOptions.${userData.is_active ? 'active' : 'inactive'}`)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('profile.email')}
                </Typography>
                <Typography variant='body2'>{userData.email || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('profile.phone')}
                </Typography>
                <Typography variant='body2'>{userData.phone_number || '-'}</Typography>
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
                    label={t('users.firstName')}
                    name='first_name'
                    value={isEditing ? formData.first_name : userData.first_name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                  />
                  <CustomTextField
                    label={t('users.lastName')}
                    name='last_name'
                    value={isEditing ? formData.last_name : userData.last_name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  <CustomTextField
                    label={t('users.username')}
                    name='username'
                    value={isEditing ? formData.username : userData.username || ''}
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
                    value={isEditing ? formData.email : userData.email || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 16px)' } }}
                  />
                </Box>

                <CustomTextField
                  label={t('users.phoneNumber')}
                  name='phone_number'
                  value={isEditing ? formData.phone_number : userData.phone_number || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  fullWidth
                  error={formData.phone_number?.length > 0 && formData.phone_number?.length !== 11}
                  helperText={
                    formData.phone_number?.length > 0 && formData.phone_number?.length !== 11
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
                      disabled={loading || (formData.phone_number?.length > 0 && formData.phone_number?.length !== 11)}
                    >
                      {loading ? <CircularProgress size={24} /> : t('profile.saveChanges')}
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
