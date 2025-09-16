'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Alert } from '@mui/material'

import WarningIcon from '@mui/icons-material/Warning'

import { useTranslation } from '@/translations/useTranslation'
import ShamsiDateTime from '@/components/ShamsiDateTimer'

const ShiftDeleteModal = ({ open, onClose, onConfirm, shift, isLoading = false }) => {
  const { t } = useTranslation()

  if (!shift) return null

  // Get active days
  const getActiveDays = () => {
    if (!shift.days_times) return []

    return Object.keys(shift.days_times)
  }

  // Translate day names
  const translateDay = day => {
    const dayTranslations = {
      saturday: 'شنبه',
      sunday: 'یکشنبه',
      monday: 'دوشنبه',
      tuesday: 'سه‌شنبه',
      wednesday: 'چهارشنبه',
      thursday: 'پنج‌شنبه',
      friday: 'جمعه',
    }

    return dayTranslations[day] || day
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>{t('shifts.deleteConfirmation')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity='error' icon={<WarningIcon />} sx={{ mb: 2 }}>
            {t('shifts.confirmDeleteMessage', { name: shift.title || 'بدون عنوان' })}
          </Alert>

          <Typography variant='body1' sx={{ mb: 2 }}>
            {t('shifts.deleteWarning')}
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
              {t('shifts.shiftToDelete')}:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant='body2' color='text.secondary'>
                  {t('shifts.shiftName')}:
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {shift.title || 'بدون عنوان'}
                </Typography>
              </Box>

              {shift.id && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('shifts.id')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {shift.id}
                  </Typography>
                </Box>
              )}

              {shift.start_date && shift.end_date && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('shifts.timeRange')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {t('shifts.from')} <ShamsiDateTime dateTime={shift.start_date} format='date' />{' '}
                    {t('shifts.to')} <ShamsiDateTime dateTime={shift.end_date} format='date' />
                  </Typography>
                </Box>
              )}

              {getActiveDays().length > 0 && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('shifts.daysSchedule')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {getActiveDays().map(translateDay).join('، ')}
                  </Typography>
                </Box>
              )}

              {shift.persons && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('shifts.users')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {shift.persons.length} {t('shifts.users')}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant='body2' color='text.secondary'>
                  {t('shifts.status')}:
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {shift.is_active ? t('shifts.active') : t('shifts.inactive')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t('shifts.cancel')}
        </Button>
        <Button onClick={onConfirm} variant='contained' color='error' disabled={isLoading}>
          {isLoading ? t('common.loading') : t('shifts.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShiftDeleteModal
