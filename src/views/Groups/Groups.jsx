'use client'

import { useEffect, useState, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import GroupIcon from '@mui/icons-material/Group'
import SortIcon from '@mui/icons-material/Sort'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import useGroups from '@/hooks/useGroups'
import GroupsAdd from './GroupsAddModal'
import GroupsUpdate from './GroupsUpdateModal'
import GroupDetail from './GroupDetail'
import GroupDeleteModal from './GroupDeleteModal'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'
import usePagination from '@/hooks/usePagination'
import { commonStyles } from '@/@core/styles/commonStyles'
import useHasPermission from '@/utils/HasPermission'

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
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  const [sort_by, setSortBy] = useState('id')
  const [sort_order, setSortOrder] = useState('asc')
  const [hoveredId, setHoveredId] = useState(null)

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

  const handleOpenDetailModal = group => {
    setSelectedGroup(group)
    setOpenDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false)
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

  const hasAddPermission = useHasPermission('addGroup')
  const hasUpdatePermission = useHasPermission('updateGroup')
  const hasDeletePermission = useHasPermission('deleteGroup')

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO
        title='مدیریت گروه‌ها | سیستم تشخیص چهره دیانا'
        description='مدیریت گروه‌ها سیستم تشخیص چهره دیانا'
        keywords='مدیریت گروه‌ها, گروه‌ها, سیستم تشخیص چهره دیانا'
      />
      <PageHeader
        title={t('groups.title')}
        actionButton={hasAddPermission ? t('groups.addGroup') : null}
        actionButtonProps={{ onClick: handleOpenAddModal, startIcon: <AddIcon />, disabled: !hasAddPermission }}
      />
      <Card elevation={0} sx={{ ...commonStyles.transparentCard, backgroundColor: '#00000000', overflow: 'visible',boxShadow:'none' }}>
        <Box sx={{ display: 'contents', p: { xs: 2, sm: 4 } }}>
          {isLoading ? (
            <LoadingState message={t('groups.loading')} />
          ) : groups.length === 0 ? (
            <EmptyState message={t('groups.noData')} />
          ) : (
            <>
              {/* Responsive Card Grid - auto-fill remaining space */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(auto-fill, minmax(260px, 1fr))',
                    sm: 'repeat(auto-fill, minmax(280px, 1fr))'
                  },
                  gap: 5,
                  alignItems: 'stretch',
                      overflow: 'visible',
                  backgroundColor:'#00000000'
                }}
              >
                {groups.map(group => (
                  <Card
                    key={group.id}
                    elevation={0}
                    onMouseEnter={() => setHoveredId(group.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleOpenDetailModal(group)}
                    sx={{
                      borderRadius: 2,
                      height: 220,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 22px rgba(0,0,0,0.08)',
                      transform: 'translateY(0)',
                      transition: 'box-shadow .25s ease, transform .25s ease',
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 24px 44px rgba(0,0,0,0.2)',
                        zIndex: 2,
                        cursor: 'pointer'
                      }
                    }}
                  >
                    {/* Watermark icon to avoid emptiness */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}
                    >
                      <GroupIcon sx={{ fontSize: 140, color: 'primary.main', opacity: 0.6 }} />
                    </Box>

                    {/* Bottom overlay info bar (like cameras) */}
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
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'row', gap: 1 }}>
                        <GroupIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography
                          variant='subtitle2'
                          sx={{
                            color: 'text.groupText',
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {group.name}
                        </Typography>
                      </Box>
                      <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {t('groups.users')}: {group.users ? group.users.length : 0}
                      </Typography>
                      <Chip label={`${t('groups.id')}: ${group.id}`} size='small' color='primary' variant='outlined' />
                    </Box>
                    {/* Floating actions */}
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
                        opacity: hoveredId === group.id ? 1 : 0,
                        transform: hoveredId === group.id ? 'translateY(0)' : 'translateY(-6px)',
                        transition: 'opacity .2s ease, transform .2s ease',
                        pointerEvents: hoveredId === group.id ? 'auto' : 'none'
                      }}
                    >
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          handleOpenDetailModal(group)
                        }}
                        sx={{ color: 'common.white' }}
                        aria-label={t('common.view')}
                      >
                        <VisibilityIcon fontSize='small' />
                      </IconButton>
                      {hasUpdatePermission && (
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          handleOpenEditModal(group)
                        }}
                        sx={{ color: 'common.white' }}
                        aria-label={t('groups.edit')}
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                      )}
                      {hasDeletePermission && (
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          handleOpenDeleteModal(group)
                        }}
                        sx={{ color: 'error.light' }}
                        aria-label={t('groups.delete')}
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                      )}
                    </Box>
                  </Card>
                ))}
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
                <FormControl size='medium' sx={{ mt: 2, minWidth: 120 }}>
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

                <PaginationControls
                  page={page}
                  total={total || 0}
                  per_page={per_page}
                  per_pageOptions={perPageOptions}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                  itemsPerPageLabel={t('groups.itemsPerPage')}
                />

                <FormControl size='medium' sx={{ minWidth: 120 }}>
                  <InputLabel>{t('groups.sortOrder')}</InputLabel>
                  <Select value={sort_order} label={t('groups.sortOrder')} onChange={handleSortOrderChange}>
                    {SORT_ORDERS.map(order => (
                      <MenuItem key={order.value} value={order.value}>
                        {t(`groups.sortOrders.${order.value}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
      <GroupDeleteModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteGroup}
        group={selectedGroup}
        isLoading={isLoading}
      />

      {/* Group Detail Modal */}
      {selectedGroup?.id && (
        <GroupDetail open={openDetailModal} onClose={handleCloseDetailModal} groupId={selectedGroup.id} />
      )}
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
