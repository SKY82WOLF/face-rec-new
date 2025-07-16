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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SortIcon from '@mui/icons-material/Sort'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import useGroups from '@/hooks/useGroups'
import GroupsAdd from './GroupsAdd'
import GroupsUpdate from './GroupsUpdate'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'
import usePagination from '@/hooks/usePagination'
import { commonStyles } from '@/@core/styles/commonStyles'

const per_page_OPTIONS = [5, 10, 15, 20]

const SORT_FIELDS = [
  { value: 'id', label: 'شناسه' },
  { value: 'name', label: 'نام گروه' },
  { value: 'created_at', label: 'تاریخ ایجاد' },
  { value: 'updated_at', label: 'تاریخ بروزرسانی' }
]

const SORT_ORDERS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' }
]

function GroupsContent({ initialPage = 1, initialper_page = 10 }) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  const [sort_by, setSortBy] = useState('id')
  const [sort_order, setSortOrder] = useState('asc')

  const { page, per_page, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(
    initialPage,
    initialper_page
  )

  const {
    groups = [],
    total,
    isLoading,
    addGroup,
    updateGroup,
    deleteGroup
  } = useGroups({
    page,
    per_page,
    sort_by,
    sort_order
  })

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    params.set('page', page.toString())
    params.set('per_page', per_page.toString())
    params.set('sort_by', sort_by)
    params.set('sort_order', sort_order)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [page, per_page, sort_by, sort_order, router, searchParams])

  const handleOpenAddModal = () => setOpenAddModal(true)

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
  }

  const handleOpenEditModal = group => {
    setSelectedGroup(group)
    setOpenEditModal(true)
  }

  const handleCloseEditModal = () => {
    setOpenEditModal(false)
    setSelectedGroup(null)
  }

  const handleOpenDeleteModal = group => {
    setSelectedGroup(group)
    setOpenDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false)
    setSelectedGroup(null)
  }

  const handleAddGroup = async groupData => {
    await addGroup(groupData)
  }

  const handleEditGroup = async groupData => {
    await updateGroup(groupData)
  }

  const handleDeleteGroup = async () => {
    await deleteGroup(selectedGroup.id)
    handleCloseDeleteModal()
  }

  const handleSortByChange = event => {
    setSortBy(event.target.value)
  }

  const handleSortOrderChange = event => {
    setSortOrder(event.target.value)
  }

  const formatDateForShamsi = dateString => {
    if (!dateString) return null

    // Convert "20250712 05:28:18" to "2025-07-12T05:28:18"
    if (dateString.match(/^\d{8}\s\d{2}:\d{2}:\d{2}$/)) {
      return dateString.replace(/(\d{4})(\d{2})(\d{2})\s(\d{2}:\d{2}:\d{2})/, '$1-$2-$3T$4')
    }

    return dateString
  }

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO
        title='مدیریت گروه‌ها | سیستم تشخیص چهره دیانا'
        description='مدیریت گروه‌ها سیستم تشخیص چهره دیانا'
        keywords='مدیریت گروه‌ها, گروه‌ها, سیستم تشخیص چهره دیانا'
      />
      <PageHeader
        title={t('groups.title')}
        actionButton={t('groups.addGroup')}
        actionButtonProps={{ onClick: handleOpenAddModal, startIcon: <AddIcon /> }}
      />
      <Card elevation={0} sx={commonStyles.transparentCard}>
        <Box sx={{ display: 'contents', p: { xs: 2, sm: 4 } }}>
          {isLoading ? (
            <LoadingState message={t('groups.loading')} />
          ) : groups.length === 0 ? (
            <EmptyState message={t('groups.noData')} />
          ) : (
            <>
              {/* Desktop Table */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ textAlign: 'center' }}>{t('groups.id')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('groups.name')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('groups.createdAt')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('groups.updatedAt')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('groups.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groups.map(group => (
                        <TableRow key={group.id} hover>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip label={group.id} size='small' color='primary' />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography variant='body1' fontWeight={500}>
                              {group.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <ShamsiDateTime dateTime={formatDateForShamsi(group.created_at)} />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <ShamsiDateTime dateTime={formatDateForShamsi(group.updated_at)} />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title={t('groups.edit')}>
                                <IconButton onClick={() => handleOpenEditModal(group)} color='primary' size='small'>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('groups.delete')}>
                                <IconButton onClick={() => handleOpenDeleteModal(group)} color='error' size='small'>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
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
                  {groups.map(group => (
                    <Card key={group.id} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant='h6' fontWeight={500}>
                          {group.name}
                        </Typography>
                        <Chip label={`${t('groups.id')}: ${group.id}`} size='small' color='primary' />
                      </Box>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        {t('groups.createdAt')}: <ShamsiDateTime dateTime={formatDateForShamsi(group.created_at)} />
                      </Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        {t('groups.updatedAt')}: <ShamsiDateTime dateTime={formatDateForShamsi(group.updated_at)} />
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton onClick={() => handleOpenEditModal(group)} color='primary' size='small'>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDeleteModal(group)} color='error' size='small'>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Box>

              {/* Pagination and Controls */}
              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='center'>
                  <FormControl size='small' sx={{ minWidth: 120 }}>
                    <InputLabel>{t('groups.sortBy')}</InputLabel>
                    <Select
                      value={sort_by}
                      label={t('groups.sortBy')}
                      onChange={handleSortByChange}
                      startAdornment={<SortIcon sx={{ mr: 1 }} />}
                    >
                      {SORT_FIELDS.map(field => (
                        <MenuItem key={field.value} value={field.value}>
                          {t(`groups.sortFields.${field.value}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size='small' sx={{ minWidth: 120 }}>
                    <InputLabel>{t('groups.sortOrder')}</InputLabel>
                    <Select value={sort_order} label={t('groups.sortOrder')} onChange={handleSortOrderChange}>
                      {SORT_ORDERS.map(order => (
                        <MenuItem key={order.value} value={order.value}>
                          {t(`groups.sortOrders.${order.value}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <PaginationControls
                  page={page}
                  total={total || 0}
                  per_page={per_page}
                  per_pageOptions={perPageOptions}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                  itemsPerPageLabel={t('groups.itemsPerPage')}
                />
              </Box>
            </>
          )}
        </Box>
      </Card>

      {/* Add Group Modal */}
      <GroupsAdd open={openAddModal} onClose={handleCloseAddModal} onSubmit={handleAddGroup} isLoading={isLoading} />

      {/* Edit Group Modal */}
      <GroupsUpdate
        open={openEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleEditGroup}
        group={selectedGroup}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal} maxWidth='sm' fullWidth>
        <DialogTitle>{t('groups.deleteConfirmation')}</DialogTitle>
        <DialogContent>
          <Typography>{t('groups.confirmDeleteMessage', { name: selectedGroup?.name })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>{t('groups.cancel')}</Button>
          <Button onClick={handleDeleteGroup} variant='contained' color='error'>
            {t('groups.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default function Groups() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <GroupsContent />
    </Suspense>
  )
}
