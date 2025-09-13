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
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SortIcon from '@mui/icons-material/Sort'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import useShifts from '@/hooks/useShifts'
import ShiftAdd from './ShiftAddModal'
import ShiftUpdate from './ShiftUpdateModal'
import ShiftDetail from './ShiftDetail'
import ShiftDeleteModal from './ShiftDeleteModal'
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
  { value: 'name', label: 'نام شیفت' },
  { value: 'start_time', label: 'ساعت شروع' },
  { value: 'end_time', label: 'ساعت پایان' },
  { value: 'created_at', label: 'تاریخ ایجاد' },
  { value: 'updated_at', label: 'تاریخ بروزرسانی' }
]

const SORT_ORDERS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' }
]

function ShiftsContent({ initialPage = 1, initialper_page = 10 }) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState(null)

  const [sort_by, setSortBy] = useState('id')
  const [sort_order, setSortOrder] = useState('asc')
  const [hoveredId, setHoveredId] = useState(null)

  const { page, per_page, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(
    initialPage,
    initialper_page
  )

  const {
    shifts = [],
    total,
    isLoading,
    addShift,
    updateShift,
    deleteShift
  } = useShifts({
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

  const handleOpenEditModal = shift => {
    setSelectedShift(shift)
    setOpenEditModal(true)
  }

  const handleCloseEditModal = () => {
    setOpenEditModal(false)
    setSelectedShift(null)
  }

  const handleOpenDeleteModal = shift => {
    setSelectedShift(shift)
    setOpenDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false)
    setSelectedShift(null)
  }

  const handleOpenDetailModal = shift => {
    if (selectedShift?.id !== shift.id) {
      setSelectedShift(shift)
    }

    setOpenDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false)

    // Don't reset selectedShift immediately to prevent flickering
  }

  const handleAddShift = async shiftData => {
    await addShift(shiftData)
  }

  const handleEditShift = async shiftData => {
    await updateShift(shiftData)
  }

  const handleDeleteShift = async () => {
    await deleteShift(selectedShift.id)
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

  const hasAddPermission = useHasPermission('addShift') || true
  const hasUpdatePermission = useHasPermission('updateShift') || true
  const hasDeletePermission = useHasPermission('deleteShift') || true

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO
        title='مدیریت شیفت‌ها | سیستم تشخیص چهره دیانا'
        description='مدیریت شیفت‌ها سیستم تشخیص چهره دیانا'
        keywords='مدیریت شیفت‌ها, شیفت‌ها, سیستم تشخیص چهره دیانا'
      />
      <PageHeader
        title={t('shifts.title')}
        actionButton={hasAddPermission ? t('shifts.addShift') : null}
        actionButtonProps={{ onClick: handleOpenAddModal, startIcon: <AddIcon />, disabled: !hasAddPermission }}
      />
      <Card
        elevation={0}
        sx={{ ...commonStyles.transparentCard, backgroundColor: '#00000000', overflow: 'visible', boxShadow: 'none' }}
      >
        <Box sx={{ display: 'contents', p: { xs: 2, sm: 4 } }}>
          {isLoading ? (
            <LoadingState message={t('shifts.loading')} />
          ) : shifts.length === 0 ? (
            <EmptyState message={t('shifts.noData')} />
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
                  backgroundColor: '#00000000'
                }}
              >
                {shifts.map(shift => (
                  <Card
                    key={shift.id}
                    elevation={0}
                    onMouseEnter={() => setHoveredId(shift.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleOpenDetailModal(shift)}
                    sx={{
                      borderRadius: 2,
                      height: 220,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 22px rgba(0,0,0,0.08)',
                      transform: 'translateY(0)',
                      transition: 'box-shadow .25s ease, transform .25s ease',
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: hoveredId === shift.id ? 'primary.main' : 'transparent',
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
                      <AccessTimeIcon sx={{ fontSize: 140, color: 'primary.main', opacity: 0.6 }} />
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
                        <AccessTimeIcon sx={{ fontSize: 20, color: 'primary.main' }} />
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
                          {shift.name}
                        </Typography>
                      </Box>
                      <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {t('shifts.users')}: {shift.users ? shift.users.length : 0}
                      </Typography>
                      <Chip label={`${t('shifts.id')}: ${shift.id}`} size='small' color='primary' variant='outlined' />
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
                        opacity: hoveredId === shift.id ? 1 : 0,
                        transform: hoveredId === shift.id ? 'translateY(0)' : 'translateY(-6px)',
                        transition: 'opacity .2s ease, transform .2s ease',
                        pointerEvents: hoveredId === shift.id ? 'auto' : 'none'
                      }}
                    >
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          handleOpenDetailModal(shift)
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
                            handleOpenEditModal(shift)
                          }}
                          sx={{ color: 'common.white' }}
                          aria-label={t('shifts.edit')}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      )}
                      {hasDeletePermission && (
                        <IconButton
                          size='small'
                          onClick={e => {
                            e.stopPropagation()
                            handleOpenDeleteModal(shift)
                          }}
                          sx={{ color: 'error.light' }}
                          aria-label={t('shifts.delete')}
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
                  <InputLabel>{t('shifts.sortBy')}</InputLabel>
                  <Select
                    value={sort_by}
                    label={t('shifts.sortBy')}
                    onChange={handleSortByChange}
                    startAdornment={<SortIcon sx={{ mr: 1 }} />}
                  >
                    {SORT_FIELDS.map(field => (
                      <MenuItem key={field.value} value={field.value}>
                        {t(`shifts.sortFields.${field.value}`)}
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
                  itemsPerPageLabel={t('shifts.itemsPerPage')}
                />

                <FormControl size='medium' sx={{ minWidth: 120 }}>
                  <InputLabel>{t('shifts.sortOrder')}</InputLabel>
                  <Select value={sort_order} label={t('shifts.sortOrder')} onChange={handleSortOrderChange}>
                    {SORT_ORDERS.map(order => (
                      <MenuItem key={order.value} value={order.value}>
                        {t(`shifts.sortOrders.${order.value}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </>
          )}
        </Box>
      </Card>

      {/* Add Shift Modal */}
      <ShiftAdd open={openAddModal} onClose={handleCloseAddModal} onSubmit={handleAddShift} isLoading={isLoading} />

      {/* Edit Shift Modal */}
      <ShiftUpdate
        open={openEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleEditShift}
        shift={selectedShift}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <ShiftDeleteModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteShift}
        shift={selectedShift}
        isLoading={isLoading}
      />

      {/* Shift Detail Modal */}
      {selectedShift?.id && (
        <ShiftDetail open={openDetailModal} onClose={handleCloseDetailModal} shiftId={selectedShift.id} />
      )}
    </Box>
  )
}

export default function Shifts() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ShiftsContent />
    </Suspense>
  )
}
