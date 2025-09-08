import { useState, useEffect, useRef } from 'react'

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
  Grid,
  OutlinedInput,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { useGetPersons } from '@/hooks/usePersons'
import useCameras from '@/hooks/useCameras'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import { commonStyles } from '@/@core/styles/commonStyles'

const FILTERS_KEY = 'reports_filters'

const defaultFilters = {
  // API filters (sent to backend)
  access_id: [],
  gender_id: [],
  camera_id: [],

  // Search fields (text/select)
  first_name: '',
  last_name: '',
  person_id: '',
  national_code: '',

  // Date filters (UTC) - will be sent as created_at_from / created_at_to
  created_at_from: null,
  created_at_to: null
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

const ReportsFilters = ({ onFilter }) => {
  const { t } = useTranslation()

  // Types & access
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)

  // Cameras from API
  const { cameras: camerasData } = useCameras({ page: 1, per_page: 100 })

  // Persons for person_id select (only access 5,6)
  const { data: personsData } = useGetPersons({ page: 1, per_page: 200, filters: { access_id: [5, 6] } })

  const [selectedAccess, setSelectedAccess] = useState(defaultFilters.access_id || [5, 6])
  const [selectedGender, setSelectedGender] = useState(defaultFilters.gender_id || [])
  const [selectedPersons, setSelectedPersons] = useState(defaultFilters.person_id || [])
  const [selectedCameras, setSelectedCameras] = useState(defaultFilters.camera_id || [])

  const [dateFilters, setDateFilters] = useState({
    created_at_from: defaultFilters.created_at_from,
    created_at_to: defaultFilters.created_at_to
  })

  // NOTE: We only send filters on submit/reset. No auto-send on change.

  // Load saved filters from session (if any)
  useEffect(() => {
    const saved = sessionStorage.getItem(FILTERS_KEY)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        setSelectedAccess(parsed.access_id || [])
        setSelectedGender(parsed.gender_id || [])
        setSelectedCameras(parsed.camera_id || [])
        setSelectedPersons(parsed.person_id || [])
        setDateFilters({
          created_at_from: parsed.created_at_from || null,
          created_at_to: parsed.created_at_to || null
        })
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const buildFilters = () => {
    const filters = {}

    if (selectedAccess && selectedAccess.length > 0) filters.access_id = selectedAccess
    if (selectedGender && selectedGender.length > 0) filters.gender_id = selectedGender
    if (selectedCameras && selectedCameras.length > 0) filters.camera_id = selectedCameras

    if (dateFilters.created_at_from) filters.created_at_from = dateFilters.created_at_from
    if (dateFilters.created_at_to) filters.created_at_to = dateFilters.created_at_to

    // person_id is multi-select
    if (selectedPersons && selectedPersons.length > 0) filters.person_id = selectedPersons

    return filters
  }

  const sendFilters = () => {
    const filters = buildFilters()
    const serialized = JSON.stringify(filters || {})

    sessionStorage.setItem(FILTERS_KEY, serialized)
    onFilter && onFilter(filters)
  }

  const handleReset = () => {
    setSelectedAccess([5, 6])
    setSelectedGender([])
    setSelectedPersons([])
    setSelectedCameras([])
    setDateFilters({ created_at_from: null, created_at_to: null })

    sessionStorage.removeItem(FILTERS_KEY)

    // reset and send empty filters
    sendFilters()
  }

  const handleDateChange = (name, value) => {
    // Convert to ISO string in UTC if value provided; otherwise null
    const iso = value ? new Date(value).toISOString() : null

    setDateFilters(prev => ({ ...prev, [name]: iso }))
  }

  const handlePersonChange = e =>
    setSelectedPersons(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)

  const handleSubmit = e => {
    e && e.preventDefault()
    sendFilters()
  }

  const handleAccessChange = e =>
    setSelectedAccess(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)

  const handleGenderChange = e =>
    setSelectedGender(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)

  const handleCamerasChange = e =>
    setSelectedCameras(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)

  return (
    <Card elevation={1} sx={{ mb: 2, borderRadius: 2, width: '100%' }}>
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
              {t('reportCard.search')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{ backgroundColor: 'transparent', boxShadow: 'none', display: 'flex', gap: 1, flexWrap: 'wrap', py: 1 }}
          >
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
                  <FormControl size='small' fullWidth sx={{ width: '100%!important' }}>
                    <InputLabel>{t('access.filter.access') || 'Access'}</InputLabel>
                    <Select
                      multiple
                      value={selectedAccess}
                      onChange={handleAccessChange}
                      input={<OutlinedInput label={t('access.filter.access') || 'Access'} />}
                      renderValue={selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => {
                            const type = accessTypes?.data?.find(t => t.id === value)

                            return <Chip key={value} label={type?.translate || type?.title || value} size='small' />
                          })}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {accessTypes?.data?.map(type => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.translate?.trim() || type.title?.trim()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormControl size='small' fullWidth sx={{ width: '100%!important' }}>
                    <InputLabel>{t('access.filter.gender') || 'Gender'}</InputLabel>
                    <Select
                      multiple
                      value={selectedGender}
                      onChange={handleGenderChange}
                      input={<OutlinedInput label={t('access.filter.gender') || 'Gender'} />}
                      renderValue={selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => {
                            const type = genderTypes?.data?.find(t => t.id === value)

                            return <Chip key={value} label={type?.translate || type?.title || value} size='small' />
                          })}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {genderTypes?.data?.map(type => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.translate?.trim() || type.title?.trim()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormControl size='small' fullWidth sx={{ width: '100%!important' }}>
                    <InputLabel>{t('reportCard.camera') || 'Camera'}</InputLabel>
                    <Select
                      multiple
                      value={selectedCameras}
                      onChange={handleCamerasChange}
                      input={<OutlinedInput label={t('reportCard.camera') || 'Camera'} />}
                      renderValue={selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => (
                            <Chip key={value} label={`Camera ${value}`} size='small' />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {camerasData?.map(cam => (
                        <MenuItem key={cam.id || cam.camera_id || cam} value={cam.id || cam.camera_id || cam}>
                          {cam.title || cam.name || `Camera ${cam.id || cam.camera_id || cam}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Person multi-select using fetched persons (access 5,6) */}
              <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 320 } }}>
                <InputLabel>{t('access.filter.persons') || 'Persons'}</InputLabel>
                <Select
                  multiple
                  value={selectedPersons}
                  onChange={handlePersonChange}
                  input={<OutlinedInput label={t('access.filter.persons') || 'Persons'} />}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => {
                        const p =
                          personsData?.data?.find(x => x.person_id === value || x.id === value) ||
                          personsData?.find?.(x => x.person_id === value || x.id === value)

                        const label = p
                          ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.person_id || p.id || value
                          : value

                        return <Chip key={value} label={label} size='small' />
                      })}
                    </Box>
                  )}
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
                    <DateTimePicker
                      label={t('reportCard.date') + ' (از)'}
                      value={dateFilters.created_at_from ? new Date(dateFilters.created_at_from) : null}
                      onChange={value => handleDateChange('created_at_from', value)}
                      ampm={false}
                      timeSteps={{ minutes: 1 }}
                      slotProps={{ textField: { size: 'small', fullWidth: true, sx: { width: '100%!important' } } }}
                    />
                  </Box>
                  <Box>
                    <DateTimePicker
                      label={t('reportCard.date') + ' (تا)'}
                      value={dateFilters.created_at_to ? new Date(dateFilters.created_at_to) : null}
                      onChange={value => handleDateChange('created_at_to', value)}
                      ampm={false}
                      timeSteps={{ minutes: 1 }}
                      slotProps={{ textField: { size: 'small', fullWidth: true, sx: { width: '100%!important' } } }}
                    />
                  </Box>
                </Box>
              </LocalizationProvider>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 1 }}>
                <Button type='submit' variant='contained' sx={{ minWidth: 100 }}>
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
    </Card>
  )
}

export default ReportsFilters
