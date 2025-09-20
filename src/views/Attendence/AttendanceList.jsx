'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Paper
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Camera as CameraIcon,
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
  Camera,
  CameraAlt
} from '@mui/icons-material'

import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'
import { getBackendImgUrl2 } from '@/configs/routes'
import FullScreenImageModal from '@/components/FullScreenImageModal'

const AttendanceList = ({ attendance, count, isLoading, isError, error }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const backendImgUrl = getBackendImgUrl2()
  const [fullImageUrl, setFullImageUrl] = useState(null)

  const handleViewDetails = attendanceRecord => {
    // Extract person ID from the first selected person or use from record
    const personId = attendanceRecord.person_id || attendanceRecord.personId

    // Navigate to detail page with attendance data
    router.push(`/dashboard/attendence/detail?personId=${personId}&date=${attendanceRecord.date.split(' ')[0]}`)
  }

  const getStatusColor = record => {
    // Priority: error > warning > info > success
    if (record.is_late && record.is_early_exit) return 'error'
    if (record.is_late) return 'warning'
    if (record.is_early_exit) return 'info'
    if (record.overtime_minutes > 0) return 'success'

    return 'success'
  }

  const getStatusText = record => {
    const statusParts = []

    if (record.is_late) statusParts.push(t('attendance.late'))
    if (record.is_early_exit) statusParts.push(t('attendance.earlyExit'))
    if (record.overtime_minutes > 0) statusParts.push(t('attendance.overtime') || 'اضافه کار')

    if (statusParts.length === 0) return t('attendance.onTime')

    return statusParts.join(' - ')
  }

  const formatMinutes = value => {
    if (value == null || isNaN(value)) return `0 ${t('attendance.minutes') || 'دقیقه'}`
    const total = Math.round(Number(value))

    if (total < 60) return `${total} ${t('attendance.minutes') || 'دقیقه'}`
    const hours = Math.floor(total / 60)
    const minutes = total % 60
    const hoursLabel = t('attendance.hours') || 'ساعت'
    const minutesLabel = t('attendance.minutes') || 'دقیقه'

    if (minutes === 0) return `${hours} ${hoursLabel}`

    return `${hours} ${hoursLabel} ${minutes} ${minutesLabel}`
  }

  const formatTime = timeString => {
    if (!timeString) return '--'

    // Extract time from datetime string
    const time = timeString.includes(' ') ? timeString.split(' ')[1] : timeString

    return time.substring(0, 5) // HH:MM format
  }

  const formatDate = dateString => {
    if (!dateString) return '--'

    const date = dateString.split(' ')[0]

    return new Date(date).toLocaleDateString('fa-IR')
  }

  const formatDateWithDay = dateString => {
    if (!dateString) return '--'

    const date = new Date(dateString.split(' ')[0])
    const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه']

    return {
      date: date.toLocaleDateString('fa-IR'),
      dayName: dayNames[date.getDay()]
    }
  }

  const formatPersonName = person => {
    if (!person) return '--'

    return `${person.first_name || ''} ${person.last_name || ''}`.trim() || person.person_id || '--'
  }

  const getGenderText = genderId => {
    // Align with ReportsListView: 2 => male, 3 => female
    if (genderId === 2) return t('reportCard.male') || 'آقا'
    if (genderId === 3) return t('reportCard.female') || 'خانم'

    return t('reportCard.unknown') || '--'
  }

  const getAccessText = accessId => {
    if (accessId === 5) return 'مجاز'
    if (accessId === 6) return 'غیر مجاز'

    return `${accessId}` || 'نامشخص'
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <Box sx={commonStyles.emptyContainer}>
            <Typography variant='body1' color='error'>
              {t('attendance.errorLoadingData')}: {error?.message || error?.data?.message || 'خطای نامشخص'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          {t('attendance.attendanceHistory')}
          {count > 0 && (
            <Chip label={`${count} ${t('attendance.total')}`} size='small' color='primary' variant='outlined' />
          )}
        </Typography>

        {attendance.length === 0 ? (
          <Box sx={commonStyles.emptyContainer}>
            <Typography variant='body1' color='text.secondary'>
              {t('attendance.noAttendanceData')}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ width: '100%' }}>
            <Table size='small' sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>{t('attendance.date') || 'تاریخ'}</TableCell>
                  <TableCell align='center'>{t('attendance.person') || 'شخص'}</TableCell>
                  <TableCell align='center'>{t('attendance.shift') || 'شیفت'}</TableCell>
                  <TableCell align='center'>{t('attendance.tableHeaders.duration') || 'مدت حضور'}</TableCell>
                  <TableCell align='center'>{t('attendance.tableHeaders.status') || 'وضعیت'}</TableCell>
                  <TableCell align='center'>{t('attendance.attendanceDetails') || 'جزئیات حضور و غیاب'}</TableCell>
                  <TableCell align='center'>{t('attendance.tableHeaders.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record, index) => {
                  const dateInfo = formatDateWithDay(record.date)

                  const entryImage = record.entry_report?.image
                  const exitImage = record.exit_report?.image
                  const entryTime = record.first_in
                  const exitTime = record.last_out
                  const entryCamera = record.first_in_camera
                  const exitCamera = record.last_out_camera

                  const entryImageUrl = entryImage ? `${backendImgUrl}${entryImage}` : ''
                  const exitImageUrl = exitImage ? `${backendImgUrl}${exitImage}` : ''

                  return (
                    <TableRow key={index} hover>
                      {/* Date */}
                      <TableCell align='center'>
                        <Typography variant='body2' fontWeight='medium'>
                          {/* <CalendarIcon fontSize='small' sx={{ verticalAlign: 'middle', mr: 0.5 }} /> */}
                          {dateInfo.date}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {dateInfo.dayName}
                        </Typography>
                      </TableCell>

                      {/* Person */}
                      <TableCell align='center'>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            variant='rounded'
                            src={record.person?.person_image ? `${backendImgUrl}${record.person.person_image}` : ''}
                            sx={{ width: 60, height: 60, cursor: 'pointer' }}
                            onClick={() =>
                              record.person?.person_image &&
                              setFullImageUrl(`${backendImgUrl}${record.person.person_image}`)
                            }
                          >
                            <PersonIcon />
                          </Avatar>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant='body2' fontWeight='medium'>
                              {formatPersonName(record.person)}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' display='block'>
                              {(t('reportCard.nationalCode') || 'کد ملی') +
                                ': ' +
                                (record.person?.national_code || '--')}
                            </Typography>
                            <Chip
                              label={getAccessText(record.person?.access_id)}
                              size='small'
                              color={record.person?.access_id === 5 ? 'success' : 'error'}
                              variant='outlined'
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Shift */}
                      <TableCell align='center'>
                        <Typography variant='body2' fontWeight='medium' color='primary'>
                          {record.shift_name || '--'}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          <ScheduleIcon fontSize='small' sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {record.shift_start} - {record.shift_end}
                        </Typography>
                      </TableCell>

                      {/* Duration */}
                      <TableCell align='center'>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant='body2' fontWeight='medium' color='primary'>
                            {record.duration || '--'}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {(t('attendance.expectedDuration') || 'مدت مورد انتظار') +
                              ': ' +
                              (record.expected_duration || '--')}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell align='center'>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            label={getStatusText(record)}
                            color={getStatusColor(record)}
                            size='small'
                            variant='outlined'
                          />
                          {record.is_late && (
                            <Typography variant='caption' color='warning.main'>
                              {(t('attendance.late') || 'تاخیر') + ': ' + formatMinutes(record.late_minutes)}
                            </Typography>
                          )}
                          {record.is_early_exit && (
                            <Typography variant='caption' color='info.main'>
                              {(t('attendance.earlyExit') || 'خروج زودرس') +
                                ': ' +
                                formatMinutes(record.early_exit_minutes)}
                            </Typography>
                          )}
                          {record.overtime_minutes > 0 && (
                            <Typography variant='caption' color='success.main'>
                              {(t('attendance.overtime') || 'اضافه کار') +
                                ': ' +
                                formatMinutes(record.overtime_minutes)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Reports merged: entry and exit */}
                      <TableCell align='center'>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          {/* Entry */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Typography variant='caption' fontWeight='medium' color='success.main'>
                              {t('attendance.entryReport') || 'گزارش ورود'}
                            </Typography>
                            <Avatar
                              variant='rounded'
                              src={entryImageUrl}
                              sx={{ width: 96, height: 60, borderRadius: 1.5, cursor: 'pointer' }}
                              onClick={() => entryImageUrl && setFullImageUrl(`${entryImageUrl}`)}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Typography variant='body2'>
                              <TimeIcon fontSize='small' sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {formatTime(entryTime)}
                            </Typography>
                            <Typography color='primary.main' variant='body2'>
                              <CameraAlt fontSize='small' sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {entryCamera || '--'}
                            </Typography>
                          </Box>

                          {/* Exit */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Typography variant='caption' fontWeight='medium' color='error.main'>
                              {t('attendance.exitReport') || 'گزارش خروج'}
                            </Typography>
                            <Avatar
                              variant='rounded'
                              src={exitImageUrl}
                              sx={{ width: 96, height: 60, borderRadius: 1.5, cursor: 'pointer' }}
                              onClick={() => exitImageUrl && setFullImageUrl(`${exitImageUrl}`)}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Typography variant='body2'>
                              <TimeIcon fontSize='small' sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {formatTime(exitTime)}
                            </Typography>
                            <Typography color='primary.main' variant='body2'>
                              <CameraAlt fontSize='small' sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {exitCamera || '--'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align='center'>
                        <Tooltip title={t('attendance.viewDetails')}>
                          <IconButton onClick={() => handleViewDetails(record)} color='primary' size='small'>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
      <FullScreenImageModal open={!!fullImageUrl} imageUrl={fullImageUrl} onClose={() => setFullImageUrl(null)} />
    </Card>
  )
}

export default AttendanceList
