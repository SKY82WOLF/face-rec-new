'use client'

import { useEffect, useState, useRef, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Grid,
  Paper
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SortIcon from '@mui/icons-material/Sort'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

import { useQueryClient } from '@tanstack/react-query'

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
import MotionContainer, { HoverWrapper } from '@/components/GSAP/MotionWrappers'

const per_page_OPTIONS = [5, 10, 15, 20]

const SORT_FIELDS = [
  { value: 'id', label: 'شناسه' },
  { value: 'title', label: 'عنوان' },
  { value: 'created_at', label: 'تاریخ ایجاد' },
  { value: 'updated_at', label: 'تاریخ بروزرسانی' }
]

const SORT_ORDERS = [
  { value: 'asc', label: 'صعودی' },
  { value: 'desc', label: 'نزولی' }
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

  // Convert sort_by and sort_order to order_by format
  const order_by = sort_order === 'desc' ? `-${sort_by}` : sort_by

  const {
    shifts = [],
    total,
    isLoading,
    addShift,
    updateShift,
    deleteShift,
    getShiftDetail
  } = useShifts({
    page,
    per_page,
    order_by
  })

  // refs arrays for GSAP motion wrappers
  const cardRefs = useRef([])
  const imageRefs = useRef([])
  const detailsRefs = useRef([])

  const queryClient = useQueryClient()

  // Ref used to prevent the auto-open effect from immediately re-opening the modal after close
  const skipAutoOpenRef = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    params.set('page', page.toString())
    params.set('per_page', per_page.toString())
    params.set('order_by', order_by)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [page, per_page, order_by, router, searchParams])

  // If navigated with ?shift_id=123 open that shift's detail modal
  useEffect(() => {
    const shiftIdParam = searchParams.get('shift_id')

    if (!shiftIdParam) return

    const id = Number(shiftIdParam)

    if (!id) return

    // If a skip flag was set in sessionStorage (cross-navigation), consume it and do not open
    try {
      if (typeof window !== 'undefined') {
        const s = sessionStorage.getItem('skip_shift_auto_open')

        if (s === '1') {
          sessionStorage.removeItem('skip_shift_auto_open')

          return
        }
      }
    } catch (err) {
      // ignore
    }

    // If we just closed the modal in this instance, skip auto-open once
    if (skipAutoOpenRef.current) {
      skipAutoOpenRef.current = false

      return
    }

    // fetch full shift detail and open modal
    (async () => {
      try {
        const full = await queryClient.fetchQuery({
          queryKey: ['shift', id],
          queryFn: () => getShiftDetail(id)
        })

        setSelectedShift(full)
      } catch (err) {
        setSelectedShift({ id })
      }

      setOpenDetailModal(true)
    })()
  }, [searchParams, queryClient, getShiftDetail])

  const handleOpenAddModal = () => setOpenAddModal(true)

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
  }

  const handleOpenEditModal = async shift => {
    // fetch (or reuse cached) full shift detail (includes persons) via react-query
    try {
      const full = await queryClient.fetchQuery({
        queryKey: ['shift', shift.id],
        queryFn: () => getShiftDetail(shift.id)
      })

      setSelectedShift(full)
    } catch (err) {
      // fallback to minimal shift data
      setSelectedShift(shift)
    }

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
    // Prevent the auto-open effect from immediately reopening the modal
    skipAutoOpenRef.current = true

    setOpenDetailModal(false)

    // Remove shift_id from URL if present so the modal does not reopen on URL change
    try {
      // also set a session flag so that a navigation-driven re-render in another tab/window won't reopen
      if (typeof window !== 'undefined') sessionStorage.setItem('skip_shift_auto_open', '1')

      const params = new URLSearchParams(searchParams)

      if (params.has('shift_id')) {
        params.delete('shift_id')

        const newQs = params.toString()

        if (newQs) router.replace(`?${newQs}`, { scroll: false })
        else router.replace('/shifts', { scroll: false })
      }
    } catch (err) {
      // ignore
    }

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

  const getActiveDays = shift => {
    if (!shift.days_times) return []

    return Object.keys(shift.days_times)
  }

  const translateDay = day => {
    const dayTranslations = {
      monday: 'دوشنبه',
      tuesday: 'سه‌شنبه',
      wednesday: 'چهارشنبه',
      thursday: 'پنج‌شنبه',
      friday: 'جمعه',
      saturday: 'شنبه',
      sunday: 'یکشنبه'
    }

    return dayTranslations[day] || day
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
                {shifts.map((shift, idx) => {
                  // ensure refs
                  cardRefs.current[idx] = cardRefs.current[idx] || { current: null }
                  imageRefs.current[idx] = imageRefs.current[idx] || { current: null }
                  detailsRefs.current[idx] = detailsRefs.current[idx] || { current: null }

                  return (
                    <MotionContainer key={shift.id} ref={cardRefs.current[idx]} index={idx} sx={{ width: '100%' }}>
                      <HoverWrapper
                        cardRef={cardRefs.current[idx]}
                        imageRef={imageRefs.current[idx]}
                        detailsRef={detailsRefs.current[idx]}
                      >
                        <Card
                          elevation={0}
                          onMouseEnter={() => setHoveredId(shift.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => handleOpenDetailModal(shift)}
                          sx={{
                            borderRadius: 2,
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
                          {/* Main card area with watermark icon */}
                          <Box
                            ref={el => (imageRefs.current[idx].current = el)}
                            data-gsap-image
                            sx={{
                              height: 140,
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              pointerEvents: 'none'
                            }}
                          >
                            <AccessTimeIcon sx={{ fontSize: 100, color: 'primary.main', opacity: 0.6 }} />
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

                          {/* Connected info section - no gap, same background */}
                          <Box
                            ref={el => (detailsRefs.current[idx].current = el)}
                            data-gsap-details
                            sx={{ p: 2, pt: 1 }}
                          >
                            {/* Shift title - big and centered */}
                            <Typography
                              variant='h5'
                              fontWeight={700}
                              sx={{
                                textAlign: 'center',
                                mb: 2,
                                fontSize: '1.25rem',
                                lineHeight: 1.2,
                                color: 'text.primary'
                              }}
                            >
                              {shift.title}
                            </Typography>

                            {/* Date range with icon */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                mb: 1.5,
                                justifyContent: 'center'
                              }}
                            >
                              <CalendarMonthIcon fontSize='small' color='primary' />
                              <Typography variant='body2' sx={{ fontSize: '0.85rem', textAlign: 'center' }}>
                                {t('shifts.from')} <ShamsiDateTime dateTime={shift.start_date} format='date' />{' '}
                                {t('shifts.to')} <ShamsiDateTime dateTime={shift.end_date} format='date' />
                              </Typography>
                            </Box>

                            {/* Status and ID section */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 2,
                                justifyContent: 'space-between',
                                flexWrap: 'wrap'
                              }}
                            >
                              <Chip
                                size='small'
                                label={shift.is_active ? t('shifts.active') : t('shifts.inactive')}
                                color={shift.is_active ? 'success' : 'default'}
                                sx={{ fontWeight: 500 }}
                              />
                              <Chip
                                label={`${t('shifts.id')}: ${shift.id}`}
                                size='small'
                                color='primary'
                                variant='outlined'
                                sx={{ fontWeight: 500 }}
                              />
                            </Box>

                            {/* Weekdays section at the bottom */}
                            <Box
                              sx={{
                                pt: 1.5,
                                borderTop: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <Typography
                                variant='caption'
                                sx={{
                                  display: 'block',
                                  textAlign: 'center',
                                  mb: 1,
                                  fontWeight: 600,
                                  color: 'text.secondary',
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5
                                }}
                              >
                                {t('shifts.activeDays') || 'روزهای فعال'}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                {getActiveDays(shift).map(day => (
                                  <Chip
                                    key={day}
                                    label={translateDay(day)}
                                    size='small'
                                    variant='filled'
                                    color='primary'
                                    sx={{
                                      fontSize: '0.7rem',
                                      fontWeight: 500,
                                      '& .MuiChip-label': {
                                        px: 1
                                      }
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      </HoverWrapper>
                    </MotionContainer>
                  )
                })}
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
                        {t(`shifts.sortFields.${field.value}`) || field.label}
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
                        {order.value === 'asc' ? t(`shifts.sortOrders.asc`) : t(`shifts.sortOrders.desc`)}
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
