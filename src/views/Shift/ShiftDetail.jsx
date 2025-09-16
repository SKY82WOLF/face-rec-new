'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Avatar,
  Grid,
  Tooltip,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import PersonIcon from '@mui/icons-material/Person'
import VisibilityIcon from '@mui/icons-material/Visibility'

import { useTranslation } from '@/translations/useTranslation'
import { useShiftDetail } from '@/hooks/useShifts'
import LoadingState from '@/components/ui/LoadingState'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import { backendImgUrl } from '@/configs/routes'
import FullScreenImageModal from '@/components/FullScreenImageModal'

const ShiftDetail = ({ open, onClose, shiftId }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { shift, isLoading: isLoadingDetail, isError } = useShiftDetail(shiftId)
  const [expandedDay, setExpandedDay] = React.useState(null)
  const [fullScreenImageUrl, setFullScreenImageUrl] = React.useState(null)

  const handleAccordionChange = day => (event, isExpanded) => {
    setExpandedDay(isExpanded ? day : null)
  }

  const translateDay = day => {
    return t(`shifts.dayNames.${day}`) || day
  }

  // Format time values with appropriate units
  const formatTimeValue = seconds => {
    if (!seconds && seconds !== 0) return 'نامشخص'

    if (seconds % 3600 === 0) {
      return `${seconds / 3600} ${t('shifts.timeUnits.hours')}`
    } else if (seconds % 60 === 0) {
      return `${seconds / 60} ${t('shifts.timeUnits.minutes')}`
    } else {
      return `${seconds} ${t('shifts.timeUnits.seconds')}`
    }
  }

  // Calculate the duration between two times
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return ''

    // Parse times
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    let durationMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)

    // Handle case when end time is on the next day
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60
    }

    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60

    let result = ''

    if (hours > 0) {
      result += `${hours} ${t('shifts.timeUnits.hours')} `
    }

    if (minutes > 0 || hours === 0) {
      result += `${minutes} ${t('shifts.timeUnits.minutes')}`
    }

    return result.trim()
  }

  const handleViewPersonDetail = (personId) => {
    // Navigate to persons page with person_id query parameter
    router.push(`/access?person_id=${personId}`)
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth PaperProps={{ sx: { borderRadius: 4 } }} dir='rtl'>
      <DialogTitle
        sx={{ fontWeight: 700, fontSize: 22, pb: 1, textAlign: 'center', paddingLeft: '6px', color: 'primary.main' }}
      >
        {t('shifts.shiftDetails')}
      </DialogTitle>
      <DialogContent>
        {isLoadingDetail ? (
          <LoadingState message={t('shifts.loading')} />
        ) : isError ? (
          <Typography color='error'>{t('common.error')}</Typography>
        ) : !shift ? (
          <Typography>{t('shifts.noData')}</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
            {/* Basic Info - Centered title + table */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant='h5' align='center' sx={{ mb: 2, fontWeight: 700 }}>
                {shift.title || '—'}
              </Typography>
              <TableContainer>
                <Table size='small'>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ width: '30%' }}>{t('shifts.id')}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{shift.id || '—'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('shifts.startDate')}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <ShamsiDateTime dateTime={shift.start_date} format='date' />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('shifts.endDate')}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <ShamsiDateTime dateTime={shift.end_date} format='date' />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('shifts.status')}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Chip
                          label={shift.is_active ? t('shifts.active') : t('shifts.inactive')}
                          color={shift.is_active ? 'success' : 'default'}
                          size='small'
                          variant='filled'
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('shifts.createdAt')}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <ShamsiDateTime dateTime={shift.created_at} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Advanced Settings */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography
                variant='subtitle1'
                sx={{ mb: 2, fontWeight: 600, color: 'primary.main', textAlign: 'center' }}
              >
                {t('shifts.advancedSettings')}
              </Typography>

              <Grid container spacing={2} flexGrow={1} minWidth={'20%'}>
                <Grid item xs={12} sm={6} md={4} flexGrow={1} minWidth={'15%'} textAlign={'center'}>
                  <Tooltip title={t('shifts.startOffsetHelp')}>
                    <Box sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                      <Typography variant='subtitle2' color='text.primary' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t('shifts.startOffset')}
                      </Typography>
                      <Typography variant='body2'>{formatTimeValue(shift.start_offset)}</Typography>
                    </Box>
                  </Tooltip>
                </Grid>

                <Grid item xs={12} sm={6} md={4} flexGrow={1} minWidth={'15%'} textAlign={'center'}>
                  <Tooltip title={t('shifts.endOffsetHelp')}>
                    <Box sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                      <Typography variant='subtitle2' color='text.primary' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t('shifts.endOffset')}
                      </Typography>
                      <Typography variant='body2'>{formatTimeValue(shift.end_offset)}</Typography>
                    </Box>
                  </Tooltip>
                </Grid>

                <Grid item xs={12} sm={6} md={4} flexGrow={1} minWidth={'15%'} textAlign={'center'}>
                  <Tooltip title={t('shifts.shiftResetHelp')}>
                    <Box sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                      <Typography variant='subtitle2' color='text.primary' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t('shifts.shiftReset')}
                      </Typography>
                      <Typography variant='body2'>{formatTimeValue(shift.shift_reset)}</Typography>
                    </Box>
                  </Tooltip>
                </Grid>

                <Grid item xs={12} sm={6} md={6} flexGrow={1} minWidth={'15%'} textAlign={'center'}>
                  <Tooltip title={t('shifts.breakHelp')}>
                    <Box sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                      <Typography variant='subtitle2' color='text.primary' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t('shifts.break')}
                      </Typography>
                      <Typography variant='body2'>{formatTimeValue(shift.break)}</Typography>
                    </Box>
                  </Tooltip>
                </Grid>

                <Grid item xs={12} sm={6} md={6} flexGrow={1} minWidth={'15%'} textAlign={'center'}>
                  <Tooltip title={t('shifts.totalBreakHelp')}>
                    <Box sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                      <Typography variant='subtitle2' color='text.primary' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t('shifts.totalBreak')}
                      </Typography>
                      <Typography variant='body2'>{formatTimeValue(shift.total_break)}</Typography>
                    </Box>
                  </Tooltip>
                </Grid>
              </Grid>
            </Paper>

            {/* Schedule - Table view */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography
                variant='subtitle1'
                sx={{ mb: 2, fontWeight: 600, color: 'primary.main', textAlign: 'center' }}
              >
                {t('shifts.daysSchedule')}
              </Typography>
              {shift.days_times && Object.keys(shift.days_times).length > 0 ? (
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('shifts.dayNames.saturday')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('shifts.start')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('shifts.end')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{t('shifts.timeRange')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(shift.days_times).map(day =>
                        (shift.days_times[day] || []).map((slot, idx) => (
                          <TableRow key={`${day}-${idx}`}>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{translateDay(day)}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>{slot.start}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>{slot.end}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              {calculateDuration(slot.start, slot.end)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {t('shifts.noTimeSchedule')}
                </Typography>
              )}
            </Paper>

            {/* Persons - Styled like ReportsListView */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography
                variant='subtitle1'
                sx={{ mb: 2, fontWeight: 600, color: 'primary.main', textAlign: 'center' }}
              >
                {t('shifts.persons')}
              </Typography>
              {shift.persons && shift.persons.length > 0 ? (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ paddingLeft: '25px' }}>{t('reportCard.image')}</TableCell>
                        <TableCell align='center'>{t('reportCard.fullName') || t('shifts.name')}</TableCell>
                        <TableCell align='center'>{t('shifts.id')}</TableCell>
                        <TableCell align='center'>{t('reportCard.access')}</TableCell>
                        <TableCell align='center'>{t('shifts.viewPersonDetail')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shift.persons.map(p => {
                        const accessTitle = p.access_id?.translate || p.access_id?.title
                        const isAllowed = p.access_id?.id === 5 || p.access_id === 5

                        return (
                          <TableRow key={p.id} hover>
                            <TableCell align='center'>
                              <Avatar
                                variant='rounded'
                                src={
                                  backendImgUrl + p.person_image ||
                                  backendImgUrl + p.last_person_image ||
                                  '/images/avatars/1.png'
                                }
                                sx={{ width: 56, height: 56, borderRadius: 1.5, cursor: 'pointer' }}
                                onClick={() =>
                                  setFullScreenImageUrl(
                                    backendImgUrl + p.person_image ||
                                      backendImgUrl + p.last_person_image ||
                                      '/images/avatars/1.png'
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align='center'>
                              <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {p.first_name} {p.last_name}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {t('reportCard.nationalCode')}: {p.national_code || t('reportCard.unknown')}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>{p.id}</TableCell>
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant='body2'
                                  color={isAllowed ? 'success.main' : 'error.main'}
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  {accessTitle || t('reportCard.unknown')}
                                </Typography>
                                {isAllowed ? (
                                  <LockOpenIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                ) : (
                                  <LockIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align='center'>
                              <Tooltip title={t('shifts.viewPersonDetail')}>
                                <IconButton
                                  size='small'
                                  onClick={() => handleViewPersonDetail(p.id)}
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: 'primary.light',
                                      color: 'primary.contrastText'
                                    }
                                  }}
                                  aria-label={t('shifts.viewPersonDetail')}
                                >
                                  <VisibilityIcon fontSize='small' />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {t('shifts.noUsersAssigned')}
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button sx={{ mt: 2 }} variant='contained' onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
      <FullScreenImageModal
        open={!!fullScreenImageUrl}
        imageUrl={fullScreenImageUrl}
        onClose={() => setFullScreenImageUrl(null)}
      />
    </Dialog>
  )
}

export default ShiftDetail
