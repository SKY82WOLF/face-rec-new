'use client'

import { useEffect, useState, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Button,
  Typography,
  Box,
  Card,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress
} from '@mui/material'

import SEO from '@/components/SEO'
import AccessReportCard from './AccessReportCard'
import AccessAddModal from './AccessAddModal'
import AccessFiltring from './AccessFiltring'
import AccessSort from './AccessSort'
import { useGetPersons } from '@/hooks/usePersons'
import { useTranslation } from '@/translations/useTranslation'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'
import usePagination from '@/hooks/usePagination'
import { commonStyles } from '@/@core/styles/commonStyles'
import useHasPermission from '@/utils/HasPermission'

const per_page_OPTIONS = [5, 10, 15, 20]

function AccessContent({ initialPage = 1, initialper_page = 10 }) {
  const { t } = useTranslation()

  const { page, per_page, setPage, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(
    initialPage,
    initialper_page
  )

  const [openAddModal, setOpenAddModal] = useState(false)
  const [orderBy, setOrderBy] = useState('-created_at')

  // Persist filters in URL so they survive refresh and sharing
  const router = useRouter()
  const searchParams = useSearchParams()

  const parseFiltersFromUrl = () => {
    const params = Object.fromEntries([...new URLSearchParams(String(searchParams))])

    const parsed = {}

    // access_id and gender_id may be comma separated
    if (params.access_id) parsed.access_id = params.access_id.split(',').map(v => Number(v))
    if (params.gender_id) parsed.gender_id = params.gender_id.split(',').map(v => Number(v))

    if (params.first_name) parsed.first_name = params.first_name
    if (params.last_name) parsed.last_name = params.last_name
    if (params.person_id) parsed.person_id = params.person_id
    if (params.national_code) parsed.national_code = params.national_code

    return parsed
  }

  const [filters, setFilters] = useState(() => {
    const urlFilters = parseFiltersFromUrl()

    return Object.keys(urlFilters).length ? urlFilters : { access_id: [5, 6] }
  })

  const { data: personsData, isLoading } = useGetPersons({
    page: page,
    per_page,
    filters,
    order_by: orderBy
  })

  // Reset to first page when sorting changes
  useEffect(() => {
    setPage(1)
  }, [orderBy, setPage])

  const handleOpenAddModal = () => setOpenAddModal(true)
  const handleCloseAddModal = () => setOpenAddModal(false)

  const hasAddPermission = useHasPermission('createPerson')

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO
        title='اشخاص مجاز | سیستم تشخیص چهره دیانا'
        description='مدیریت اشخاص مجاز سیستم تشخیص چهره دیانا'
        keywords='اشخاص مجاز, مدیریت دسترسی, تشخیص چهره دیانا'
      />
      <PageHeader
        title={t('access.title')}
        actionButton={hasAddPermission ? t('access.addNewPerson') : null}
        actionButtonProps={{ onClick: handleOpenAddModal, disabled: !hasAddPermission }}
        underlineWidth={80}
      />
      <AccessFiltring
        onChange={newFilters => {
          // reset page when filters change
          setPage(1)

          // update URL
          const params = new URLSearchParams()

          // Ensure page resets to 1 in the URL when filters change
          params.set('page', '1')

          if (newFilters.access_id) params.set('access_id', newFilters.access_id.join(','))
          if (newFilters.gender_id) params.set('gender_id', newFilters.gender_id.join(','))
          if (newFilters.first_name) params.set('first_name', newFilters.first_name)
          if (newFilters.last_name) params.set('last_name', newFilters.last_name)
          if (newFilters.person_id) params.set('person_id', newFilters.person_id)
          if (newFilters.national_code) params.set('national_code', newFilters.national_code)

          router.replace(`?${params.toString()}`, { scroll: false })

          // Ensure we always set filters to the new object
          setFilters(newFilters)
        }}
        initialFilters={filters}
      />
      <AccessSort orderBy={orderBy} setOrderBy={setOrderBy} />
      <Card elevation={0} sx={{ ...commonStyles.transparentCard, backgroundColor: '#00000000', boxShadow: 'none' }}>
        <Grid
          p={2}
          container
          spacing={2}
          sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)', justifyContent: 'center' }}
        >
          {isLoading ? (
            <Grid item xs={12}>
              <LoadingState message={t('access.loading')} />
            </Grid>
          ) : personsData?.data?.length > 0 ? (
            personsData.data.map((person, index) => (
              <Grid sx={{ display: 'flex', flexGrow: 1, minWidth: '330px' }} xs={12} sm={6} md={4} key={person.id}>
                <AccessReportCard
                  reportData={{
                    id: person.id,
                    first_name: person.first_name,
                    last_name: person.last_name,
                    national_code: person.national_code,
                    access_id: person.access_id,
                    gender_id: person.gender_id,
                    person_image: person.person_image,
                    last_person_image: person.last_person_image,
                    last_person_report_id: person.last_person_report_id,
                    person_id: person.person_id,
                    index: index,
                    date: person.updated_at
                  }}
                  allReports={personsData.data}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <EmptyState message={t('access.noPersons')} />
            </Grid>
          )}
        </Grid>
      </Card>
      {personsData?.data?.length > 0 && (
        <PaginationControls
          page={page}
          total={personsData?.total || 0}
          per_page={per_page}
          per_pageOptions={perPageOptions}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          itemsPerPageLabel={t('access.itemsPerPage')}
        />
      )}
      <AccessAddModal open={openAddModal} onClose={handleCloseAddModal} />
    </Box>
  )
}

export default function Access() {
  return (
    <Suspense>
      <AccessContent />
    </Suspense>
  )
}
