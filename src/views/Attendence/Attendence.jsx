'use client'

import { useState } from 'react'

import { Box, Typography } from '@mui/material'

import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'
import useAttendence, { useAttendanceSummary } from '@/hooks/useAttendence'
import LoadingState from '@/components/ui/LoadingState'
import AttendanceFilters from './AttendanceFilters'
import AttendanceStatistics from './AttendanceStatistics'
import AttendanceList from './AttendanceList'

const Attendence = () => {
  const { t } = useTranslation()

  // State for filters - start empty
  const [filters, setFilters] = useState({
    person_id: [],
    start_date: null,
    end_date: null,
    shift_ids: null,
    camera_direction: '',
    entry_cam_ids: [],
    exit_cam_ids: [],
    entry_exit_cam_ids: []
  })

  const [hasSearched, setHasSearched] = useState(false)

  // Only fetch data when filters are applied and have values
  const shouldFetch = hasSearched && filters.person_id.length > 0 && filters.start_date && filters.end_date

  // Fetch attendance data
  const { attendance, count, personName, isLoading, isError, error, refetchAttendance } = useAttendence({
    personId: filters.person_id[0], // Use selected person
    start_date: filters.start_date ? filters.start_date.split('T')[0] : null,
    end_date: filters.end_date ? filters.end_date.split('T')[0] : null,
    shift_ids: filters.shift_ids,
    entry_cam_ids: filters.entry_cam_ids,
    exit_cam_ids: filters.exit_cam_ids,
    entry_exit_cam_ids: filters.entry_exit_cam_ids,
    enabled: shouldFetch
  })

  // Fetch summary statistics
  const { summary, isLoading: summaryLoading } = useAttendanceSummary({
    personId: filters.person_id[0], // Use selected person
    start_date: filters.start_date ? filters.start_date.split('T')[0] : null,
    end_date: filters.end_date ? filters.end_date.split('T')[0] : null,
    shift_ids: filters.shift_ids,
    entry_cam_ids: filters.entry_cam_ids,
    exit_cam_ids: filters.exit_cam_ids,
    entry_exit_cam_ids: filters.entry_exit_cam_ids,
    enabled: shouldFetch
  })

  const handleFilter = newFilters => {
    setFilters(newFilters)
    setHasSearched(true)
  }

  if (isLoading && hasSearched) {
    return (
      <Box sx={commonStyles.pageContainer}>
        <Typography variant='h4' sx={commonStyles.pageTitle}>
          {t('attendance.title')}
        </Typography>
        <AttendanceFilters onFilter={handleFilter} />
        <LoadingState message={t('attendance.loading')} />
      </Box>
    )
  }

  return (
    <Box sx={commonStyles.pageContainer}>
      <Typography variant='h4' sx={commonStyles.pageTitle}>
        {t('attendance.title')}
      </Typography>

      {/* Filters Component */}
      <AttendanceFilters onFilter={handleFilter} />

      {/* Statistics Component */}
      {hasSearched && <AttendanceStatistics summary={summary} isLoading={summaryLoading} />}

      {/* List Component */}
      {hasSearched && (
        <AttendanceList
          attendance={attendance || []}
          count={count || 0}
          isLoading={isLoading}
          isError={isError}
          error={error}
        />
      )}

      {/* Empty State Message */}
      {!hasSearched && (
        <Box sx={commonStyles.emptyContainer}>
          <Typography variant='body1' color='text.secondary'>
            {t('attendance.selectFiltersToSearch', 'لطفاً فیلترها را انتخاب کرده و جستجو کنید')}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default Attendence
