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
  Tooltip
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
  Visibility as VisibilityIcon
} from '@mui/icons-material'

import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'
import { useAttendanceDetail } from '@/hooks/useAttendence'
import { getBackendImgUrl2 } from '@/configs/routes'
import LoadingState from '@/components/ui/LoadingState'

const AttendanceDetail = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get parameters from URL
  const personId = searchParams.get('personId')
  const date = searchParams.get('date')

  // Fetch attendance detail
  const { attendanceDetail, isLoading, isError, error } = useAttendanceDetail({
    personId: personId ? Number(personId) : null,
    date,
    enabled: !!personId && !!date
  })

  const handleBackToList = () => {
    router.push('/dashboard/attendence')
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

  const getStatusColor = record => {
    if (!record) return 'default'
    if (record.is_late && record.is_early_exit) return 'error'
    if (record.is_late) return 'warning'
    if (record.is_early_exit) return 'info'

    return 'success'
  }

  const getStatusText = record => {
    if (!record) return t('attendance.unknown')
    if (record.is_late && record.is_early_exit) return t('attendance.late') + ' - ' + t('attendance.earlyExit')
    if (record.is_late) return t('attendance.late')
    if (record.is_early_exit) return t('attendance.earlyExit')

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

  const InfoRow = ({ label, value, color }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
      <Typography variant='body2' color='text.secondary'>
        {label}:
      </Typography>
      <Typography variant='body2' fontWeight='medium' color={color || 'text.primary'}>
        {value}
      </Typography>
    </Box>
  )

  const ImageCard = ({ title, imageUrl, personImageUrl, reportData, type }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CameraIcon />
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {imageUrl ? (
          <Box>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 200,
                mb: 2,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => handleImageView(imageUrl)}
            >
              <img
                src={`${getBackendImgUrl2()}${imageUrl}`}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 1
                }}
              >
                <Tooltip title={t('attendance.viewImage')}>
                  <IconButton
                    size='small'
                    sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                    onClick={e => {
                      e.stopPropagation()
                      handleImageView(imageUrl)
                    }}
                  >
                    <VisibilityIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('attendance.downloadImage')}>
                  <IconButton
                    size='small'
                    sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                    onClick={e => {
                      e.stopPropagation()
                      handleImageDownload(imageUrl, `${type}-image-${date}.jpg`)
                    }}
                  >
                    <DownloadIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {reportData && (
              <Box>
                <InfoRow label={t('attendance.date')} value={formatDateTime(reportData.created_at)} />
                <InfoRow label={t('attendance.entryCamera')} value={reportData.camera_id} />
                {personImageUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                      {t('attendance.personImage')}:
                    </Typography>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleImageView(personImageUrl)}
                    >
                      <img
                        src={`${getBackendImgUrl2()}${personImageUrl}`}
                        alt='Person'
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant='body2' color='text.secondary'>
              {t('attendance.noImageProvided')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
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

  return (
    <Box sx={commonStyles.pageContainer}>
      {/* Header */}
      <Box sx={commonStyles.pageHeader}>
        <Typography variant='h4' sx={commonStyles.pageTitle}>
          {t('attendance.attendanceDetail.title')}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant='outlined'>
          {t('attendance.attendanceDetail.backToList')}
        </Button>
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <InfoCard title={t('attendance.attendanceDetail.personalInfo')} icon={<PersonIcon />}>
            <InfoRow
              label={t('attendance.personName')}
              value={`${record.person?.first_name || ''} ${record.person?.last_name || ''}`.trim() || '--'}
            />
            <InfoRow label={t('attendance.personId')} value={record.person?.id || '--'} />
            <InfoRow label={t('attendance.person')} value={record.person?.national_code || '--'} />
            <InfoRow
              label={t('reportCard.gender')}
              value={record.person?.gender_id === 2 ? t('reportCard.male') : t('reportCard.female')}
            />
            <InfoRow
              label={t('reportCard.status')}
              value={
                record.person?.is_active ? t('access.addPersonModal.allowed') : t('access.addPersonModal.notAllowed')
              }
            />
          </InfoCard>
        </Grid>

        {/* Shift Information */}
        <Grid item xs={12} md={6}>
          <InfoCard title={t('attendance.attendanceDetail.shiftInfo')} icon={<ScheduleIcon />}>
            <InfoRow label={t('attendance.shiftName')} value={record.shift_name || '--'} />
            <InfoRow label={t('attendance.shiftStart')} value={record.shift_start || '--'} />
            <InfoRow label={t('attendance.shiftEnd')} value={record.shift_end || '--'} />
            <InfoRow label={t('attendance.expectedDuration')} value={record.expected_duration || '--'} />
            <InfoRow label={t('attendance.date')} value={record.date?.split(' ')[0] || '--'} />
          </InfoCard>
        </Grid>

        {/* Time Tracking */}
        <Grid item xs={12} md={6}>
          <InfoCard title={t('attendance.attendanceDetail.timeTracking')} icon={<TimeIcon />}>
            <InfoRow label={t('attendance.firstIn')} value={formatTime(record.first_in)} />
            <InfoRow label={t('attendance.lastOut')} value={formatTime(record.last_out)} />
            <InfoRow label={t('attendance.duration')} value={record.duration || '--'} />
            <InfoRow label={t('attendance.totalWorkTime')} value={record.total_work_time || '--'} />
            <InfoRow label={t('attendance.entryCount')} value={record.entry_count || 0} />
            <InfoRow label={t('attendance.exitCount')} value={record.exit_count || 0} />
          </InfoCard>
        </Grid>

        {/* Status Information */}
        <Grid item xs={12} md={6}>
          <InfoCard title={t('attendance.attendanceDetail.statusInfo')} icon={<InfoIcon />}>
            <Box sx={{ mb: 2 }}>
              <Chip label={getStatusText(record)} color={getStatusColor(record)} size='medium' variant='outlined' />
            </Box>

            {record.is_late && (
              <InfoRow
                label={t('attendance.lateMinutes')}
                value={`${Math.round(record.late_minutes)} ${t('attendance.minutes')}`}
                color='warning.main'
              />
            )}

            {record.is_early_exit && (
              <InfoRow
                label={t('attendance.earlyExitMinutes')}
                value={`${Math.round(record.early_exit_minutes)} ${t('attendance.minutes')}`}
                color='info.main'
              />
            )}

            {record.overtime_minutes > 0 && (
              <InfoRow
                label={t('attendance.overtimeMinutes')}
                value={`${Math.round(record.overtime_minutes)} ${t('attendance.minutes')}`}
                color='success.main'
              />
            )}

            <InfoRow
              label={t('attendance.durationMinutes')}
              value={`${Math.round(record.duration_minutes || 0)} ${t('attendance.minutes')}`}
            />
          </InfoCard>
        </Grid>

        {/* Entry Image */}
        {record.entry_report && (
          <Grid item xs={12} md={6}>
            <ImageCard
              title={t('attendance.attendanceDetail.entryDetails')}
              imageUrl={record.entry_report.image}
              personImageUrl={record.entry_report.person_image}
              reportData={record.entry_report}
              type='entry'
            />
          </Grid>
        )}

        {/* Exit Image */}
        {record.exit_report && (
          <Grid item xs={12} md={6}>
            <ImageCard
              title={t('attendance.attendanceDetail.exitDetails')}
              imageUrl={record.exit_report.image}
              personImageUrl={record.exit_report.person_image}
              reportData={record.exit_report}
              type='exit'
            />
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default AttendanceDetail
