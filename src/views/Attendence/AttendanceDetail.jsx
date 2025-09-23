'use client'

import { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Alert,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  CameraAlt as CameraIcon,
  ExitToApp as ExitIcon,
  Login as LoginIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material'

import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'
import { useAttendanceDetail } from '@/hooks/useAttendence'
import { getBackendImgUrl2 } from '@/configs/routes'
import LoadingState from '@/components/ui/LoadingState'
import AttendanceDetailStatistics from './AttendanceDetailStatics'
import usePersonReports from '@/hooks/usePersonReports'
import AttendanceReportListview from './AttendanceReportListview'
import AttendanceReportGridCard from './AttendanceReportGridCard'
import AttendancePersonCard from '@/views/Attendence/AttendancePersonCard'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import PageHeader from '@/components/ui/PageHeader'

const AttendanceDetail = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get parameters from URL
  const personId = searchParams.get('personId')
  const date = searchParams.get('date')

  // State for view mode
  const [viewMode, setViewMode] = useState('list')
  const [hoveredShiftId, setHoveredShiftId] = useState(null)

  // Read saved filters (if user opened detail from list with filters applied)
  let savedFilters = null

  try {
    const raw = sessionStorage.getItem('attendance_filters')

    savedFilters = raw ? JSON.parse(raw) : null
  } catch (err) {
    savedFilters = null
  }

  // Compute API-friendly date params (YYYY-MM-DD)
  const filterStartDate = savedFilters?.start_date ? savedFilters.start_date.split('T')[0] : null
  const filterEndDate = savedFilters?.end_date ? savedFilters.end_date.split('T')[0] : null

  // Fetch attendance detail using saved filters when available so API parameters match list view
  const { attendanceDetail, isLoading, isError, error } = useAttendanceDetail({
    personId: personId ? Number(personId) : null,
    date,
    start_date: filterStartDate,
    end_date: filterEndDate,
    shift_ids: savedFilters?.shift_ids || null,
    entry_cam_ids: savedFilters?.entry_cam_ids || [],
    exit_cam_ids: savedFilters?.exit_cam_ids || [],
    entry_exit_cam_ids: savedFilters?.entry_exit_cam_ids || [],
    enabled: !!personId && (!!date || (!!filterStartDate && !!filterEndDate))
  })

  // Get the actual person ID from attendance detail or URL
  const actualPersonId =
    attendanceDetail?.person?.id || attendanceDetail?.person_id || (personId ? Number(personId) : null)

  // Create date range with time (00:00:00 to 23:59:59)
  const startDateTime = date ? `${date} 00:00:00` : null
  const endDateTime = date ? `${date} 23:59:59` : null

  // Fetch person reports for the selected date
  const {
    reports,
    total,
    isLoading: reportsLoading
  } = usePersonReports({
    page: 1,
    per_page: 100, // Get all reports for the day
    person_id: actualPersonId,
    created_at_from: startDateTime,
    created_at_to: endDateTime,
    order_by: 'created_at'
  })

  // Report detail modal state used by list/grid children
  const [openReportDetail, setOpenReportDetail] = useState(false)
  const [reportDetailIndex, setReportDetailIndex] = useState(null)

  const handleOpenReportDetail = idx => {
    setReportDetailIndex(idx)
    setOpenReportDetail(true)
  }

  const handleNavigateReportDetail = direction => {
    setReportDetailIndex(prev => {
      const next = (prev ?? 0) + direction

      if (!enhancedReports || next < 0 || next >= (enhancedReports || []).length) return prev

      return next
    })
  }

  const handleBackToList = () => {
    router.push('/attendence')
  }

  // Helper functions for shift display
  const getActiveDays = shift => {
    if (!shift?.days_times) return []

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

  const formatTime = timeString => {
    if (!timeString) return '--'
    const time = timeString.includes(' ') ? timeString.split(' ')[1] : timeString

    return time.substring(0, 5) // HH:MM format
  }

  const formatDateTime = dateTimeString => {
    if (!dateTimeString) return '--'
    const [date, time] = dateTimeString.split(' ')
    const formattedDate = new Date(date).toLocaleDateString('fa-IR')
    const formattedTime = time ? time.substring(0, 5) : ''

    return `${formattedDate} - ${formattedTime}`
  }

  // Format minutes into "Xh Ym" when >= 60, otherwise "Zm"
  const formatMinutes = minutesRaw => {
    const minutes = Math.round(Number(minutesRaw) || 0)

    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60)
      const mins = minutes % 60

      if (mins === 0) return `${hrs} ${t('attendance.hours')}`

      return `${hrs} ${t('attendance.hours')} ${mins} ${t('attendance.minutes')}`
    }

    return `${minutes} ${t('attendance.minutes')}`
  }

  const getStatusColor = record => {
    if (!record) return 'default'
    if (record.is_late && record.is_early_exit) return 'error'
    if (record.is_late) return 'warning'
    if (record.is_early_exit) return 'info'
    if (record.overtime_minutes > 0) return 'success'

    return 'success'
  }

  const getStatusText = record => {
    if (!record) return t('attendance.unknown')
    if (record.is_late && record.is_early_exit) return t('attendance.late') + ' - ' + t('attendance.earlyExit')
    if (record.is_late) return t('attendance.late')
    if (record.is_early_exit) return t('attendance.earlyExit')
    if (record.overtime_minutes > 0) return t('attendance.overtime')

    return t('attendance.onTime')
  }

  const handleImageView = imageUrl => {
    if (imageUrl) {
      window.open(`${getBackendImgUrl2()}${imageUrl}`, '_blank')
    }
  }

  const handleImageDownload = (imageUrl, filename) => {
    if (imageUrl) {
      const link = document.createElement('a')

      link.href = `${getBackendImgUrl2()}${imageUrl}`
      link.download = filename || 'attendance-image.jpg'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Identify entry and exit reports
  const identifyEntryExitReports = (reports, attendanceDetail) => {
    if (!reports || !attendanceDetail) return reports

    const entryReportId = attendanceDetail.entry_report?.id
    const exitReportId = attendanceDetail.exit_report?.id

    return reports.map(report => ({
      ...report,
      isEntryReport: report.id === entryReportId,
      isExitReport: report.id === exitReportId
    }))
  }

  // Enhanced reports with entry/exit identification
  const enhancedReports = identifyEntryExitReports(reports, attendanceDetail)

  // Create summary data for statistics
  const createSummaryData = attendanceDetail => {
    if (!attendanceDetail) return null

    return {
      totalDays: 1,
      presentDays: 1,
      absentDays: 0,
      expectedDuration: attendanceDetail.expected_duration || '00:00',
      lateDays: attendanceDetail.is_late ? 1 : 0,
      earlyExitDays: attendanceDetail.is_early_exit ? 1 : 0,
      overtimeDays: attendanceDetail.overtime_minutes > 0 ? 1 : 0,
      averageDuration: attendanceDetail.duration || '00:00',
      totalWorkTime: attendanceDetail.total_work_time || '00:00',
      totalDuration: attendanceDetail.duration || '00:00',
      totalLateTime: attendanceDetail.late_minutes
        ? `${Math.floor(attendanceDetail.late_minutes / 60)}:${String(Math.floor(attendanceDetail.late_minutes % 60)).padStart(2, '0')}`
        : '00:00',
      totalAbsentTime: attendanceDetail.early_exit_minutes
        ? `${Math.floor(attendanceDetail.early_exit_minutes / 60)}:${String(Math.floor(attendanceDetail.early_exit_minutes % 60)).padStart(2, '0')}`
        : '00:00',
      totalExtraTime: attendanceDetail.overtime_minutes
        ? `${Math.floor(attendanceDetail.overtime_minutes / 60)}:${String(Math.floor(attendanceDetail.overtime_minutes % 60)).padStart(2, '0')}`
        : '00:00',
      attendance: [attendanceDetail]
    }
  }

  const summaryData = createSummaryData(attendanceDetail)

  // Create person data for AccessReportCard
  const createPersonData = attendanceDetail => {
    if (!attendanceDetail?.person) return null

    return {
      id: attendanceDetail.person.id,
      first_name: attendanceDetail.person.first_name,
      last_name: attendanceDetail.person.last_name,
      national_code: attendanceDetail.person.national_code,
      gender_id: attendanceDetail.person.gender_id,
      access_id: attendanceDetail.person.access_id,
      person_image: attendanceDetail.person.person_image,
      last_person_image: attendanceDetail.entry_report?.person_image || attendanceDetail.exit_report?.person_image,
      created_at: attendanceDetail.date,
      index: 0
    }
  }

  const personData = createPersonData(attendanceDetail)

  // Create shift data for display
  const createShiftData = attendanceDetail => {
    if (!attendanceDetail) return null

    return {
      id: attendanceDetail.shift_id || 0,
      title: attendanceDetail.shift_name || 'نامشخص',
      startTime: attendanceDetail.shift_start,
      endTime: attendanceDetail.shift_end,
      start_date: attendanceDetail.date?.split(' ')[0] || attendanceDetail.date,
      end_date: attendanceDetail.date?.split(' ')[0] || attendanceDetail.date,
      description: `Expected Duration: ${attendanceDetail.expected_duration}`,
      is_active: true,
      totalPersons: 1,
      createdAt: attendanceDetail.date,
      updatedAt: attendanceDetail.date,
      days_times: {
        // Create a mock days_times object for display
        monday: { start: attendanceDetail.shift_start, end: attendanceDetail.shift_end },
        tuesday: { start: attendanceDetail.shift_start, end: attendanceDetail.shift_end },
        wednesday: { start: attendanceDetail.shift_start, end: attendanceDetail.shift_end },
        thursday: { start: attendanceDetail.shift_start, end: attendanceDetail.shift_end },
        friday: { start: attendanceDetail.shift_start, end: attendanceDetail.shift_end },
        saturday: { start: attendanceDetail.shift_start, end: attendanceDetail.shift_end },
        sunday: { start: attendanceDetail.shift_start, end: attendanceDetail.shift_end }
      }
    }
  }

  const shiftData = createShiftData(attendanceDetail)

  const InfoCard = ({ title, children, icon }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  )

  const InfoRow = ({ label, value, color, sx }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, ...(sx || {}) }}>
      <Typography variant='body2' color='text.secondary' component='div'>
        {typeof label === 'string' || typeof label === 'number' ? `${label}:` : label}
      </Typography>
      <Typography variant='body2' fontWeight='medium' color={color || 'text.primary'} component='div'>
        {value}
      </Typography>
    </Box>
  )

  if (isLoading) {
    return (
      <Box sx={commonStyles.pageContainer}>
        <LoadingState message={t('attendance.loading')} />
      </Box>
    )
  }

  if (isError || !attendanceDetail) {
    return (
      <Box sx={commonStyles.pageContainer}>
        <Alert severity='error' sx={{ mb: 3 }}>
          {t('attendance.errorLoadingData')}: {error?.message || 'Record not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant='outlined'>
          {t('attendance.attendanceDetail.backToList')}
        </Button>
      </Box>
    )
  }

  const record = attendanceDetail

  const trueDuration =
    record.duration_minutes - record.late_minutes - record.early_exit_minutes + record.overtime_minutes || 0

  return (
    <Box sx={commonStyles.pageContainer}>
      {/* Header */}
      <PageHeader title={t('attendance.attendanceDetail.title')} actionButton={t('attendance.attendanceDetail.backToList')} actionButtonProps={{ onClick: handleBackToList , variant: 'outlined', endIcon: <ArrowBackIcon /> }} underlineWidth={200} />

      {/* Statistics Section */}
      {summaryData && (
        <Box sx={{ mb: 4 }}>
          <AttendanceDetailStatistics summary={summaryData} isLoading={isLoading} />
        </Box>
      )}

      {/* Time Tracking and Status Information - Side by Side */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Time Tracking */}
        <Grid item xs={12} md={6} flexGrow={1} width={'48%'}>
          <InfoCard title={t('attendance.attendanceDetail.timeTracking')} icon={<TimeIcon />}>
            <InfoRow label={t('attendance.firstIn')} value={formatTime(record.first_in)} />
            <Divider sx={{ mb: 2 }} />
            <InfoRow label={t('attendance.lastOut')} value={formatTime(record.last_out)} />
            <Divider sx={{ mb: 2 }} />
            <InfoRow label={t('attendance.duration')} value={record.duration || '--'} />
            <Divider sx={{ mb: 2 }} />
            <InfoRow label={t('attendance.expectedDuration')} value={record.expected_duration || '--'} />
            <Divider sx={{ mb: 2 }} />
            <InfoRow label={t('attendance.entryCount')} value={record.entry_count || 0} />
            <Divider sx={{ mb: 2 }} />
            <InfoRow label={t('attendance.exitCount')} value={record.exit_count || 0} />
          </InfoCard>
        </Grid>

        {/* Status Information */}
        <Grid item xs={12} md={6} flexGrow={1} width={'50%'}>
          <InfoCard title={t('attendance.attendanceDetail.statusInfo')} icon={<InfoIcon />}>
            <Box sx={{ mb: 2 }}>
              <Chip label={getStatusText(record)} color={getStatusColor(record)} size='medium' variant='outlined' />
            </Box>
            {record.is_late && (
              <>
                <InfoRow
                  label={t('attendance.lateMinutes')}
                  value={formatMinutes(record.late_minutes)}
                  color='warning.main'
                />
                <Divider sx={{ mb: 2 }} />
              </>
            )}
            {record.is_early_exit && (
              <>
                <InfoRow
                  label={t('attendance.earlyExitMinutes')}
                  value={formatMinutes(record.early_exit_minutes)}
                  color='info.main'
                />
                <Divider sx={{ mb: 2 }} />
              </>
            )}
            {record.overtime_minutes > 0 && (
              <>
                <InfoRow
                  label={t('attendance.overtimeMinutes')}
                  value={formatMinutes(record.overtime_minutes)}
                  color='success.main'
                />
                <Divider sx={{ mb: 2 }} />
              </>
            )}
            <InfoRow label={t('attendance.duration')} value={formatMinutes(record.duration_minutes || 0)} />
            <Divider sx={{ mb: 2 }} />
            <InfoRow
              label={
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('attendance.trueDuration')}
                  </Typography>
                  <Tooltip title={t('attendance.trueDurationHelp')}>
                    <InfoIcon fontSize='small' color='action' />
                  </Tooltip>
                </Box>
              }
              value={formatMinutes(trueDuration) || '--'}
            />{' '}
          </InfoCard>
        </Grid>
      </Grid>

      {/* Person Information and Shift Information - Side by Side */}
      <Grid container spacing={3} sx={{ mb: 6, alignItems: 'stretch', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        {/* Person Information Card */}
        {personData && (
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              width: { xs: '100%', md: '50%' },
              maxWidth: { xs: '100%', md: '50%' }
            }}
          >
            <Typography variant='h5' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              {t('attendance.attendanceDetail.personalInfo')}
            </Typography>
            <AttendancePersonCard
              personData={personData}
              onViewDetails={person => {
                // Navigate to access page and open person detail modal (same behaviour as ShiftDetail)
                if (person && (person.id || person.person_id)) {
                  const personId = person.id || person.person_id

                  try {
                    router.push(`/access?person_id=${personId}`)
                  } catch (err) {
                    // fallback: log
                    console.error('Failed to open person detail:', err)
                  }
                }
              }}
              onViewImage={imageUrl => {
                if (imageUrl) {
                  window.open(`${getBackendImgUrl2()}${imageUrl}`, '_blank')
                }
              }}
              onDownloadImage={(imageUrl, filename) => {
                if (imageUrl) {
                  const link = document.createElement('a')

                  link.href = `${getBackendImgUrl2()}${imageUrl}`
                  link.download = filename || 'person-image.jpg'
                  link.target = '_blank'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }
              }}
            />
          </Grid>
        )}

        {/* Shift Information */}
        {shiftData && (
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              width: { xs: '100%', md: '50%' },
              maxWidth: { xs: '100%', md: '50%' }
            }}
          >
            <Typography variant='h5' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon />
              {t('attendance.attendanceDetail.shiftInfo')}
            </Typography>
            {/* Full width shift card */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Card
                elevation={0}
                onMouseEnter={() => setHoveredShiftId(shiftData.id)}
                onMouseLeave={() => setHoveredShiftId(null)}
                onClick={() => {
                  // Navigate to shifts page and open the shift detail modal via query param
                  router.push(`/shifts?shift_id=${shiftData.id}`)
                }}
                sx={{
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 22px rgba(0,0,0,0.08)',
                  transform: 'translateY(0)',
                  transition: 'box-shadow .25s ease, transform .25s ease',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: hoveredShiftId === shiftData.id ? 'primary.main' : 'transparent',
                  height: '100%',
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

                {/* Connected info section - no gap, same background */}
                <Box sx={{ p: 2, pt: 1 }}>
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
                    {shiftData.title}
                  </Typography>

                  {/* Date range with icon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, justifyContent: 'center' }}>
                    <CalendarMonthIcon fontSize='small' color='primary' />
                    <Typography variant='body2' sx={{ fontSize: '0.85rem', textAlign: 'center' }}>
                      {t('shifts.from')} <ShamsiDateTime dateTime={shiftData.start_date} format='date' />{' '}
                      {t('shifts.to')} <ShamsiDateTime dateTime={shiftData.end_date} format='date' />
                    </Typography>
                  </Box>

                  {/* Time range */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, justifyContent: 'center' }}>
                    <TimeIcon fontSize='small' color='primary' />
                    <Typography variant='body2' sx={{ fontSize: '0.85rem', textAlign: 'center' }}>
                      {shiftData.startTime} - {shiftData.endTime}
                    </Typography>
                  </Box>

                  {/* Expected duration */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, justifyContent: 'center' }}>
                    <ScheduleIcon fontSize='small' color='primary' />
                    <Typography variant='body2' sx={{ fontSize: '0.85rem', textAlign: 'center' }}>
                      {t('attendance.expectedDuration')}: {record.expected_duration || '--'}
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
                      label={shiftData.is_active ? t('shifts.active') : t('shifts.inactive')}
                      color={shiftData.is_active ? 'success' : 'default'}
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip
                      label={`${t('shifts.id')}: ${shiftData.id}`}
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
                      {getActiveDays(shiftData).map(day => (
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
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Person Reports Section */}
      {enhancedReports && enhancedReports.length > 0 && (
        <Box sx={{ mb: 4, mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h5' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CameraIcon />
              {t('attendance.personReports')} ({enhancedReports.length})
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size='small'
            >
              <ToggleButton value='list'>
                <ViewListIcon />
              </ToggleButton>
              <ToggleButton value='grid'>
                <ViewModuleIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {viewMode === 'list' ? (
            <AttendanceReportListview
              reports={enhancedReports.map((report, index) => ({
                ...report,

                // Add visual indicators for entry/exit reports
                sx: {
                  ...(report.isEntryReport && {
                    borderLeft: '4px solid #4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.05)'
                  }),
                  ...(report.isExitReport && {
                    borderLeft: '4px solid #f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.05)'
                  })
                }
              }))}
              onOpenDetail={() => {}}
              onAdd={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : (
            <Grid container spacing={2}>
              {enhancedReports.map((report, index) => (
                <Grid item xs={12} sm={6} md={4} key={report.id} flexGrow={1}>
                  <Box
                    sx={{
                      position: 'relative',
                      ...(report.isEntryReport && {
                        '&::before': {
                          content: '"ورود"',
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: '#4caf50',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '9px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          zIndex: 1
                        }
                      }),
                      ...(report.isExitReport && {
                        '&::before': {
                          content: '"خروج"',
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: '#f44336',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '9px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          zIndex: 1
                        }
                      })
                    }}
                  >
                    <AttendanceReportGridCard
                      reportData={report}
                      allReports={enhancedReports}
                      index={index}
                      onOpenDetail={() => {}}
                      onEdit={() => {}}
                      onOpenPersonAdd={() => {}}
                      onOpenPersonEdit={() => {}}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  )
}

export default AttendanceDetail
