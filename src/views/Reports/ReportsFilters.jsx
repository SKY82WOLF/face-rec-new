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
  Card,
  Slider
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { useGetPersons } from '@/hooks/usePersons'
import { selectGenderTypes } from '@/store/slices/typesSlice'
import { commonStyles } from '@/@core/styles/commonStyles'

const FILTERS_KEY = 'reports_filters'

const defaultFilters = {
  // API filters (sent to backend)
  gender_id: '',
  camera_id: '',
  person_id: '',

  // Manual filters (client-side)
  date_from: null,
  date_to: null
}

const cameraOptions = [
  { value: '', label: 'common.select' },
  { value: '1', label: 'Camera 1' },
  { value: '2', label: 'Camera 2' },
  { value: '3', label: 'Camera 3' }
]

const ReportsFilters = ({ onFilter }) => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)

  // Get persons for selection
  const { data: personsData } = useGetPersons({ page: 1, per_page: 100 })

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

  const handleSliderChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()

    // Convert empty strings to null for proper filtering
    const processedFilters = {
      ...filters,
      gender_id: filters.gender_id || '',
      camera_id: filters.camera_id || '',
      person_id: filters.person_id || '',
      date_from: filters.date_from || null,
      date_to: filters.date_to || null
    }

    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(processedFilters))
    onFilter(processedFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      gender_id: '',
      camera_id: '',
      person_id: '',
      date_from: null,
      date_to: null
    }

    setFilters(resetFilters)
    sessionStorage.removeItem(FILTERS_KEY)
    onFilter(resetFilters)
  }

  return (
    <Card elevation={1} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
      <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* API Filters Row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>{t('reportCard.gender')}</InputLabel>
            <Select name='gender_id' value={filters.gender_id} onChange={handleChange} label={t('reportCard.gender')}>
              <MenuItem value=''>{t('common.select')}</MenuItem>
              {genderTypes?.data?.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.translate?.trim() || type.title?.trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>{t('reportCard.camera')}</InputLabel>
            <Select name='camera_id' value={filters.camera_id} onChange={handleChange} label={t('reportCard.camera')}>
              {cameraOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.value ? opt.label : t('common.select')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>{t('reportCard.personId')}</InputLabel>
            <Select name='person_id' value={filters.person_id} onChange={handleChange} label={t('reportCard.personId')}>
              <MenuItem value=''>{t('common.select')}</MenuItem>
              {personsData?.data?.map(person => (
                <MenuItem key={person.id} value={person.id}>
                  {person.first_name} {person.last_name} (ID: {person.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Date Range Row */}
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

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button type='submit' variant='contained' sx={{ minWidth: 100 }}>
            {t('common.search')}
          </Button>
          <Button onClick={handleReset} sx={{ minWidth: 80 }}>
            {t('common.reset') || 'بازنشانی'}
          </Button>
        </Box>
      </Box>
    </Card>
  )
}

export default ReportsFilters
