'use client'

import { useEffect, useState, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

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
  Avatar,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import useUsers from '@/hooks/useUsers'
import UserDetailModal from '@/components/UserDetailModal'
import AddUserModal from './AddUserModal'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'
import usePagination from '@/hooks/usePagination'
import { commonStyles } from '@/@core/styles/commonStyles'

const per_page_OPTIONS = [5, 10, 15, 20]

function UsersContent({ initialPage = 1, initialper_page = 10 }) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const { page, per_page, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(
    initialPage,
    initialper_page
  )

  const { users = [], total, isLoading, addUser } = useUsers({ page, per_page })

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    params.set('page', page.toString())
    params.set('per_page', per_page.toString())
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [page, per_page, router, searchParams])

  const handleOpenAddModal = () => setOpenAddModal(true)

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
  }

  const handleAddUser = async userData => {
    await addUser(userData)
  }

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO
        title='مدیریت کاربران | سیستم تشخیص چهره دیانا'
        description='مدیریت کاربران سیستم تشخیص چهره دیانا'
        keywords='مدیریت کاربران, کاربران, سیستم تشخیص چهره دیانا'
      />
      <UserDetailModal open={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />
      <PageHeader
        title={t('users.title')}
        actionButton={t('users.addUser')}
        actionButtonProps={{ onClick: handleOpenAddModal, startIcon: <AddIcon /> }}
      />
      <Card elevation={0} sx={commonStyles.transparentCard}>
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
                          <TableCell sx={{ justifyContent:'center', textAlign: 'center' }}>
                            <Avatar src={user.avatar || '/images/avatars/1.png'} alt={user.full_name} />
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
      {users?.length > 0 && (
        <PaginationControls
              page={page}
          total={total || 0}
          per_page={per_page}
          per_pageOptions={perPageOptions}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          itemsPerPageLabel={t('access.itemsPerPage')}
        />
      )}
      <AddUserModal open={openAddModal} onClose={handleCloseAddModal} onSubmit={handleAddUser} isLoading={isLoading} />
    </Box>
  )
}

export default function Users() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <UsersContent />
    </Suspense>
  )
}
