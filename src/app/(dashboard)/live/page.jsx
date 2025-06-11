'use client'

import { useState } from 'react'

import {
  Button,
  Typography,
  Box,
  Card,
  Grid,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

import SEO from '@/components/SEO'
import ReportCard from '@/components/ReportCard'
import { useGetPersons } from '@/hooks/usePersons'
import { useTranslation } from '@/translations/useTranslation'

const LIMIT_OPTIONS = [5, 10, 15, 20]

export default function Page() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { data: personsData, isLoading } = useGetPersons({
    offset: (page - 1) * limit,
    limit
  })

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleLimitChange = event => {
    setLimit(event.target.value)
    setPage(1) // Reset to first page when changing limit
  }

  return (
    <Box sx={{ p: 4 }}>
      <SEO
        title='داشبورد | سیستم تشخیص چهره دیانا'
        description='داشبورد اصلی سیستم تشخیص چهره دیانا'
        keywords='داشبورد, صفحه اصلی, تشخیص چهره دیانا'
      />

      {/* Live Stream Section */}
      <Card sx={{ mb: 4, backgroundColor: 'rgb(47 51 73 / 0)' }}>
        <Box sx={{ p: 2 }}>
          <Typography textAlign={'center'} variant='h6' gutterBottom>
            {t('live.title')}
          </Typography>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%',
              backgroundColor: '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 1
            }}
          >
            <img
              src='http://192.168.11.39:7000'
              alt='Live Stream Placeholder'
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 'inherit'
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* Reports Section */}
      <Card sx={{ backgroundColor: 'rgb(47 51 73 / 0)' }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6'>{t('live.reports')}</Typography>
          </Box>
          <Grid container spacing={2} sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
            {isLoading ? (
              <Typography>{t('live.loading')}</Typography>
            ) : personsData?.length > 0 ? (
              personsData.map(person => (
                <Grid sx={{ display: 'flex', flexGrow: 1 }} item xs={12} sm={6} md={4} key={person.id}>
                  <ReportCard
                    reportData={{
                      id: person.id,
                      name: person.name,
                      last_name: person.last_name,
                      national_code: person.national_code,
                      access: person.access,
                      gender: person.gender,
                      created_at: person.created_at,
                      updated_at: person.updated_at,
                      is_active: person.is_active
                    }}
                  />
                </Grid>
              ))
            ) : (
              <Typography>{t('live.noReports')}</Typography>
            )}
          </Grid>
          {personsData?.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3,
                gap: 2
              }}
            >
              <FormControl sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel>{t('access.itemsPerPage')}</InputLabel>
                <Select value={limit} onChange={handleLimitChange} label={t('access.itemsPerPage')}>
                  {LIMIT_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
                <Pagination
                  count={page + (personsData.length === limit ? 1 : 0)}
                  page={page}
                  onChange={handlePageChange}
                  color='primary'
                  showFirstButton
                  showLastButton
                  size='small'
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: 0, sm: 120 } }} />
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  )
}
