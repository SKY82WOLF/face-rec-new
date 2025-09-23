'use client'

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar
} from '@mui/material'
import {
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  WatchLaterOutlined,
  WatchOff,
  WatchRounded
} from '@mui/icons-material'

import { useTranslation } from '@/translations/useTranslation'

const AttendanceDetailStatistics = ({ summary, isLoading }) => {
  const { t } = useTranslation()

  // Summary statistics cards
  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 50, height: 50 }}>{icon}</Avatar>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            <Typography color='text.secondary' variant='body2'>
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (isLoading || !summary) {
    return null
  }

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} lg={2} flexGrow={1}>
        <StatCard
          title={t('attendance.expectedDuration')}
          value={summary.expectedDuration}
          icon={<WatchRounded />}
          color='success'
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={2} flexGrow={1}>
        <StatCard
          title={t('attendance.totalDuration')}
          value={summary.totalDuration || '--'}
          icon={<TimeIcon />}
          color='info'
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={2} flexGrow={1}>
        <StatCard
          title={t('attendance.totalLateTime')}
          value={summary.totalLateTime || '--'}
          icon={<ScheduleIcon />}
          color='warning'
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={2} flexGrow={1}>
        <StatCard
          title={t('attendance.totalEarlyExitTime')}
          value={summary.totalAbsentTime || '--'}
          icon={<CancelIcon />}
          color='error'
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={2} flexGrow={1}>
        <StatCard
          title={t('attendance.totalExtraTime')}
          value={summary.totalExtraTime || '--'}
          icon={<CheckCircleIcon />}
          color='success'
        />
      </Grid>
    </Grid>
  )
}

export default AttendanceDetailStatistics
