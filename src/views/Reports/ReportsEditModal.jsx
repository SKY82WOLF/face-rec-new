import { useState } from 'react'

import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  DialogActions
} from '@mui/material'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

import { commonStyles } from '@/@core/styles/commonStyles'
import { useTranslation } from '@/translations/useTranslation'

const modalStyle = {
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 500
}

const statusOptions = [
  { value: 'allowed', label: 'reportCard.allowed' },
  { value: 'not_allowed', label: 'reportCard.notAllowed' }
]

const ReportsEditModal = ({ open, onClose, reportData }) => {
  const { t } = useTranslation()
  const [form, setForm] = useState({ ...reportData })

  const handleChange = e => {
    const { name, value } = e.target

    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()

    // Here you would call an API or mutate data
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box sx={modalStyle} component='form' onSubmit={handleSubmit}>
          <Typography variant='h6' mb={2}>
            {t('common.edit')}
          </Typography>
          <TextField
            label={t('reportCard.name')}
            name='first_name'
            value={form.first_name || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('reportCard.lastName')}
            name='last_name'
            value={form.last_name || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('reportCard.nationalCode')}
            name='national_code'
            value={form.national_code || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('reportCard.status')}</InputLabel>
            <Select name='status' value={form.status || ''} onChange={handleChange} label={t('reportCard.status')}>
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
            <DateTimePicker
              label={t('reportCard.date')}
              value={form.date ? new Date(form.date) : null}
              onChange={value => setForm(prev => ({ ...prev, date: value ? value.toISOString() : '' }))}
              ampm={false}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            />
          </LocalizationProvider>
          <DialogActions sx={{ justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
            <Button type='submit' variant='contained'>
              {t('common.save')}
            </Button>
          </DialogActions>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ReportsEditModal
