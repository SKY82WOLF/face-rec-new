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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  TextField,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  InputAdornment,
  Autocomplete,
  Chip
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InfoIcon from '@mui/icons-material/Info'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import { useGetPersons } from '@/hooks/usePersons'

const weekDays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const ShiftUpdate = ({ open, onClose, onSubmit, shift, isLoading = false }) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = React.useState(0)
  const [customReset, setCustomReset] = React.useState('')
  const [shiftResetUnit, setShiftResetUnit] = React.useState(3600)
  const [startOffsetUnit, setStartOffsetUnit] = React.useState(60)
  const [endOffsetUnit, setEndOffsetUnit] = React.useState(60)
  const [breakUnit, setBreakUnit] = React.useState(60)
  const [totalBreakUnit, setTotalBreakUnit] = React.useState(60)
  const [selectedDays, setSelectedDays] = React.useState([])
  const [shiftResetOption, setShiftResetOption] = React.useState(86400)
  const [selectedPersons, setSelectedPersons] = React.useState([])

  const timeUnitOptions = [
    { value: 60, label: t('shifts.timeUnits.minutes') },
    { value: 3600, label: t('shifts.timeUnits.hours') },
    { value: 1, label: t('shifts.timeUnits.seconds') }
  ]

  const resetOptions = [
    { value: 86400, label: t('shifts.resetOptions.hours24') },
    { value: 172800, label: t('shifts.resetOptions.hours48') },
    { value: 259200, label: t('shifts.resetOptions.hours72') },
    { value: 'custom', label: t('shifts.resetOptions.custom') }
  ]

  const [editShift, setEditShift] = React.useState({
    title: '',
    start_date: '',
    end_date: '',
    start_offset: 5,
    end_offset: 5,
    break: 15,
    total_break: 30,
    shift_reset: 86400,
    is_active: true,
    days_times: {},
    persons: []
  })

  // Get all persons for selection
  const { data: personsData, isLoading: isLoadingPersons } = useGetPersons({
    page: 1,
    per_page: 1000 // Get all persons
  })

  // For the uniform time across multiple days
  const [uniformTime, setUniformTime] = React.useState({
    start: '08:00',
    end: '16:00'
  })

  // Initialize form with shift data when it becomes available
  React.useEffect(() => {
    if (shift) {
      // Initialize with shift data
      setEditShift({
        title: shift.title || '',
        start_date: shift.start_date || '',
        end_date: shift.end_date || '',
        start_offset: shift.start_offset ?? 5,
        end_offset: shift.end_offset ?? 5,
        break: shift.break ?? 15,
        total_break: shift.total_break ?? 30,
        shift_reset: shift.shift_reset ?? 86400,
        is_active: shift.is_active !== undefined ? shift.is_active : true,
        days_times: shift.days_times || {},
        persons: shift.persons || []
      })

      // Set appropriate units based on the values
      setStartOffsetUnit(getAppropriateUnit(shift.start_offset))
      setEndOffsetUnit(getAppropriateUnit(shift.end_offset))
      setBreakUnit(getAppropriateUnit(shift.break))
      setTotalBreakUnit(getAppropriateUnit(shift.total_break))

      // Handle shift reset options
      const resetValue = shift.shift_reset || 86400

      if (resetValue === 86400 || resetValue === 172800 || resetValue === 259200) {
        setShiftResetOption(resetValue)
      } else {
        setShiftResetOption('custom')
        setShiftResetUnit(getAppropriateUnit(resetValue))
        setCustomReset(Math.round(resetValue / getAppropriateUnit(resetValue)))
      }

      // Convert offset values to appropriate units
      setEditShift(prev => ({
        ...prev,
        start_offset: Math.round((shift.start_offset ?? 5) / getAppropriateUnit(shift.start_offset ?? 5)),
        end_offset: Math.round((shift.end_offset ?? 5) / getAppropriateUnit(shift.end_offset ?? 5)),
        break: Math.round((shift.break ?? 15) / getAppropriateUnit(shift.break ?? 15)),
        total_break: Math.round((shift.total_break ?? 30) / getAppropriateUnit(shift.total_break ?? 30))
      }))

      // Set selected persons from shift data
      if (shift.persons && Array.isArray(shift.persons) && personsData?.data) {
        // shift.persons may be an array of IDs or objects returned by the dedicated endpoint
        const selectedPersonObjects = shift.persons
          .map(p => {
            const pid = typeof p === 'number' ? p : (p.person_id ?? p.id)

            return personsData.data.find(person => person.id === pid)
          })
          .filter(Boolean)

        if (selectedPersonObjects.length) {
          setSelectedPersons(selectedPersonObjects)

          setEditShift(prev => ({ ...prev, persons: selectedPersonObjects.map(p => p.id) }))
        }
      }
    }
  }, [shift, personsData])

  // Separate effect to handle persons selection when persons data loads
  React.useEffect(() => {
    if (shift?.persons && personsData?.data && selectedPersons.length === 0) {
      const selectedPersonObjects = shift.persons
        .map(p => {
          const pid = typeof p === 'number' ? p : (p.person_id ?? p.id)

          return personsData.data.find(person => person.id === pid)
        })
        .filter(Boolean)

      if (selectedPersonObjects.length) {
        setSelectedPersons(selectedPersonObjects)
        setEditShift(prev => ({ ...prev, persons: selectedPersonObjects.map(p => p.id) }))
      }
    }
  }, [personsData, shift?.persons, selectedPersons.length])

  // Helper function to determine the most appropriate unit for a time value
  const getAppropriateUnit = timeValue => {
    if (timeValue === undefined || timeValue === null) return 60
    if (timeValue % 3600 === 0) return 3600
    if (timeValue % 60 === 0) return 60

    return 1
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target

    setEditShift(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleDateChange = (name, date) => {
    setEditShift(prev => ({
      ...prev,
      [name]: date ? date.toISOString().split('T')[0] : ''
    }))
  }

  const handleShiftResetChange = event => {
    const value = event.target.value

    setShiftResetOption(value)

    if (value === 'custom') {
      setCustomReset('24')
      setEditShift(prev => ({
        ...prev,
        shift_reset: 24 * shiftResetUnit
      }))
    } else {
      setEditShift(prev => ({
        ...prev,
        shift_reset: value
      }))
    }
  }

  const handleCustomResetChange = e => {
    const value = e.target.value

    setCustomReset(value)

    const numericValue = parseInt(value) || 0

    setEditShift(prev => ({
      ...prev,
      shift_reset: numericValue * shiftResetUnit
    }))
  }

  const handleUniformTimeChange = (field, value) => {
    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

    if (value && !timeRegex.test(value)) {
      return // Invalid time format, don't update
    }

    setUniformTime(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDaySelection = day => {
    setSelectedDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]))
  }

  const handleAddDayTime = () => {
    const updatedDaysTimes = { ...editShift.days_times }

    selectedDays.forEach(day => {
      updatedDaysTimes[day] = [{ start: uniformTime.start, end: uniformTime.end }]
    })

    setEditShift(prev => ({
      ...prev,
      days_times: updatedDaysTimes
    }))

    // Reset selected days after adding
    setSelectedDays([])
  }

  const handleSpecificDayTimeChange = (day, index, field, value) => {
    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

    if (value && !timeRegex.test(value)) {
      return // Invalid time format, don't update
    }

    const updatedDaysTimes = { ...editShift.days_times }

    if (!updatedDaysTimes[day]) {
      updatedDaysTimes[day] = []
    }

    if (!updatedDaysTimes[day][index]) {
      updatedDaysTimes[day][index] = { start: '09:00', end: '17:00' }
    }

    updatedDaysTimes[day][index][field] = value

    setEditShift(prev => ({
      ...prev,
      days_times: updatedDaysTimes
    }))
  }

  const handleAddTimeSlotForDay = day => {
    const updatedDaysTimes = { ...editShift.days_times }

    if (!updatedDaysTimes[day]) {
      updatedDaysTimes[day] = []
    }

    updatedDaysTimes[day].push({ start: '09:00', end: '17:00' })

    setEditShift(prev => ({
      ...prev,
      days_times: updatedDaysTimes
    }))
  }

  const handleDeleteTimeSlotForDay = (day, index) => {
    const updatedDaysTimes = { ...editShift.days_times }

    updatedDaysTimes[day].splice(index, 1)

    if (updatedDaysTimes[day].length === 0) {
      delete updatedDaysTimes[day]
    }

    setEditShift(prev => ({
      ...prev,
      days_times: updatedDaysTimes
    }))
  }

  const handleStartOffsetChange = value => {
    // allow empty while typing, convert to number on blur
    if (value === '') {
      setEditShift(prev => ({ ...prev, start_offset: '' }))

      return
    }

    const numericValue = parseInt(value) || 0

    setEditShift(prev => ({
      ...prev,
      start_offset: numericValue
    }))
  }

  const handleEndOffsetChange = value => {
    if (value === '') {
      setEditShift(prev => ({ ...prev, end_offset: '' }))

      return
    }

    const numericValue = parseInt(value) || 0

    setEditShift(prev => ({
      ...prev,
      end_offset: numericValue
    }))
  }

  const handleBreakChange = value => {
    if (value === '') {
      setEditShift(prev => ({ ...prev, break: '' }))

      return
    }

    const numericValue = parseInt(value) || 0

    setEditShift(prev => ({
      ...prev,
      break: numericValue
    }))
  }

  const handleTotalBreakChange = value => {
    if (value === '') {
      setEditShift(prev => ({ ...prev, total_break: '' }))

      return
    }

    const numericValue = parseInt(value) || 0

    setEditShift(prev => ({
      ...prev,
      total_break: numericValue
    }))
  }

  const handleUnitChange = (type, value) => {
    switch (type) {
      case 'startOffset':
        setStartOffsetUnit(value)

        // Convert current value to seconds, then to new unit
        const currentStartOffset = editShift.start_offset * startOffsetUnit

        setEditShift(prev => ({
          ...prev,
          start_offset: Math.round(currentStartOffset / value)
        }))
        break
      case 'endOffset':
        setEndOffsetUnit(value)
        const currentEndOffset = editShift.end_offset * endOffsetUnit

        setEditShift(prev => ({
          ...prev,
          end_offset: Math.round(currentEndOffset / value)
        }))
        break
      case 'break':
        setBreakUnit(value)
        const currentBreak = editShift.break * breakUnit

        setEditShift(prev => ({
          ...prev,
          break: Math.round(currentBreak / value)
        }))
        break
      case 'totalBreak':
        setTotalBreakUnit(value)
        const currentTotalBreak = editShift.total_break * totalBreakUnit

        setEditShift(prev => ({
          ...prev,
          total_break: Math.round(currentTotalBreak / value)
        }))
        break
      case 'shiftReset':
        setShiftResetUnit(value)

        if (shiftResetOption === 'custom') {
          setEditShift(prev => ({
            ...prev,
            shift_reset: parseInt(customReset) * value
          }))
        }

        break
    }
  }

  const handlePersonChange = (event, newValue) => {
    setSelectedPersons(newValue)
    setEditShift(prev => ({
      ...prev,
      persons: newValue.map(person => person.id)
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Prepare data for submission
    const submissionData = {
      ...editShift,
      title: editShift.title.trim(),

      // Make sure these values are in seconds in the API
      start_offset: editShift.start_offset * startOffsetUnit,
      end_offset: editShift.end_offset * endOffsetUnit,
      break: editShift.break * breakUnit,
      total_break: editShift.total_break * totalBreakUnit,
      shift_reset: shiftResetOption === 'custom' ? parseInt(customReset) * shiftResetUnit : parseInt(shiftResetOption)
    }

    await onSubmit({ id: shift.id, data: submissionData })
    handleClose()
  }

  const handleClose = () => {
    setActiveTab(0)
    setSelectedDays([])
    setSelectedPersons([])
    onClose()
  }

  // Time validation helper
  const isValidTime = timeString => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

    return timeRegex.test(timeString)
  }

  // Convert HH:MM string to Date for TimePicker
  const timeStringToDate = time => {
    if (!time || !isValidTime(time)) return null
    const [hh, mm] = time.split(':').map(Number)
    const d = new Date()

    d.setHours(hh, mm, 0, 0)

    return d
  }

  // Convert Date from TimePicker to HH:MM string
  const dateToTimeString = date => {
    if (!(date instanceof Date) || isNaN(date)) return ''
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')

    return `${hh}:${mm}`
  }

  const translateDay = day => {
    const dayTranslations = {
      saturday: 'شنبه',
      sunday: 'یکشنبه',
      monday: 'دوشنبه',
      tuesday: 'سه‌شنبه',
      wednesday: 'چهارشنبه',
      thursday: 'پنج‌شنبه',
      friday: 'جمعه'
    }

    return dayTranslations[day] || day
  }

  const isFormValid = () => {
    return (
      editShift.title.trim() !== '' &&
      editShift.start_date &&
      editShift.end_date &&
      Object.keys(editShift.days_times).length > 0
    )
  }

  if (!shift) return null

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
          <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label={t('shifts.basicInfo')} />
            <Tab label={t('shifts.daysSchedule')} />
            <Tab label={t('shifts.advancedSettings')} />
          </Tabs>

          {/* Basic Information Tab */}
          {activeTab === 0 && (
            <Paper
              elevation={1}
              sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('shifts.shiftInformation')}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr' }, gap: 3, mb: 3 }}>
                <CustomTextField
                  fullWidth
                  label={t('shifts.title')}
                  name='title'
                  value={editShift.title}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={t('shifts.startDate')}
                    value={editShift.start_date ? new Date(editShift.start_date) : null}
                    onChange={date => handleDateChange('start_date', date)}
                    sx={{ width: '100%' }}
                    disabled={isLoading}
                  />
                  <DatePicker
                    label={t('shifts.endDate')}
                    value={editShift.end_date ? new Date(editShift.end_date) : null}
                    onChange={date => handleDateChange('end_date', date)}
                    sx={{ width: '100%' }}
                    disabled={isLoading}
                  />
                </LocalizationProvider>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  {t('shifts.persons')}
                </Typography>
                <Autocomplete
                  multiple
                  options={personsData?.data || []}
                  getOptionLabel={option => `${option.first_name} ${option.last_name}`}
                  value={selectedPersons}
                  onChange={handlePersonChange}
                  loading={isLoadingPersons}
                  disableCloseOnSelect
                  renderInput={params => (
                    <TextField {...params} placeholder={t('shifts.selectPersons')} variant='outlined' size='small' />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant='outlined'
                        label={`${option.first_name} ${option.last_name}`}
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText={t('shifts.noPersonsFound')}
                  loadingText={t('common.loading')}
                />
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
                label={t('shifts.active')}
                sx={{ alignSelf: 'flex-start' }}
              />
            </Paper>
          )}

          {/* Days Schedule Tab */}
          {activeTab === 1 && (
            <Paper
              elevation={1}
              sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('shifts.daysSchedule')}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {weekDays.map(day => (
                  <Button
                    key={day}
                    variant={selectedDays.includes(day) ? 'contained' : 'outlined'}
                    onClick={() => handleDaySelection(day)}
                    size='small'
                    sx={{ mb: 1 }}
                    disabled={Object.keys(editShift.days_times).includes(day)}
                  >
                    {translateDay(day)}
                  </Button>
                ))}
              </Box>

              {selectedDays.length > 0 && (
                <Box sx={{ mb: 3, mt: 2 }}>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    {t('shifts.timesForSelectedDays')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      localeText={{ okButtonLabel: t('common.ok'), cancelButtonLabel: t('common.cancel') }}
                    >
                      <TimePicker
                        ampm={false}
                        label={t('shifts.start')}
                        value={timeStringToDate(uniformTime.start)}
                        onChange={date => handleUniformTimeChange('start', dateToTimeString(date))}
                        timeSteps={{ minutes: 1 }}
                        slotProps={{ textField: { size: 'small' }, actionBar: { actions: ['cancel', 'accept'] } }}
                      />
                    </LocalizationProvider>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      localeText={{ okButtonLabel: t('common.ok'), cancelButtonLabel: t('common.cancel') }}
                    >
                      <TimePicker
                        ampm={false}
                        label={t('shifts.end')}
                        value={timeStringToDate(uniformTime.end)}
                        onChange={date => handleUniformTimeChange('end', dateToTimeString(date))}
                        timeSteps={{ minutes: 1 }}
                        slotProps={{ textField: { size: 'small' }, actionBar: { actions: ['cancel', 'accept'] } }}
                      />
                    </LocalizationProvider>
                    <Button variant='contained' size='small' onClick={handleAddDayTime} sx={{ whiteSpace: 'nowrap' }}>
                      {t('common.add')}
                    </Button>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('shifts.specificDaySchedule')}
              </Typography>

              {Object.keys(editShift.days_times).length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  {t('shifts.noDaysAdded')}
                </Typography>
              ) : (
                Object.keys(editShift.days_times).map(day => (
                  <Accordion key={day} sx={{ mb: 1, borderRadius: 1, overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{translateDay(day)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {editShift.days_times[day].map((timeSlot, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                          <LocalizationProvider
                            dateAdapter={AdapterDateFns}
                            localeText={{ okButtonLabel: t('common.ok'), cancelButtonLabel: t('common.cancel') }}
                          >
                            <TimePicker
                              ampm={false}
                              label={t('shifts.start')}
                              value={timeStringToDate(timeSlot.start)}
                              onChange={date =>
                                handleSpecificDayTimeChange(day, index, 'start', dateToTimeString(date))
                              }
                              timeSteps={{ minutes: 1 }}
                              slotProps={{ textField: { size: 'small' }, actionBar: { actions: ['cancel', 'accept'] } }}
                            />
                          </LocalizationProvider>
                          <LocalizationProvider
                            dateAdapter={AdapterDateFns}
                            localeText={{ okButtonLabel: t('common.ok'), cancelButtonLabel: t('common.cancel') }}
                          >
                            <TimePicker
                              ampm={false}
                              label={t('shifts.end')}
                              value={timeStringToDate(timeSlot.end)}
                              onChange={date => handleSpecificDayTimeChange(day, index, 'end', dateToTimeString(date))}
                              timeSteps={{ minutes: 1 }}
                              slotProps={{ textField: { size: 'small' }, actionBar: { actions: ['cancel', 'accept'] } }}
                            />
                          </LocalizationProvider>
                          <IconButton color='error' size='small' onClick={() => handleDeleteTimeSlotForDay(day, index)}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        size='small'
                        onClick={() => handleAddTimeSlotForDay(day)}
                        sx={{ mt: 1 }}
                      >
                        {t('shifts.addTimeRange')}
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Paper>
          )}

          {/* Advanced Settings Tab */}
          {activeTab === 2 && (
            <Paper
              elevation={1}
              sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('shifts.advancedSettings')}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant='body2' sx={{ mr: 1 }}>
                      {t('shifts.startOffset')}
                    </Typography>
                    <Tooltip title={t('shifts.startOffsetHelp')}>
                      <InfoIcon fontSize='small' color='action' />
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      type='number'
                      variant='outlined'
                      size='small'
                      value={editShift.start_offset === '' ? '' : editShift.start_offset}
                      onChange={e => handleStartOffsetChange(e.target.value)}
                      onBlur={() => {
                        if (editShift.start_offset === '') {
                          setEditShift(prev => ({ ...prev, start_offset: 0 }))
                        }
                      }}
                      sx={{ width: '60%' }}
                      inputProps={{ min: 0 }}
                    />
                    <FormControl size='small' sx={{ width: '40%' }}>
                      <Select
                        value={startOffsetUnit}
                        onChange={e => handleUnitChange('startOffset', e.target.value)}
                        displayEmpty
                      >
                        {timeUnitOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant='body2' sx={{ mr: 1 }}>
                      {t('shifts.endOffset')}
                    </Typography>
                    <Tooltip title={t('shifts.endOffsetHelp')}>
                      <InfoIcon fontSize='small' color='action' />
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      type='number'
                      variant='outlined'
                      size='small'
                      value={editShift.end_offset === '' ? '' : editShift.end_offset}
                      onChange={e => handleEndOffsetChange(e.target.value)}
                      onBlur={() => {
                        if (editShift.end_offset === '') {
                          setEditShift(prev => ({ ...prev, end_offset: 0 }))
                        }
                      }}
                      sx={{ width: '60%' }}
                      inputProps={{ min: 0 }}
                    />
                    <FormControl size='small' sx={{ width: '40%' }}>
                      <Select
                        value={endOffsetUnit}
                        onChange={e => handleUnitChange('endOffset', e.target.value)}
                        displayEmpty
                      >
                        {timeUnitOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant='body2' sx={{ mr: 1 }}>
                      {t('shifts.break')}
                    </Typography>
                    <Tooltip title={t('shifts.breakHelp')}>
                      <InfoIcon fontSize='small' color='action' />
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      type='number'
                      variant='outlined'
                      size='small'
                      value={editShift.break === '' ? '' : editShift.break}
                      onChange={e => handleBreakChange(e.target.value)}
                      onBlur={() => {
                        if (editShift.break === '') {
                          setEditShift(prev => ({ ...prev, break: 0 }))
                        }
                      }}
                      sx={{ width: '60%' }}
                      inputProps={{ min: 0 }}
                    />
                    <FormControl size='small' sx={{ width: '40%' }}>
                      <Select value={breakUnit} onChange={e => handleUnitChange('break', e.target.value)} displayEmpty>
                        {timeUnitOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant='body2' sx={{ mr: 1 }}>
                      {t('shifts.totalBreak')}
                    </Typography>
                    <Tooltip title={t('shifts.totalBreakHelp')}>
                      <InfoIcon fontSize='small' color='action' />
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      type='number'
                      variant='outlined'
                      size='small'
                      value={editShift.total_break === '' ? '' : editShift.total_break}
                      onChange={e => handleTotalBreakChange(e.target.value)}
                      onBlur={() => {
                        if (editShift.total_break === '') {
                          setEditShift(prev => ({ ...prev, total_break: 0 }))
                        }
                      }}
                      sx={{ width: '60%' }}
                      inputProps={{ min: 0 }}
                    />
                    <FormControl size='small' sx={{ width: '40%' }}>
                      <Select
                        value={totalBreakUnit}
                        onChange={e => handleUnitChange('totalBreak', e.target.value)}
                        displayEmpty
                      >
                        {timeUnitOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant='body2' sx={{ mr: 1 }}>
                    {t('shifts.shiftReset')}
                  </Typography>
                  <Tooltip title={t('shifts.shiftResetHelp')}>
                    <InfoIcon fontSize='small' color='action' />
                  </Tooltip>
                </Box>
                <FormControl fullWidth size='small' sx={{ mb: 1 }}>
                  <Select value={shiftResetOption} onChange={handleShiftResetChange} displayEmpty>
                    {resetOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {shiftResetOption === 'custom' && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      type='number'
                      variant='outlined'
                      size='small'
                      placeholder={t('shifts.customResetPlaceholder')}
                      value={customReset}
                      onChange={handleCustomResetChange}
                      sx={{ width: '60%' }}
                      inputProps={{ min: 1 }}
                    />
                    <FormControl size='small' sx={{ width: '40%' }}>
                      <Select
                        value={shiftResetUnit}
                        onChange={e => handleUnitChange('shiftReset', e.target.value)}
                        displayEmpty
                      >
                        {timeUnitOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
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
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? t('common.loading') : t('shifts.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ShiftUpdate
