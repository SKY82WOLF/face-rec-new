'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

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
  Avatar,
  FormControlLabel,
  Switch,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import SEO from '@/components/SEO'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import useUsers from '@/hooks/useUsers'
import UserDetailModal from '@/components/UserDetailModal'

const LIMIT_OPTIONS = [5, 10, 15, 20]

export default function UsersPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const offset = (page - 1) * limit

  const [newUser, setNewUser] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    is_active: false
  })

  const { users, isLoading, addUser } = useUsers(offset, limit)

  const handleOpenAddModal = () => setOpenAddModal(true)

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setNewUser({
      full_name: '',
      username: '',
      email: '',
      password: '',
      is_active: false
    })
    setSelectedImage(null)
  }

  const handleInputChange = e => {
    const { name, value } = e.target

    setNewUser(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      const previewUrl = URL.createObjectURL(file)

      setSelectedImage(previewUrl)
    }
  }

  const handleAddUser = async e => {
    e.preventDefault()
    await addUser(newUser)
    handleCloseAddModal()
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleLimitChange = event => {
    setLimit(event.target.value)
    setPage(1) // Reset to first page when changing limit
  }

  return (
    <Box sx={{ pt: 3 }}>
      <SEO
        title='مدیریت کاربران | سیستم تشخیص چهره دیانا'
        description='مدیریت کاربران سیستم تشخیص چهره دیانا'
        keywords='مدیریت کاربران, کاربران, سیستم تشخیص چهره دیانا'
      />
      <UserDetailModal open={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography
          variant='h4'
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            position: 'relative',
            marginBottom: '10px',
            flexGrow: 1,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 157,
              height: 3,
              backgroundColor: 'primary.main',
              borderRadius: '2px',
              marginBottom: 1
            }
          }}
        >
          {t('users.title')}
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenAddModal} sx={{ whiteSpace: 'nowrap' }}>
          {t('users.addUser')}
        </Button>
      </Box>

      <Card elevation={0}>
        <Box sx={{ display: 'contents', p: { xs: 2, sm: 4 } }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Typography variant='h6' color='text.secondary'>
                {t('users.noData') || 'هیچ کاربری یافت نشد'}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Desktop Table */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ textAlign: 'center' }}>{t('users.avatar')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('users.fullName')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('users.username')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('users.email')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('users.status')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('users.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id} hover>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Avatar src='/images/avatars/1.png' alt={user.full_name} />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{user.full_name}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{user.username}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{user.email}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography
                              variant='body2'
                              color={user.is_active ? 'success.main' : 'error.main'}
                              sx={{ fontWeight: 600 }}
                            >
                              {t(`users.statusOptions.${user.is_active ? 'active' : 'inactive'}`)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <IconButton
                                onClick={() => setSelectedUser(user)}
                                color='primary'
                                aria-label={t('users.editUser')}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton color='error' aria-label={t('users.deleteUser')}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Cards */}
              <Box sx={{ display: { xs: 'contents', md: 'none' } }}>
                {users.map(user => (
                  <Card key={user.id} sx={{ gap: 2, mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src='/images/avatars/1.png' alt={user.full_name} sx={{ width: 50, height: 50 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                          {user.full_name}
                        </Typography>
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
                          {t('users.status')}:
                        </Typography>
                        <Typography
                          variant='body2'
                          color={user.is_active ? 'success.main' : 'error.main'}
                          sx={{ fontWeight: 600 }}
                        >
                          {t(`users.statusOptions.${user.is_active ? 'active' : 'inactive'}`)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton
                        onClick={() => setSelectedUser(user)}
                        color='primary'
                        aria-label={t('users.editUser')}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color='error' aria-label={t('users.deleteUser')}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Card>
      {users?.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 3,
            gap: 2,
            p: 2
          }}
        >
          <FormControl sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel>{t('access.itemsPerPage')}</InputLabel>
            <Select value={limit} onChange={handleLimitChange} label={t('access.itemsPerPage')}>
              {LIMIT_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
            <Pagination
              count={page + (users.length === limit ? 1 : 0)}
              page={page}
              onChange={handlePageChange}
              color='primary'
              showFirstButton
              showLastButton
              size='small'
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            />
          </Box>
          <Box sx={{ width: { xs: 0, sm: 120 } }} /> {/* Spacer to balance the layout */}
        </Box>
      )}

      {/* Add User Modal */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth='md' fullWidth>
        <DialogTitle>{t('users.addUser')}</DialogTitle>
        <form onSubmit={handleAddUser}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Avatar src={selectedImage || '/images/avatars/1.png'} alt='Preview' sx={{ width: 100, height: 100 }} />
                <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />}>
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
              />
              <CustomTextField
                label={t('users.username')}
                name='username'
                value={newUser.username}
                onChange={handleInputChange}
                fullWidth
                required
              />
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
                label={t('users.password')}
                name='password'
                type='password'
                value={newUser.password}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newUser.is_active}
                    onChange={e => setNewUser(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                }
                label={t(`users.statusOptions.${newUser.is_active ? 'active' : 'inactive'}`)}
              />
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
