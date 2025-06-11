'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'

// Icons
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

// Components
import SEO from '@/components/SEO'
import CustomTextField from '@/@core/components/mui/TextField'

// Hooks
import { useTranslation } from '@/translations/useTranslation'

// Mock data for development
const mockUsers = [
  {
    id: 1,
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    avatar: '/images/avatars/1.png',
    role: 'مدیر',
    status: 'فعال',
    phone: '+1 (123) 456-7890',
    address: '123 Main St, New York, NY 10001',
    bio: 'Frontend developer with expertise in React, Next.js, and Material UI.'
  },
  {
    id: 2,
    fullName: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    avatar: '/images/avatars/2.png',
    role: 'کاربر عادی',
    status: 'فعال',
    phone: '+1 (234) 567-8901',
    address: '456 Oak St, Los Angeles, CA 90001',
    bio: 'Backend developer specializing in Node.js and Python.'
  }
]

export default function UsersPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [users, setUsers] = useState(mockUsers)
  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const [newUser, setNewUser] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    role: 'user',
    status: 'inactive',
    avatar: null
  })

  // API functions (commented until API is ready)
  /*
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const addUser = async (userData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      const data = await response.json()
      setUsers([...users, data])
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  const deleteUser = async (userId) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
  */

  const handleOpenAddModal = () => setOpenAddModal(true)

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setNewUser({
      fullName: '',
      username: '',
      email: '',
      phone: '',
      address: '',
      bio: '',
      role: 'user',
      status: 'inactive',
      avatar: null
    })
    setSelectedImage(null)
  }

  const handleInputChange = e => {
    const { name, value } = e.target

    setNewUser(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      const previewUrl = URL.createObjectURL(file)

      setSelectedImage(previewUrl)
      setNewUser(prev => ({
        ...prev,
        avatar: file
      }))
    }
  }

  const handleAddUser = async e => {
    e.preventDefault()

    // TODO: Implement API call
    // await addUser(newUser)
    setUsers([...users, { ...newUser, id: users.length + 1 }])
    handleCloseAddModal()
  }

  const handleDeleteUser = async userId => {
    if (window.confirm(t('users.confirmDelete'))) {
      // TODO: Implement API call
      // await deleteUser(userId)
      setUsers(users.filter(user => user.id !== userId))
    }
  }

  const handleEditUser = userId => {
    router.push(`/users/users-edit/${userId}`)
  }

  return (
    <Box sx={{ p: 4 }}>
      <SEO
        title='مدیریت کاربران | سیستم تشخیص چهره دیانا'
        description='مدیریت کاربران سیستم تشخیص چهره دیانا'
        keywords='مدیریت کاربران, کاربران, سیستم تشخیص چهره دیانا'
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4'>{t('users.title')}</Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenAddModal}>
          {t('users.addUser')}
        </Button>
      </Box>

      <Card elevation={0}>
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          {/* Desktop View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('users.avatar')}</TableCell>
                    <TableCell>{t('users.fullName')}</TableCell>
                    <TableCell>{t('users.username')}</TableCell>
                    <TableCell>{t('users.email')}</TableCell>
                    <TableCell>{t('users.role')}</TableCell>
                    <TableCell>{t('users.status')}</TableCell>
                    <TableCell>{t('users.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Avatar src={user.avatar} alt={user.fullName} />
                      </TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant='body2' color='text.secondary'>
                            {t('users.status')}:
                          </Typography>
                          <Typography variant='body2' color={user.status === 'active' ? 'success.main' : 'error.main'}>
                            {t(`users.statusOptions.${user.status}`)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditUser(user.id)} color='primary'>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteUser(user.id)} color='error'>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile View */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {users.map(user => (
              <Card key={user.id} sx={{ mb: 2, p: 2 }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar src={user.avatar} alt={user.fullName} sx={{ width: 50, height: 50 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle1'>{user.fullName}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      @{user.username}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('users.email')}:
                    </Typography>
                    <Typography variant='body2'>{user.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('users.role')}:
                    </Typography>
                    <Typography variant='body2'>{user.role}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('users.status')}:
                    </Typography>
                    <Typography variant='body2' color={user.status === 'active' ? 'success.main' : 'error.main'}>
                      {t(`users.statusOptions.${user.status}`)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton onClick={() => handleEditUser(user.id)} color='primary'>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteUser(user.id)} color='error'>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Card>

      {/* Add User Modal */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth='md' fullWidth>
        <DialogTitle>{t('users.addUser')}</DialogTitle>
        <form onSubmit={handleAddUser}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Avatar src={selectedImage || '/images/avatars/1.png'} alt='Preview' sx={{ width: 100, height: 100 }} />
                <Button
                  component='label'
                  variant='outlined'
                  startIcon={<CloudUploadIcon />}
                  sx={{ width: 'fit-content', padding: '5px 15px' }}
                >
                  {t('users.uploadAvatar')}
                  <input type='file' hidden onChange={handleImageUpload} accept='image/*' />
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <CustomTextField
                  label={t('users.fullName')}
                  name='fullName'
                  value={newUser.fullName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                <CustomTextField
                  label={t('users.username')}
                  name='username'
                  value={newUser.username}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <CustomTextField
                  label={t('users.email')}
                  name='email'
                  type='email'
                  value={newUser.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                <CustomTextField
                  label={t('users.phone')}
                  name='phone'
                  value={newUser.phone}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Box>

              <CustomTextField
                label={t('users.address')}
                name='address'
                value={newUser.address}
                onChange={handleInputChange}
                fullWidth
                required
              />

              <CustomTextField
                label={t('users.bio')}
                name='bio'
                value={newUser.bio}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
              />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('users.role')}</InputLabel>
                  <Select name='role' value={newUser.role} onChange={handleInputChange} label={t('users.role')}>
                    <MenuItem value='admin'>{t('users.roleOptions.admin')}</MenuItem>
                    <MenuItem value='user'>{t('users.roleOptions.user')}</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={newUser.status === 'active'}
                      onChange={e => {
                        setNewUser(prev => ({
                          ...prev,
                          status: e.target.checked ? 'active' : 'inactive'
                        }))
                      }}
                    />
                  }
                  label={t(`users.statusOptions.${newUser.status}`)}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddModal}>{t('common.cancel')}</Button>
            <Button type='submit' variant='contained'>
              {t('users.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
