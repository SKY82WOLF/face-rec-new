import { useState, useEffect, Suspense } from 'react'

import { Box, Grid, Card, MenuItem, FormControl, InputLabel, Select } from '@mui/material'

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
      <ReportsSort orderBy={sortBy} setOrderBy={setSortBy} />
      <Box elevation={0} sx={{ borderRadius: 2, mt: 0, mb: 2, backgroundColor: '#00000000' }}>
        <Grid container spacing={2} p={2} sx={{ justifyContent: 'center' }}>
          {sortedReports.length === 0 ? (
            <Grid item xs={12}>
              <EmptyState message={t('live.noReports')} />
            </Grid>
          ) : (
            sortedReports.map((report, idx) => (
              <Grid sx={{ display: 'flex', flexGrow: 1, minWidth: '330px' }} item xs={12} sm={6} md={4} key={report.id}>
                <ReportCard reportData={report} allReports={sortedReports} onOpenDetail={() => handleOpenDetail(idx)} />
              </Grid>
            ))
          )}
        </Grid>
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
        />
      )}
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
