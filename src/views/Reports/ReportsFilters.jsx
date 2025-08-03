import { useState, useEffect } from 'react'

import {
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Typography,
  Card
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'

const FILTERS_KEY = 'reports_filters'

const defaultFilters = {
  name: '',
  national_code: '',
  status: '',
  date_from: null,
  date_to: null
}

const statusOptions = [
  { value: '', label: '' },
  { value: 'allowed', label: 'reportCard.allowed' },
  { value: 'not_allowed', label: 'reportCard.notAllowed' }
]

const ReportsFilters = ({ onFilter }) => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)

  useEffect(() => {
    const saved = sessionStorage.getItem(FILTERS_KEY)

    if (saved) setFilters(JSON.parse(saved))
  }, [])

  const handleChange = e => {
    const { name, value } = e.target

    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
    onFilter(filters)
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    sessionStorage.removeItem(FILTERS_KEY)
    onFilter(defaultFilters)
  }

  return (
    <Card elevation={1} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
      >
        <TextField
          label={t('reportCard.name')}
          name='name'
          value={filters.name}
          onChange={handleChange}
          size='small'
          sx={{ minWidth: 150 }}
        />
        <TextField
          label={t('reportCard.nationalCode')}
          name='national_code'
          value={filters.national_code}
          onChange={handleChange}
          size='small'
          sx={{ minWidth: 150 }}
        />
        <FormControl size='small' sx={{ minWidth: 120 }}>
          <InputLabel>{t('reportCard.status')}</InputLabel>
          <Select name='status' value={filters.status} onChange={handleChange} label={t('reportCard.status')}>
            {statusOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.value ? t(opt.label) : t('common.select')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider
          dateAdapter={AdapterDateFnsJalali}
          localeText={{ okButtonLabel: t('common.ok'), cancelButtonLabel: t('common.cancel') }}
        >
          <Stack direction='row' alignItems='center' spacing={1}>
            <DateTimePicker
              label={t('reportCard.date') + ' (از)'}
              value={filters.date_from ? new Date(filters.date_from) : null}
              onChange={value => handleDateChange('date_from', value ? value.toISOString() : '')}
              ampm={false}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 170 } } }}
            />
            <Typography sx={{ mx: 1 }}>{t('reportCard.to')}</Typography>
            <DateTimePicker
              label={t('reportCard.date') + ' (تا)'}
              value={filters.date_to ? new Date(filters.date_to) : null}
              onChange={value => handleDateChange('date_to', value ? value.toISOString() : '')}
              ampm={false}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 170 } } }}
            />
          </Stack>
        </LocalizationProvider>
        <Button type='submit' variant='contained' sx={{ minWidth: 100 }}>
          {t('common.search')}
        </Button>
        <Button onClick={handleReset} sx={{ minWidth: 80 }}>
          {t('common.reset') || 'بازنشانی'}
        </Button>
      </Box>
    </Card>
  )
}

export default ReportsFilters
