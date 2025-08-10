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

  const [filters, setFilters] = useState({
    // API filters (sent to backend)
    gender_id: '',
    camera_id: '',
    person_id: '',

    // Manual filters (client-side)
    date_from: null,
    date_to: null
  })

  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const { page, per_page, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(1, 10)

  // Modal state for detail modal
  const [openDetailIndex, setOpenDetailIndex] = useState(null)

  // Use the real API hook - only send API filters
  const { reports, total, isLoading, isError, refetchReports } = usePersonReports({
    page,
    per_page,
    gender_id: filters.gender_id ? parseInt(filters.gender_id) : null,
    camera_id: filters.camera_id ? parseInt(filters.camera_id) : null,
    person_id: filters.person_id ? parseInt(filters.person_id) : null
  })

  // Apply manual filters (client-side) - only date filtering
  const applyManualFilters = reports => {
    let filtered = reports || []

    // Manual date filtering
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from)

      filtered = filtered.filter(r => {
        const reportDate = new Date(r.created_at)

        return reportDate >= fromDate
      })
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to)

      filtered = filtered.filter(r => {
        const reportDate = new Date(r.created_at)

        return reportDate <= toDate
      })
    }

    return filtered
  }

  // Apply manual filters to the reports
  const filteredReports = applyManualFilters(reports)

  // Sorting
  const sortedReports = [...filteredReports].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (sortBy === 'created_at') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })

  // Filtering
  const handleFilter = newFilters => {
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
    return <EmptyState message={t('common.error')} />
  }

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO title={t('live.reports')} description={t('live.reports')} keywords={t('live.reports')} />
      <PageHeader underlineWidth={90} title={t('live.reports')} />
      <ReportsFilters onFilter={handleFilter} />
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
