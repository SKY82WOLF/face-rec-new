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
  Slider,
  Grid
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
    <Card elevation={1} sx={{ mb: 2, p: 2, borderRadius: 2, width: '100%' }}>
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        {/* API Filters Row - full width using CSS Grid */}
        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 2
          }}
        >
          <Box>
            <FormControl size='small' fullWidth>
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
          </Box>

          <Box>
            <FormControl size='small' fullWidth>
              <InputLabel>{t('reportCard.camera')}</InputLabel>
              <Select name='camera_id' value={filters.camera_id} onChange={handleChange} label={t('reportCard.camera')}>
                {cameraOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.value ? opt.label : t('common.select')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl size='small' fullWidth>
              <InputLabel>{t('reportCard.personId')}</InputLabel>
              <Select
                name='person_id'
                value={filters.person_id}
                onChange={handleChange}
                label={t('reportCard.personId')}
              >
                <MenuItem value=''>{t('common.select')}</MenuItem>
                {personsData?.data?.map(person => (
                  <MenuItem key={person.id} value={person.id}>
                    {person.first_name} {person.last_name} (ID: {person.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Date Range Row - full width */}
        <LocalizationProvider
          dateAdapter={AdapterDateFnsJalali}
          localeText={{ okButtonLabel: t('common.ok'), cancelButtonLabel: t('common.cancel') }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2
            }}
          >
            <Box>
              <DateTimePicker
                label={t('reportCard.date') + ' (از)'}
                value={filters.date_from ? new Date(filters.date_from) : null}
                onChange={value => handleDateChange('date_from', value ? value.toISOString() : '')}
                ampm={false}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Box>
            <Box>
              <DateTimePicker
                label={t('reportCard.date') + ' (تا)'}
                value={filters.date_to ? new Date(filters.date_to) : null}
                onChange={value => handleDateChange('date_to', value ? value.toISOString() : '')}
                ampm={false}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Box>
          </Box>
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
