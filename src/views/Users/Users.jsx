'use client'

import { useEffect, useState, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import useUsers from '@/hooks/useUsers'
import UserDetailModal from '@/views/Users/UserDetailModal'
import AddUserModal from './AddUserModal'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'
import usePagination from '@/hooks/usePagination'
import { commonStyles } from '@/@core/styles/commonStyles'
import useHasPermission from '@/utils/HasPermission'

const per_page_OPTIONS = [5, 10, 15, 20]

function UsersContent({ initialPage = 1, initialper_page = 10 }) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  const hasAddPermission = useHasPermission('createUser')
  const hasUpdatePermission = useHasPermission('updateUser')
  const hasDeletePermission = useHasPermission('deleteUser')

  const { page, per_page, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(
    initialPage,
    initialper_page
  )

  const { users = [], total, isLoading, addUser, deleteUser } = useUsers({ page, per_page })

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

  const handleDeleteClick = user => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const getFullName = user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()

    return fullName || user.username
  }

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO
        title='مدیریت کاربران | سیستم تشخیص چهره دیانا'
        description='مدیریت کاربران سیستم تشخیص چهره دیانا'
        keywords='مدیریت کاربران, کاربران, سیستم تشخیص چهره دیانا'
      />
      <UserDetailModal open={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{t('users.deleteUser')}</DialogTitle>
        <DialogContent>
          <Typography>{t('users.deleteConfirm', { name: userToDelete ? getFullName(userToDelete) : '' })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t('common.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained'>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <PageHeader
        title={t('users.title')}
        actionButton={hasAddPermission ? t('users.addUser') : null}
        actionButtonProps={{ onClick: handleOpenAddModal, startIcon: <AddIcon />, disabled: !hasAddPermission }}
      />
      <Card
        elevation={0}
        sx={{ ...commonStyles.transparentCard, overflow: 'visible', backgroundColor: '#00000000', boxShadow: 'none' }}
      >
        <Box sx={{ display: 'contents', p: { xs: 2, sm: 4 }, overflow: 'visible' }}>
          {isLoading ? (
            <LoadingState message={t('users.loading')} />
          ) : users.length === 0 ? (
            <EmptyState message={t('users.noData')} />
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(auto-fill, minmax(260px, 1fr))',
                    sm: 'repeat(auto-fill, minmax(280px, 1fr))'
                  },
                  gap: 3,
                  alignItems: 'stretch',
                  overflow: 'visible'
                }}
              >
                {users.map(user => (
                  <Card
                    key={user.id}
                    elevation={0}
                    onMouseEnter={() => setHoveredId(user.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedUser(user)}
                    sx={{
                      borderRadius: 2,
                      width: '100%',
                      aspectRatio: '16 / 9',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '5 8px 32px rgba(0,0,0,0.08)',
                      transform: 'translateY(0)',
                      transition: 'box-shadow .25s ease, transform .25s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 24px 54px rgba(0,0,0,0.2)',
                        zIndex: 2,
                        cursor: 'pointer'
                      }
                    }}
                  >
                    {user.avatar ? (
                      <Box
                        component='img'
                        src={user.avatar}
                        alt={getFullName(user)}
                        sx={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          bgcolor: 'background.default'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'background.default'
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 72, color: 'primary.main', opacity: 0.6 }} />
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
                        borderBottomLeftRadius: 'inherit',
                        borderBottomRightRadius: 'inherit',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'row', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography
                          variant='subtitle2'
                          sx={{
                            fontSize: 16,
                            fontWeight: 600,
                            flexGrow: 1,
                            color: 'primary.main',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {getFullName(user)}
                        </Typography>
                      </Box>
                      <Chip
                        size='small'
                        label={t(`users.statusOptions.${user.is_active ? 'active' : 'inactive'}`)}
                        color={user.is_active ? 'success' : 'error'}
                        variant='outlined'
                      />
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        display: 'flex',
                        gap: 0.5,
                        bgcolor: 'rgba(17,17,17,0.35)',
                        backdropFilter: 'blur(6px)',
                        borderRadius: 999,
                        p: 0.5,
                        opacity: hoveredId === user.id ? 1 : 0,
                        transform: hoveredId === user.id ? 'translateY(0)' : 'translateY(-6px)',
                        transition: 'opacity .2s ease, transform .2s ease',
                        pointerEvents: hoveredId === user.id ? 'auto' : 'none'
                      }}
                    >
                      {hasUpdatePermission && (
                        <IconButton
                          size='small'
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedUser(user)
                          }}
                          sx={{ color: 'common.white' }}
                          aria-label={t('users.editUser')}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      )}
                      {hasDeletePermission && (
                        <IconButton
                          size='small'
                          sx={{ color: 'error.light' }}
                          aria-label={t('users.deleteUser')}
                          onClick={e => {
                            e.stopPropagation()
                            handleDeleteClick(user)
                          }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      )}
                    </Box>
                  </Card>
                ))}
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
