import { useState, useEffect, Suspense } from 'react'

import { Box, Grid, Card, MenuItem, FormControl, InputLabel, Select } from '@mui/material'

import SEO from '@/components/SEO'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'
import usePagination from '@/hooks/usePagination'
import { commonStyles } from '@/@core/styles/commonStyles'
import { useTranslation } from '@/translations/useTranslation'
import ReportsFilters from './ReportsFilters'
import ReportCard from './ReportCard'
import ReportsDetailModal from './ReportsDetailModal'

// Mock data generator
const generateMockReports = () => {
  const statuses = ['allowed', 'not_allowed']
  const names = ['علی', 'حسین', 'زهرا', 'مریم', 'رضا', 'سارا']
  const lastNames = ['محمدی', 'حسینی', 'کریمی', 'جعفری', 'رضایی', 'کاظمی']
  const reports = []

  for (let i = 1; i <= 42; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const first_name = names[Math.floor(Math.random() * names.length)]
    const last_name = lastNames[Math.floor(Math.random() * lastNames.length)]

    reports.push({
      id: i,
      first_name,
      last_name,
      national_code: '00' + (100000000 + i),
      status,
      date: `2024-06-${((i % 30) + 1).toString().padStart(2, '0')}`,
      person_image: '',
      last_image: ''
    })
  }

  return reports
}

const SORT_FIELDS = [
  { value: 'date', label: 'reportCard.date' },
  { value: 'first_name', label: 'reportCard.name' },
  { value: 'status', label: 'reportCard.status' }
]

const SORT_ORDERS = [
  { value: 'asc', label: 'groups.ascending' },
  { value: 'desc', label: 'groups.descending' }
]

function ReportsContent() {
  const { t } = useTranslation()
  const [allReports] = useState(generateMockReports())
  const [filteredReports, setFilteredReports] = useState(allReports)
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const { page, per_page, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(1, 10)

  // Modal state for detail modal
  const [openDetailIndex, setOpenDetailIndex] = useState(null)

  // Filtering
  const handleFilter = filters => {
    let filtered = allReports

    if (filters.name) {
      filtered = filtered.filter(r => (r.first_name + ' ' + r.last_name).includes(filters.name))
    }

    if (filters.national_code) {
      filtered = filtered.filter(r => r.national_code.includes(filters.national_code))
    }

    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status)
    }

    if (filters.date_from) {
      filtered = filtered.filter(r => r.date >= filters.date_from)
    }

    if (filters.date_to) {
      filtered = filtered.filter(r => r.date <= filters.date_to)
    }

    setFilteredReports(filtered)
    setOpenDetailIndex(null) // close modal on filter change
  }

  // Sorting
  const sortedReports = [...filteredReports].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (sortBy === 'date') {
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

  // Pagination
  const pagedReports = sortedReports.slice((page - 1) * per_page, page * per_page)

  // Navigation logic for detail modal
  const handleOpenDetail = idx => setOpenDetailIndex(idx)
  const handleCloseDetail = () => setOpenDetailIndex(null)

  const handleNavigateDetail = direction => {
    if (openDetailIndex === null) return
    const newIndex = openDetailIndex + direction

    if (newIndex >= 0 && newIndex < pagedReports.length) {
      setOpenDetailIndex(newIndex)
    }
  }

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO title={t('groups.title')} description={t('groups.title')} keywords={t('groups.groups')} />
      <PageHeader underlineWidth={90} title={t('live.reports')} />
      <ReportsFilters onFilter={handleFilter} />
      <Box elevation={0} sx={{ borderRadius: 2, boxShadow: 1, mt: 0, mb: 2 }}>
        <Grid
          container
          spacing={2}
          p={2}
          sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)', justifyContent: 'center' }}
        >
          {pagedReports.length === 0 ? (
            <Grid item xs={12}>
              <EmptyState message={t('live.noReports')} />
            </Grid>
          ) : (
            pagedReports.map((report, idx) => (
              <Grid sx={{ display: 'flex', flexGrow: 1, minWidth: '330px' }} item xs={12} sm={6} md={4} key={report.id}>
                <ReportCard reportData={report} allReports={sortedReports} onOpenDetail={() => handleOpenDetail(idx)} />
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      {sortedReports.length > 0 && (
        <PaginationControls
          page={page}
          total={sortedReports.length}
          per_page={per_page}
          per_pageOptions={perPageOptions}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          itemsPerPageLabel={t('groups.itemsPerPage')}
        />
      )}
      {/* Single detail modal for navigation */}
      {openDetailIndex !== null && pagedReports[openDetailIndex] && (
        <ReportsDetailModal
          open={true}
          onClose={handleCloseDetail}
          reportData={pagedReports[openDetailIndex]}
          allReports={pagedReports}
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
