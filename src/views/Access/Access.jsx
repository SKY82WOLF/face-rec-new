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
import ReportCard from './AccessReportCard'
import AccessAddModal from './AccessAddModal'
import { useGetPersons } from '@/hooks/usePersons'
import { useTranslation } from '@/translations/useTranslation'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'
import usePagination from '@/hooks/usePagination'
import { commonStyles } from '@/@core/styles/commonStyles'

const per_page_OPTIONS = [5, 10, 15, 20]

function AccessContent({ initialPage = 1, initialper_page = 10 }) {
  const { t } = useTranslation()

  const { page, per_page, handlePageChange, handlePerPageChange, perPageOptions } = usePagination(
    initialPage,
    initialper_page
  )

  const [openAddModal, setOpenAddModal] = useState(false)

  const { data: personsData, isLoading } = useGetPersons({
    page: page,
    per_page
  })

  const handleOpenAddModal = () => setOpenAddModal(true)
  const handleCloseAddModal = () => setOpenAddModal(false)

  return (
    <Box sx={commonStyles.pageContainer}>
      <SEO
        title='اشخاص مجاز | سیستم تشخیص چهره دیانا'
        description='مدیریت اشخاص مجاز سیستم تشخیص چهره دیانا'
        keywords='اشخاص مجاز, مدیریت دسترسی, تشخیص چهره دیانا'
      />
      <PageHeader
        title={t('access.title')}
        actionButton={t('access.addNewPerson')}
        actionButtonProps={{ onClick: handleOpenAddModal }}
        underlineWidth={130}
      />
      <Card elevation={0} sx={commonStyles.transparentCard}>
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
                <ReportCard
                  reportData={{
                    id: person.id,
                    first_name: person.first_name,
                    last_name: person.last_name,
                    national_code: person.national_code,
                    access: person.access,
                    gender: person.gender,
                    person_image: person.person_image,
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
