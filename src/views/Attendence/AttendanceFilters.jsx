'use client'

import { useState, useEffect, useRef } from 'react'

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
import { usePersonShifts } from '@/hooks/useAttendence'
import useCameras from '@/hooks/useCameras'
import { useGSAP } from '@/hooks/useGSAP'

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
  end_date: null,
  shift_ids: '',
  camera_direction: '',
  entry_cam_ids: [],
  exit_cam_ids: [],
  entry_exit_cam_ids: []
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
  const containerRef = useRef(null)

  // Mount animation using existing GSAP hook; avoids FOUC via initial styles
  useGSAP(
    containerRef,
    gsap => {
      const el = containerRef.current

      if (!el) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(el, { opacity: 0, y: 18, scale: 0.995 }, { opacity: 1, y: 0, scale: 1, duration: 1.5 })
    },
    []
  )

  // Persons for person_id select (only access 5,6)
  const { data: personsData } = useGetPersons({ page: 1, per_page: 1000, filters: { access_id: [5, 6] } })

  const [selectedPerson, setSelectedPerson] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [cameraDirection, setCameraDirection] = useState('')
  const [entryCameraIds, setEntryCameraIds] = useState([])
  const [exitCameraIds, setExitCameraIds] = useState([])
  const [cameraIds, setCameraIds] = useState([])

  // Define custom camera direction types for attendance
  const cameraDirectionOptions = [
    { id: 'entry_exit_separate', title: 'ورودی و خروجی', translate: 'ورودی و خروجی' },
    { id: 'entry_exit_combined', title: 'ورودی خروجی', translate: 'ورودی خروجی' }
  ]

  // Get person shifts when person is selected
  const { shifts } = usePersonShifts({ personId: selectedPerson, enabled: !!selectedPerson })

  // Get cameras based on direction selection
  const { cameras: entryCameras } = useCameras({
    page: 1,
    per_page: 1000,
    filters: { direction_id: 9 } // entry cameras
  })

  const { cameras: exitCameras } = useCameras({
    page: 1,
    per_page: 1000,
    filters: { direction_id: 10 } // exit cameras
  })

  const { cameras: entryExitCameras } = useCameras({
    page: 1,
    per_page: 1000,
    filters: { direction_id: 11 } // entry-exit cameras
  })

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
        setSelectedShift(parsed.shift_ids || '')
        setCameraDirection(parsed.camera_direction || '')
        setEntryCameraIds(parsed.entry_cam_ids || [])
        setExitCameraIds(parsed.exit_cam_ids || [])
        setCameraIds(parsed.entry_exit_cam_ids || [])
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

    // Reset shift when person changes
    setSelectedShift('')
  }

  const handleShiftChange = event => {
    setSelectedShift(event.target.value)
  }

  const handleCameraDirectionChange = event => {
    const value = event.target.value

    setCameraDirection(value)

    // Reset camera selections when direction changes
    setEntryCameraIds([])
    setExitCameraIds([])
    setCameraIds([])
  }

  const handleEntryCameraChange = event => {
    const value = event.target.value

    setEntryCameraIds(typeof value === 'string' ? value.split(',') : value)
  }

  const handleExitCameraChange = event => {
    const value = event.target.value

    setExitCameraIds(typeof value === 'string' ? value.split(',') : value)
  }

  const handleCameraChange = event => {
    const value = event.target.value

    setCameraIds(typeof value === 'string' ? value.split(',') : value)
  }

  const handleDateChange = (field, value) => {
    setDateFilters(prev => ({
      ...prev,
      [field]: value ? value.toISOString().split('T')[0] + 'T00:00:00.000Z' : getDefaultDateRange()[field]
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()

    // Validate required fields
    if (!selectedPerson || !selectedShift || !cameraDirection) {
      return // Don't submit if required fields are missing
    }

    // Validate camera selections based on direction
    if (cameraDirection === 'entry_exit_combined' && (!cameraIds || cameraIds.length === 0)) {
      // entry-exit combined
      return
    }

    if (
      cameraDirection === 'entry_exit_separate' &&
      (!entryCameraIds || entryCameraIds.length === 0 || !exitCameraIds || exitCameraIds.length === 0)
    ) {
      // entry and exit separate
      return
    }

    const filters = {
      person_id: [selectedPerson],
      start_date: dateFilters.start_date,
      end_date: dateFilters.end_date,
      shift_ids: selectedShift,
      camera_direction: cameraDirection
    }

    // Add camera IDs based on direction type
    if (cameraDirection === 'entry_exit_combined') {
      // entry-exit combined
      filters.entry_exit_cam_ids = cameraIds
    } else if (cameraDirection === 'entry_exit_separate') {
      // entry and exit separate
      filters.entry_cam_ids = entryCameraIds
      filters.exit_cam_ids = exitCameraIds
    }

    // Save to session storage
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(filters))

    // Call parent callback
    onFilter(filters)
  }

  const handleReset = () => {
    setSelectedPerson('')
    setSelectedShift('')
    setCameraDirection('')
    setEntryCameraIds([])
    setExitCameraIds([])
    setCameraIds([])
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
      end_date: defaultRange.end_date,
      shift_ids: '',
      camera_direction: '',
      entry_cam_ids: [],
      exit_cam_ids: [],
      entry_exit_cam_ids: []
    })
  }

  return (
    <Card ref={containerRef} sx={{ mb: 3, opacity: 0, transform: 'translateY(18px) scale(0.995)' }}>
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

                {/* Shift Select - appears when person is selected */}
                {selectedPerson && (
                  <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 320 } }}>
                    <InputLabel>{t('attendance.shift') || t('shifts.title') || 'شیفت'}</InputLabel>
                    <Select
                      value={selectedShift}
                      onChange={handleShiftChange}
                      input={<OutlinedInput label={t('attendance.shift') || t('shifts.title') || 'شیفت'} />}
                      MenuProps={MenuProps}
                    >
                      {shifts.map(shift => (
                        <MenuItem key={shift.id} value={shift.id}>
                          {shift.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Camera Direction Type */}
                <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 320 } }}>
                  <InputLabel>{t('cameras.direction') || 'نوع دوربین'}</InputLabel>
                  <Select
                    value={cameraDirection}
                    onChange={handleCameraDirectionChange}
                    input={<OutlinedInput label={t('cameras.direction') || 'نوع دوربین'} />}
                    MenuProps={MenuProps}
                  >
                    {cameraDirectionOptions.map(direction => (
                      <MenuItem key={direction.id} value={direction.id}>
                        {direction.translate || direction.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Camera Selects - conditional based on direction */}
                {cameraDirection === 'entry_exit_combined' && ( // entry-exit combined
                  <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 320 } }}>
                    <InputLabel>{t('cameras.directionOptions.entryExit') || 'دوربین'}</InputLabel>
                    <Select
                      multiple
                      value={cameraIds}
                      onChange={handleCameraChange}
                      input={<OutlinedInput label={t('cameras.directionOptions.entryExit') || 'دوربین'} />}
                      MenuProps={MenuProps}
                      renderValue={selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => {
                            const camera = entryExitCameras.find(c => c.id.toString() === value.toString())

                            return (
                              <Chip
                                key={value}
                                label={camera?.name || value}
                                size='small'
                                onDelete={() => {
                                  const newIds = cameraIds.filter(id => id !== value)

                                  setCameraIds(newIds)
                                }}
                                onMouseDown={event => {
                                  event.stopPropagation()
                                }}
                              />
                            )
                          })}
                        </Box>
                      )}
                    >
                      {entryExitCameras.map(camera => (
                        <MenuItem key={camera.id} value={camera.id}>
                          {camera.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {cameraDirection === 'entry_exit_separate' && ( // entry and exit separate
                  <>
                    <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 320 } }}>
                      <InputLabel>{t('cameras.directionOptions.entry') || 'دوربین ورودی'}</InputLabel>
                      <Select
                        multiple
                        value={entryCameraIds}
                        onChange={handleEntryCameraChange}
                        input={<OutlinedInput label={t('cameras.directionOptions.entry') || 'دوربین ورودی'} />}
                        MenuProps={MenuProps}
                        renderValue={selected => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map(value => {
                              const camera = entryCameras.find(c => c.id.toString() === value.toString())

                              return (
                                <Chip
                                  key={value}
                                  label={camera?.name || value}
                                  size='small'
                                  onDelete={() => {
                                    const newIds = entryCameraIds.filter(id => id !== value)

                                    setEntryCameraIds(newIds)
                                  }}
                                  onMouseDown={event => {
                                    event.stopPropagation()
                                  }}
                                />
                              )
                            })}
                          </Box>
                        )}
                      >
                        {entryCameras.map(camera => (
                          <MenuItem key={camera.id} value={camera.id}>
                            {camera.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 320 } }}>
                      <InputLabel>{t('cameras.directionOptions.exit') || 'دوربین خروجی'}</InputLabel>
                      <Select
                        multiple
                        value={exitCameraIds}
                        onChange={handleExitCameraChange}
                        input={<OutlinedInput label={t('cameras.directionOptions.exit') || 'دوربین خروجی'} />}
                        MenuProps={MenuProps}
                        renderValue={selected => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map(value => {
                              const camera = exitCameras.find(c => c.id.toString() === value.toString())

                              return (
                                <Chip
                                  key={value}
                                  label={camera?.name || value}
                                  size='small'
                                  onDelete={() => {
                                    const newIds = exitCameraIds.filter(id => id !== value)

                                    setExitCameraIds(newIds)
                                  }}
                                  onMouseDown={event => {
                                    event.stopPropagation()
                                  }}
                                />
                              )
                            })}
                          </Box>
                        )}
                      >
                        {exitCameras.map(camera => (
                          <MenuItem key={camera.id} value={camera.id}>
                            {camera.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}

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
                        label={t('attendance.startDate') || 'تاریخ شروع'}
                        value={dateFilters.start_date ? new Date(dateFilters.start_date) : null}
                        onChange={value => handleDateChange('start_date', value)}
                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { width: '100%!important' } } }}
                      />
                    </Box>
                    <Box>
                      <DatePicker
                        label={t('attendance.endDate') || 'تاریخ پایان'}
                        value={dateFilters.end_date ? new Date(dateFilters.end_date) : null}
                        onChange={value => handleDateChange('end_date', value)}
                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { width: '100%!important' } } }}
                      />
                    </Box>
                  </Box>
                </LocalizationProvider>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 1 }}>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={
                      !selectedPerson ||
                      !selectedShift ||
                      !cameraDirection ||
                      (cameraDirection === 'entry_exit_combined' && (!cameraIds || cameraIds.length === 0)) ||
                      (cameraDirection === 'entry_exit_separate' &&
                        (!entryCameraIds ||
                          entryCameraIds.length === 0 ||
                          !exitCameraIds ||
                          exitCameraIds.length === 0))
                    }
                    sx={{ minWidth: 100 }}
                  >
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
