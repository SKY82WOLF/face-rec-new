'use client'

import { useState, Suspense } from 'react'

import {
  Box,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Stack,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import useUsers from '@/hooks/useUsers'
import UserDetailModal from '@/components/UserDetailModal'
import AddUserModal from './AddUserModal'

// New reusable components
import PageHeader from '@/components/ui/PageHeader'
import LoadingState from '@/components/ui/LoadingState'
import EmptyState from '@/components/ui/EmptyState'
import PaginationControls from '@/components/ui/PaginationControls'

// Custom hooks
import usePagination from '@/hooks/usePagination'

// Common styles
import { commonStyles } from '@/@core/styles/commonStyles'

function UsersContent() {
  const { t } = useTranslation()

  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Using custom pagination hook
  const { page, per_page, handlePageChange, handlePerPageChange } = usePagination()

  const { users = [], total, isLoading, addUser } = useUsers({ page, per_page })

  const handleOpenAddModal = () => setOpenAddModal(true)
  const handleCloseAddModal = () => setOpenAddModal(false)
  const handleAddUser = async userData => await addUser(userData)

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO
        title='مدیریت کاربران | سیستم تشخیص چهره دیانا'
        description='مدیریت کاربران سیستم تشخیص چهره دیانا'
        keywords='مدیریت کاربران, کاربران, سیستم تشخیص چهره دیانا'
      />

      <UserDetailModal open={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />

      {/* Using reusable PageHeader component */}
      <PageHeader
        title={t('users.title')}
        actionButton={t('users.addUser')}
        actionButtonProps={{
          startIcon: <AddIcon />,
          onClick: handleOpenAddModal
        }}
      />

      <Card sx={commonStyles.transparentCard}>
        <Box sx={{ display: 'contents', p: { xs: 2, sm: 4 } }}>
          {isLoading ? (
            <LoadingState message={t('users.loading')} />
          ) : users.length === 0 ? (
            <EmptyState message={t('users.noData')} />
          ) : (
            <>
              {/* Desktop Table */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={commonStyles.tableCellCenter}>{t('users.avatar')}</TableCell>
                        <TableCell sx={commonStyles.tableCellCenter}>{t('users.fullName')}</TableCell>
                        <TableCell sx={commonStyles.tableCellCenter}>{t('users.username')}</TableCell>
                        <TableCell sx={commonStyles.tableCellCenter}>{t('users.email')}</TableCell>
                        <TableCell sx={commonStyles.tableCellCenter}>{t('users.status')}</TableCell>
                        <TableCell sx={commonStyles.tableCellCenter}>{t('users.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id} hover>
                          <TableCell sx={commonStyles.tableCellCenter}>
                            <Avatar src={user.avatar || '/images/avatars/1.png'} alt={user.full_name} />
                          </TableCell>
                          <TableCell sx={commonStyles.tableCellCenter}>{user.full_name}</TableCell>
                          <TableCell sx={commonStyles.tableCellCenter}>{user.username}</TableCell>
                          <TableCell sx={commonStyles.tableCellCenter}>{user.email}</TableCell>
                          <TableCell sx={commonStyles.tableCellCenter}>
                            <Typography
                              variant='body2'
                              color={user.is_active ? 'success.main' : 'error.main'}
                              sx={{ fontWeight: 600 }}
                            >
                              {t(`users.statusOptions.${user.is_active ? 'active' : 'inactive'}`)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={commonStyles.tableCellCenter}>
                            <Box sx={commonStyles.actionButtonsContainer}>
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
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Stack spacing={2}>
                  {users.map(user => (
                    <Card
                      key={user.id}
                      variant='outlined'
                      sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Avatar
                          alt={user.full_name}
                          src={user.avatar || '/images/avatars/1.png'}
                          sx={{ width: 60, height: 60 }}
                        />
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <i className='tabler-user' style={{ marginRight: '8px' }} />
                            <Typography variant='body2'>{user.full_name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <i className='tabler-at' style={{ marginRight: '8px' }} />
                            <Typography variant='body2'>{user.username}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <i className='tabler-mail' style={{ marginRight: '8px' }} />
                            <Typography variant='caption'>{user.email}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              px: 1
                            }}
                          >
                            <i
                              className={user.is_active ? 'tabler-lock-open' : 'tabler-lock'}
                              style={{ color: user.is_active ? 'green' : 'red', marginRight: '5px' }}
                            />
                            <Typography variant='body2' color={user.is_active ? 'green' : 'red'}>
                              {t(`users.statusOptions.${user.is_active ? 'active' : 'inactive'}`)}
                            </Typography>
                          </Box>
                          <Box>
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
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Card>

      {/* Using reusable PaginationControls component */}
      {users?.length > 0 && (
        <PaginationControls
          page={page}
          total={total}
          per_page={per_page}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          itemsPerPageLabel={t('access.itemsPerPage')}
        />
      )}

      {/* Add User Modal */}
      <AddUserModal open={openAddModal} onClose={handleCloseAddModal} onSubmit={handleAddUser} isLoading={isLoading} />
    </Box>
  )
}

export default function UsersRefactored() {
  return (
    <Suspense fallback={<LoadingState />}>
      <UsersContent />
    </Suspense>
  )
}
