import { useState, useEffect, Suspense } from 'react'

import { Box, Grid, Card, MenuItem, FormControl, InputLabel, Select } from '@mui/material'

import Dialog from '@mui/material/Dialog'

import DialogActions from '@mui/material/DialogActions'

import DialogContent from '@mui/material/DialogContent'

import DialogContentText from '@mui/material/DialogContentText'

import DialogTitle from '@mui/material/DialogTitle'

import Button from '@mui/material/Button'

import { useSelector } from 'react-redux'

import SEO from '@/components/SEO'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'
import usePagination from '@/hooks/usePagination'
import usePersonReports from '@/hooks/usePersonReports'
import { commonStyles } from '@/@core/styles/commonStyles'
import { useTranslation } from '@/translations/useTranslation'
import ReportsFilters from './ReportsFilters'
import ReportCard from './ReportCard'
import ReportsDetailModal from './ReportsDetailModal'
import ReportsSort from './ReportsSort'
import ViewModeToggle from './ViewModeToggle'
import ReportsGridCard from './ReportsGridCard'
import ReportsListView from './ReportsListView'
import ReportsEditModal from './ReportsEditModal'
import AddModal from '@/views/Live/LiveAddModal'
import ReportsPersonEditModal from '@/views/Reports/ReportsPersonEditModal'

import useCameras from '@/hooks/useCameras'
import { useAddPerson, useDeletePerson, useUpdatePerson } from '@/hooks/usePersons'
import { getBackendImgUrl2 } from '@/configs/routes'

const SORT_FIELDS = [
  { value: 'created_at', label: 'reportCard.date' },
  { value: 'person_id', label: 'reportCard.personId' },
  { value: 'confidence', label: 'reportCard.confidence' },
  { value: 'fiqa', label: 'reportCard.fiqa' },
  { value: 'camera_id', label: 'reportCard.camera' }
]

const SORT_ORDERS = [
  { value: 'asc', label: 'groups.ascending' },
  { value: 'desc', label: 'groups.descending' }
]

function ReportsContent() {
  const { t } = useTranslation()

  const [filters, setFilters] = useState({})

  // sortBy uses API param `sort_by`. Per spec: prefix '-' means ascending, otherwise descending
  const [sortBy, setSortBy] = useState('-created_at')
  const { page, per_page, setPage, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(1, 10)

  // Modal state for detail modal
  const [openDetailIndex, setOpenDetailIndex] = useState(null)

  // view mode: 'list' | 'report' | 'card' — default to list
  const [viewMode, setViewMode] = useState('list')

  // Use the real API hook - pass through server-side filter params
  const { reports, total, isLoading, isError, refetchReports } = usePersonReports({
    page,
    per_page,
    gender_id: filters.gender_id ?? null,
    camera_id: filters.camera_id ?? null,
    person_id: filters.person_id ?? null,
    access_id: filters.access_id ?? null,
    created_at_from: filters.created_at_from ?? null,
    created_at_to: filters.created_at_to ?? null,
    order_by: sortBy
  })

  // Fetch cameras once and reuse
  const { cameras: camerasData } = useCameras({ page: 1, per_page: 200 })

  // Edit & delete modals state
  const [editOpen, setEditOpen] = useState(false)
  const [editReportData, setEditReportData] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // Person add/edit modals state
  const [personModalType, setPersonModalType] = useState(null) // 'add' | 'edit' | null
  const [personModalData, setPersonModalData] = useState(null)

  const addPersonMutation = useAddPerson()
  const updatePersonMutation = useUpdatePerson()
  const deletePersonMutation = useDeletePerson()

  const baseUrl = getBackendImgUrl2()

  const joinUrl = url => {
    if (!url) return null
    if (typeof url !== 'string') return null
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return `${baseUrl}${url}`

    return `${baseUrl}/${url}`
  }

  const mapReportToPersonInitialData = report => {
    if (!report) return {}
    const personObj = typeof report.person_id === 'object' ? report.person_id : null

    return {
      id: report.id,
      first_name: personObj?.first_name || report.first_name || '',
      last_name: personObj?.last_name || report.last_name || '',
      national_code: personObj?.national_code || report.national_code || '',
      gender_id: report.gender_id?.id || report.gender_id || personObj?.gender_id?.id || '',
      access_id: report.access_id?.id || report.access_id || personObj?.access_id?.id || 7,

      // Map profile image vs last captured image explicitly
      // person_image => profile image from person record
      person_image: joinUrl(personObj?.person_image) || null,

      // last_person_image => last captured image (prefer nested person last, then report's person_image_url, then report.image_url)
      last_person_image:
        joinUrl(personObj?.last_person_image) || joinUrl(report.person_image_url) || joinUrl(report.image_url) || null,
      feature_vector: report.feature_vector || personObj?.feature_vector || '',
      last_person_report_id: report.id,
      person_id:
        personObj?.person_id || personObj?.id || (typeof report.person_id === 'number' ? report.person_id : ''),
      image_quality: report.image_quality || ''
    }
  }

  const isUnknownAccess = access => {
    const id = access?.id || access

    return id === 7 || id === 'unknown' || !id
  }

  const openPersonModalForReport = (report, type) => {
    setPersonModalData(mapReportToPersonInitialData(report))
    setPersonModalType(type)
  }

  const handleOpenPersonAdd = report => openPersonModalForReport(report, 'add')
  const handleOpenPersonEdit = report => openPersonModalForReport(report, 'edit')

  const handlePersonAddSubmit = async formData => {
    await addPersonMutation.mutateAsync(formData)
  }

  const handlePersonEditSubmit = async formData => {
    const id = personModalData?.person_id

    if (!id) return
    await updatePersonMutation.mutateAsync({ id, data: formData })
  }

  const handleEditOpen = report => {
    setEditReportData(report)
    setEditOpen(true)
  }

  const handleEditClose = () => setEditOpen(false)

  const handleDeleteOpen = id => {
    setDeleteId(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteClose = () => setDeleteConfirmOpen(false)

  const handleDelete = async () => {
    try {
      await deletePersonMutation.mutateAsync(deleteId)
      handleDeleteClose()

      // refresh reports list
      refetchReports && refetchReports()
    } catch (err) {
      console.error('delete failed', err)
    }
  }

  // Server-side filtering: API returns filtered reports
  const filteredReports = reports || []

  // Prefer server-side ordering (API provides correct order). Use client-side sort only
  // if we later need a fallback. For now, preserve API order to avoid reversing it.
  const sortedReports = Array.isArray(filteredReports) ? [...filteredReports] : []

  // Filtering
  const handleFilter = newFilters => {
    // Reset to first page and apply new filters
    setPage(1)
    setFilters(newFilters)
    setOpenDetailIndex(null) // close modal on filter change
  }

  // Navigation logic for detail modal
  const handleOpenDetail = idx => setOpenDetailIndex(idx)
  const handleCloseDetail = () => setOpenDetailIndex(null)

  const handleNavigateDetail = direction => {
    if (openDetailIndex === null) return
    const newIndex = openDetailIndex + direction

    if (newIndex >= 0 && newIndex < sortedReports.length) {
      setOpenDetailIndex(newIndex)
    }
  }

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return <EmptyState message={t('reportCard.noReport')} />
  }

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO title={t('live.reports')} description={t('live.reports')} keywords={t('live.reports')} />
      <PageHeader underlineWidth={90} title={t('live.reports')} />
      <ReportsFilters onFilter={handleFilter} />
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <ReportsSort sx={{ mb: 0 }} orderBy={sortBy} setOrderBy={setSortBy} />
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </Box>
      <Box elevation={0} sx={{ borderRadius: 2, mt: 0, mb: 2, backgroundColor: '#00000000' }}>
        {sortedReports.length === 0 ? (
          <EmptyState message={t('live.noReports')} />
        ) : viewMode === 'report' ? (
          <Grid container spacing={2} p={2} sx={{ justifyContent: 'center' }}>
            {sortedReports.map((report, idx) => (
              <Grid sx={{ display: 'flex', flexGrow: 1, minWidth: '240px' }} item xs={6} sm={4} md={3} key={report.id}>
                <ReportsGridCard
                  reportData={report}
                  onOpenDetail={() => handleOpenDetail(idx)}
                  onEdit={() => handleEditOpen(report)}
                  onOpenPersonAdd={() => handleOpenPersonAdd(report)}
                  onOpenPersonEdit={() => handleOpenPersonEdit(report)}
                  onDelete={() => handleDeleteOpen(report.id)}
                />
              </Grid>
            ))}
          </Grid>
        ) : viewMode === 'card' ? (
          <Grid container spacing={2} p={2} sx={{ justifyContent: 'center' }}>
            {sortedReports.map((report, idx) => (
              <Grid sx={{ display: 'flex', flexGrow: 1, minWidth: '330px' }} item xs={12} sm={6} md={4} key={report.id}>
                <ReportCard
                  reportData={report}
                  allReports={sortedReports}
                  onOpenDetail={() => handleOpenDetail(idx)}
                  onEdit={() => handleEditOpen(report)}
                  onOpenPersonAdd={() => handleOpenPersonAdd(report)}
                  onOpenPersonEdit={() => handleOpenPersonEdit(report)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <ReportsListView
            reports={sortedReports}
            onOpenDetail={id => {
              const idx = sortedReports.findIndex(r => r.id === id)

              if (idx >= 0) handleOpenDetail(idx)
            }}
            onAdd={r => handleOpenPersonAdd(r)}
            onEdit={r => handleOpenPersonEdit(r)}
            onDelete={id => handleDeleteOpen(id)}
          />
        )}
      </Box>
      {total > 0 && (
        <PaginationControls
          page={page}
          total={total}
          per_page={per_page}
          per_pageOptions={perPageOptions}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          itemsPerPageLabel={t('groups.itemsPerPage')}
        />
      )}
      {/* Single detail modal for navigation */}
      {openDetailIndex !== null && sortedReports[openDetailIndex] && (
        <ReportsDetailModal
          open={true}
          onClose={handleCloseDetail}
          reportData={sortedReports[openDetailIndex]}
          allReports={sortedReports}
          currentIndex={openDetailIndex}
          onNavigate={handleNavigateDetail}
          camerasDataProp={camerasData}
          onPersonModalOpen={type =>
            openPersonModalForReport(sortedReports[openDetailIndex], type === 'add' ? 'add' : 'edit')
          }
        />
      )}
      {/* Edit modal */}
      <ReportsEditModal open={editOpen} onClose={handleEditClose} reportData={editReportData} />

      {/* Person Add/Edit modals */}
      <AddModal
        open={personModalType === 'add'}
        onClose={() => setPersonModalType(null)}
        onSubmit={handlePersonAddSubmit}
        initialData={personModalData}
        mode={''}
      />
      <ReportsPersonEditModal
        open={personModalType === 'edit'}
        onClose={() => setPersonModalType(null)}
        onSubmit={handlePersonEditSubmit}
        initialData={personModalData}
        mode={''}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteClose} aria-labelledby='delete-confirm-dialog-title'>
        <DialogTitle id='delete-confirm-dialog-title'>{t('access.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('access.confirmDeleteMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} variant='outlined'>
            {t('reportCard.cancel')}
          </Button>
          <Button onClick={handleDelete} color='error' variant='contained'>
            {t('access.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default function Reports() {
  return (
    <Suspense fallback={<LoadingState message='...' />}>
      <ReportsContent />
    </Suspense>
  )
}
