'use client'

import { useState, useEffect } from 'react'

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  OutlinedInput,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import { useTranslation } from '@/translations/useTranslation'
import { useGetPersons } from '@/hooks/usePersons'

const FILTERS_KEY = 'attendance_filters'

// Get default date range (last 7 days)
const getDefaultDateRange = () => {
  const endDate = new Date()
  const startDate = new Date()

  startDate.setDate(startDate.getDate() - 7)

  // Set start date to beginning of day (00:00:00)
  startDate.setHours(0, 0, 0, 0)

  // Set end date to end of day (23:59:59)
  endDate.setHours(23, 59, 59, 999)

  return {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString()
  }
}

const defaultFilters = {
  person_id: [],
  start_date: null,
  end_date: null
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

const AttendanceFilters = ({ onFilter }) => {
  const { t } = useTranslation()

  // Persons for person_id select (only access 5,6)
  const { data: personsData } = useGetPersons({ page: 1, per_page: 1000, filters: { access_id: [5, 6] } })

  const [selectedPerson, setSelectedPerson] = useState('')

  const [dateFilters, setDateFilters] = useState(() => {
    const defaultRange = getDefaultDateRange()

    return {
      start_date: defaultRange.start_date,
      end_date: defaultRange.end_date
    }
  })

  // Load saved filters from session (if any)
  useEffect(() => {
    const saved = sessionStorage.getItem(FILTERS_KEY)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        setSelectedPerson(parsed.person_id && parsed.person_id.length > 0 ? parsed.person_id[0] : '')
        setDateFilters({
          start_date: parsed.start_date || getDefaultDateRange().start_date,
          end_date: parsed.end_date || getDefaultDateRange().end_date
        })
      } catch (error) {
        console.error('Error loading saved filters:', error)
      }
    }
  }, [])

  const handlePersonChange = event => {
    const value = event.target.value

    setSelectedPerson(value)
  }

  const handleDateChange = (field, value) => {
    setDateFilters(prev => ({
      ...prev,
      [field]: value ? value.toISOString().split('T')[0] + 'T00:00:00.000Z' : getDefaultDateRange()[field]
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()

    // Validate that a person is selected
    if (!selectedPerson) {
      return // Don't submit if no person is selected
    }

    const filters = {
      person_id: [selectedPerson],
      start_date: dateFilters.start_date,
      end_date: dateFilters.end_date
    }

    // Save to session storage
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(filters))

    // Call parent callback
    onFilter(filters)
  }

  const handleReset = () => {
    setSelectedPerson('')
    const defaultRange = getDefaultDateRange()

    setDateFilters({
      start_date: defaultRange.start_date,
      end_date: defaultRange.end_date
    })

    // Clear session storage
    sessionStorage.removeItem(FILTERS_KEY)

    // Call parent with default filters
    onFilter({
      person_id: [],
      start_date: defaultRange.start_date,
      end_date: defaultRange.end_date
    })
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 2, pb: '8px!important' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 2 },
            '& .MuiFormControl-root, & .MuiTextField-root, & .MuiButton-root': {
              width: { xs: '100%', sm: 'auto' }
            }
          }}
        >
          <Accordion
            sx={{
              boxShadow: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              ml: 1,
              '&.Mui-expanded': { boxShadow: 'none' },
              p: 0
            }}
            disableGutters
            defaultExpanded
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ rotate: '90deg', transition: 'transform 0.3s ease-in-out' }} />}
              sx={{ minHeight: 36, '& .MuiAccordionSummary-content': { my: 0 } }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ fontSize: 16, mr: 1 }} />
                {t('attendance.filters')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                py: 1
              }}
            >
              <Box
                component='form'
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
              >
                {/* Person single select using fetched persons (access 5,6) */}
                <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 320 } }}>
                  <InputLabel>{t('attendance.person') || 'Person'}</InputLabel>
                  <Select
                    value={selectedPerson}
                    onChange={handlePersonChange}
                    input={<OutlinedInput label={t('attendance.person') || 'Person'} />}
                    MenuProps={MenuProps}
                  >
                    {(personsData?.data || personsData || []).map(person => (
                      <MenuItem key={person.person_id || person.id} value={person.person_id || person.id}>
                        {person.first_name || ''} {person.last_name || ''} ({person.person_id || person.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                      <DatePicker
                        label={t('attendance.startDate') + ' (از)'}
                        value={dateFilters.start_date ? new Date(dateFilters.start_date) : null}
                        onChange={value => handleDateChange('start_date', value)}
                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { width: '100%!important' } } }}
                      />
                    </Box>
                    <Box>
                      <DatePicker
                        label={t('attendance.endDate') + ' (تا)'}
                        value={dateFilters.end_date ? new Date(dateFilters.end_date) : null}
                        onChange={value => handleDateChange('end_date', value)}
                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { width: '100%!important' } } }}
                      />
                    </Box>
                  </Box>
                </LocalizationProvider>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 1 }}>
                  <Button type='submit' variant='contained' disabled={!selectedPerson} sx={{ minWidth: 100 }}>
                    {t('common.search')}
                  </Button>
                  <Button onClick={handleReset} sx={{ minWidth: 80 }}>
                    {t('common.reset') || 'بازنشانی'}
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default AttendanceFilters
