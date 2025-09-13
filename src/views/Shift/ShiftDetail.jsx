'use client'

import React from 'react'

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
  Avatar
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

import { useTranslation } from '@/translations/useTranslation'
import useShifts from '@/hooks/useShifts'
import LoadingState from '@/components/ui/LoadingState'
import ShamsiDateTime from '@/components/ShamsiDateTimer'

const ShiftDetail = ({ open, onClose, shiftId }) => {
  const { t } = useTranslation()
  const { getShiftDetail } = useShifts()
  const [shift, setShift] = React.useState(null)
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false)

  React.useEffect(() => {
    if (shiftId && open) {
      // Only fetch if we don't have the shift data or it's a different shift
      if (!shift || shift.id !== shiftId) {
        setIsLoadingDetail(true)
        getShiftDetail(shiftId).then(shiftData => {
          setShift(shiftData)
          setIsLoadingDetail(false)
        })
      }
    }
  }, [shiftId, open, getShiftDetail, shift])

  // Reset shift when modal closes
  React.useEffect(() => {
    if (!open) {
      // Delay reset to prevent flickering
      const timer = setTimeout(() => {
        setShift(null)
        setIsLoadingDetail(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [open])

  if (!shiftId) return null

  if (isLoadingDetail) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth dir='rtl'>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('shifts.shiftDetails')}</DialogTitle>
        <DialogContent>
          <LoadingState />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    )
  }

  if (!shift) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth dir='rtl'>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('shifts.shiftDetails')}</DialogTitle>
        <DialogContent>
          <Typography color='error'>{t('messages.error')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth dir='rtl'>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('shifts.shiftDetails')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Modern header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 3,
              background: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <AccessTimeIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {shift.name?.trim()}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                ID: {shift.id}
              </Typography>
            </Box>
            <Chip
              label={shift.is_active ? t('shifts.active') : t('shifts.inactive')}
              size='small'
              color={shift.is_active ? 'success' : 'default'}
              variant='outlined'
            />
          </Box>

          {/* Info grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('shifts.startTime')}
              </Typography>
              <Typography variant='body2'>{shift.start_time}</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('shifts.endTime')}
              </Typography>
              <Typography variant='body2'>{shift.end_time}</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('shifts.createdAt')}
              </Typography>
              <Typography variant='body2'>
                <ShamsiDateTime dateTime={shift.created_at} />
              </Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('shifts.updatedAt')}
              </Typography>
              <Typography variant='body2'>
                <ShamsiDateTime dateTime={shift.updated_at} />
              </Typography>
            </Box>
          </Box>

          {/* Description */}
          {shift.description && (
            <>
              <Divider />
              <Box>
                <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
                  {t('shifts.description')}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {shift.description}
                </Typography>
              </Box>
            </>
          )}

          <Divider />

          {/* Users */}
          <Box>
            <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
              {t('shifts.users')}
            </Typography>
            {shift.users && shift.users.length > 0 ? (
              <Box>
                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                  {t('shifts.users')} ({shift.users.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {shift.users.map((user, index) => (
                    <Chip
                      key={user.id || index}
                      label={user.username || user.email || `User ${user.id}`}
                      variant='outlined'
                      size='small'
                      color='secondary'
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                {t('shifts.noUsersAssigned')}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button sx={{ mt: 2 }} variant='contained' onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShiftDetail
