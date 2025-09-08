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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VideocamIcon from '@mui/icons-material/Videocam'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import useCameras from '@/hooks/useCameras'
import CameraDetailModal from '@/views/Cameras/CameraDetailModal'
import CameraAddModal from './CameraAddModal'
import CameraEditModal from './CameraEditModal'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'
import usePagination from '@/hooks/usePagination'
import { commonStyles } from '@/@core/styles/commonStyles'
import useHasPermission from '@/utils/HasPermission'
import CamerasFilter from '@/views/Cameras/CamerasFilter'
import CameraSort from '@/views/Cameras/CameraSort'

const per_page_OPTIONS = [5, 10, 15, 20]

function CamerasContent({ initialPage = 1, initialper_page = 10 }) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [editCamera, setEditCamera] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cameraToDelete, setCameraToDelete] = useState(null)
  const hasAddPermission = useHasPermission('addCamera')
  const hasEditPermission = useHasPermission('updateCamera')
  const hasDeletePermission = useHasPermission('deleteCamera')

  const { page, per_page, setPage, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(
    initialPage,
    initialper_page
  )

  // Filters and sorting
  const [filters, setFilters] = useState({})
  const [orderBy, setOrderBy] = useState('-created_at')

  const {
    cameras = [],
    total,
    isLoading,
    addCamera,
    updateCamera,
    deleteCamera,
    loading: mutationLoading
  } = useCameras({ page, per_page, filters, order_by: orderBy })

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    params.set('page', page.toString())
    params.set('per_page', per_page.toString())

    // sync filter fields
    if (filters?.name) params.set('name', String(filters.name))
    else params.delete('name')
    if (filters?.id) params.set('id', String(filters.id))
    else params.delete('id')

    // sync sort
    if (orderBy) params.set('order_by', orderBy)
    else params.delete('order_by')

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [page, per_page, router, searchParams, filters, orderBy])

  const handleFiltersChange = nextFilters => {
    setFilters(nextFilters || {})
    setPage(1)
  }

  const handleOpenAddModal = () => setOpenAddModal(true)

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
  }

  const handleAddCamera = async cameraData => {
    await addCamera(cameraData)
    handleCloseAddModal()
  }

  const handleEditClick = camera => {
    setEditCamera(camera)
  }

  const handleCloseEditModal = () => {
    setEditCamera(null)
  }

  const handleUpdateCamera = async ({ id, data }) => {
    await updateCamera({ id, data })
    handleCloseEditModal()
  }

  const handleDeleteClick = camera => {
    setCameraToDelete(camera)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (cameraToDelete) {
      await deleteCamera(cameraToDelete.id)
      setDeleteDialogOpen(false)
      setCameraToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCameraToDelete(null)
  }

  const [hoveredId, setHoveredId] = useState(null)

  const renderActiveChip = isActive => (
    <Chip
      size='small'
      label={isActive ? t('cameras.statusOptions.active') : t('cameras.statusOptions.inactive')}
      color={isActive ? 'success' : 'error'}
      variant='outlined'
    />
  )

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO
        title='مدیریت دوربین‌ها | سیستم تشخیص چهره دیانا'
        description='مدیریت دوربین‌ها سیستم تشخیص چهره دیانا'
        keywords='مدیریت دوربین‌ها, دوربین‌ها, سیستم تشخیص چهره دیانا'
      />

      <CameraDetailModal open={!!selectedCamera} onClose={() => setSelectedCamera(null)} camera={selectedCamera} />
      <CameraAddModal
        open={openAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleAddCamera}
        isLoading={mutationLoading}
      />
      <CameraEditModal
        open={!!editCamera}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateCamera}
        camera={editCamera}
        isLoading={mutationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{t('cameras.deleteCamera')}</DialogTitle>
        <DialogContent>
          <Typography>{t('cameras.deleteConfirm', { name: cameraToDelete?.name || '' })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t('common.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained'>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <PageHeader
        title={t('cameras.title')}
        actionButton={hasAddPermission ? t('cameras.addCamera') : null}
        actionButtonProps={{ onClick: handleOpenAddModal, startIcon: <AddIcon />, disabled: !hasAddPermission }}
      />
      <CamerasFilter onChange={handleFiltersChange} />
      <CameraSort orderBy={orderBy} setOrderBy={setOrderBy} />
      <Card
        elevation={0}
        sx={{
          ...commonStyles.transparentCard,
          overflow: 'visible',
          backgroundColor: '#00000000',
          boxShadow: 'none',
          '&:focus': { outline: 'none' }
        }}
      >
        <Box sx={{ display: 'contents', p: { xs: 2, sm: 4 }, overflow: 'visible' }}>
          {isLoading ? (
            <LoadingState message={t('cameras.loading')} />
          ) : cameras.length === 0 ? (
            <EmptyState message={t('cameras.noData')} />
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
                {cameras.map((camera, idx) => (
                  <Card
                    key={camera.id || idx}
                    elevation={0}
                    onMouseEnter={() => setHoveredId(camera.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    sx={{
                      borderRadius: 2,
                      width: '100%',
                      aspectRatio: '16 / 9',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 22px rgba(0,0,0,0.08)',
                      transform: 'translateY(0)',
                      transition: 'box-shadow .25s ease, transform .25s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 24px 44px rgba(0,0,0,0.2)',
                        zIndex: 2,
                        cursor: 'pointer',
                        '&:focus': { outline: 'none' }
                      }
                    }}
                  >
                    <Box
                      component='img'
                      src={'/images/detected_image.png'}
                      alt={camera.name}
                      sx={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        bgcolor: 'background.default'
                      }}
                      onClick={() => setSelectedCamera(camera)}
                    />
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
                        borderBottomRightRadius: 'inherit'
                      }}
                    >
                      <VideocamIcon sx={{ fontSize: 23, color: 'primary.main' }} />
                      <Typography
                        variant='subtitle2'
                        sx={{
                          fontSize: 16,
                          fontWeight: 600,
                          flexGrow: 1,
                          color: 'common.white',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {camera.name}
                      </Typography>
                      {renderActiveChip(!!camera.is_active)}
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
                        opacity: hoveredId === camera.id ? 1 : 0,
                        transform: hoveredId === camera.id ? 'translateY(0)' : 'translateY(-6px)',
                        transition: 'opacity .2s ease, transform .2s ease',
                        pointerEvents: hoveredId === camera.id ? 'auto' : 'none'
                      }}
                    >
                      <IconButton
                        size='small'
                        onClick={() => setSelectedCamera(camera)}
                        sx={{ color: 'common.white' }}
                        aria-label={t('cameras.cameraDetail')}
                      >
                        <VideocamIcon fontSize='small' />
                      </IconButton>
                      {hasEditPermission && (
                        <IconButton
                          size='small'
                          onClick={() => handleEditClick(camera)}
                          sx={{ color: 'common.white' }}
                          aria-label={t('cameras.editCamera')}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      )}
                      {hasDeletePermission && (
                        <IconButton
                          size='small'
                          sx={{ color: 'error.light' }}
                          aria-label={t('cameras.deleteCamera')}
                          onClick={() => handleDeleteClick(camera)}
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
      {cameras?.length > 0 && (
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
    </Box>
  )
}

export default function Cameras() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <CamerasContent />
    </Suspense>
  )
}
