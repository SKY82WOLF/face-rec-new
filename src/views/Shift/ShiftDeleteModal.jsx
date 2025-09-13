'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Alert } from '@mui/material'

import WarningIcon from '@mui/icons-material/Warning'

import { useTranslation } from '@/translations/useTranslation'

const ShiftDeleteModal = ({ open, onClose, onConfirm, shift, isLoading = false }) => {
  const { t } = useTranslation()

  if (!shift) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>{t('shifts.deleteConfirmation')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity='warning' icon={<WarningIcon />} sx={{ mb: 2 }}>
            {t('shifts.confirmDeleteMessage', { name: shift.name })}
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
                  {shift.name}
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

              {shift.start_time && shift.end_time && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('shifts.timeRange')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {shift.start_time} - {shift.end_time}
                  </Typography>
                </Box>
              )}

              {shift.description && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('shifts.description')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {shift.description}
                  </Typography>
                </Box>
              )}

              {shift.users && shift.users.length > 0 && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('shifts.users')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {shift.users.length} {t('shifts.users')}
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
