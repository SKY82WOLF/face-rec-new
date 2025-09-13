'use client'

import * as React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'

const ShiftUpdate = ({ open, onClose, onSubmit, shift, isLoading = false }) => {
  const { t } = useTranslation()

  const [editShift, setEditShift] = React.useState({
    name: '',
    start_time: '',
    end_time: '',
    description: '',
    is_active: true
  })

  React.useEffect(() => {
    if (shift) {
      setEditShift({
        name: shift.name || '',
        start_time: shift.start_time || '',
        end_time: shift.end_time || '',
        description: shift.description || '',
        is_active: shift.is_active !== undefined ? shift.is_active : true
      })
    }
  }, [shift])

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target

    setEditShift(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Trim the name before submitting
    const trimmedData = {
      ...editShift,
      name: editShift.name.trim(),
      description: editShift.description.trim()
    }

    await onSubmit({ id: shift.id, data: trimmedData })
    handleClose()
  }

  const handleClose = () => {
    setEditShift({
      name: '',
      start_time: '',
      end_time: '',
      description: '',
      is_active: true
    })
    onClose()
  }

  // Generate time options for select
  const generateTimeOptions = () => {
    const times = []

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

        times.push(timeString)
      }
    }

    return times
  }

  const timeOptions = generateTimeOptions()

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
      dir='rtl'
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: 22, pb: 1, bgcolor: 'background.paper' }}>
        {t('shifts.editShiftTitle')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Shift Information */}
            <Paper
              elevation={1}
              sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('shifts.shiftInformation')}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <CustomTextField
                  fullWidth
                  label={t('shifts.shiftName')}
                  name='name'
                  value={editShift.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />

                <CustomTextField
                  fullWidth
                  label={t('shifts.description')}
                  name='description'
                  value={editShift.description}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('shifts.startTime')}</InputLabel>
                  <Select
                    name='start_time'
                    value={editShift.start_time}
                    label={t('shifts.startTime')}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                  >
                    {timeOptions.map(time => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>{t('shifts.endTime')}</InputLabel>
                  <Select
                    name='end_time'
                    value={editShift.end_time}
                    label={t('shifts.endTime')}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                  >
                    {timeOptions.map(time => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    name='is_active'
                    checked={editShift.is_active}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    color='primary'
                  />
                }
                label={t('shifts.isActive')}
                sx={{ alignSelf: 'flex-start' }}
              />
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ px: 4, pb: 3, pt: 0, justifyContent: 'space-between', gap: 2, bgcolor: 'background.paper' }}
        >
          <Button onClick={handleClose} variant='outlined' color='error' sx={{ minWidth: 120 }} disabled={isLoading}>
            {t('shifts.cancel')}
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            sx={{ minWidth: 140, fontWeight: 600 }}
            disabled={isLoading || !editShift.name.trim() || !editShift.start_time || !editShift.end_time}
          >
            {isLoading ? t('common.loading') : t('shifts.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ShiftUpdate
