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
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InfoIcon from '@mui/icons-material/Info'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import { useGetPersons } from '@/hooks/usePersons'

const weekDays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const ShiftAdd = ({ open, onClose, onSubmit, isLoading = false }) => {
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

  const [newShift, setNewShift] = React.useState({
    title: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
    start_offset: 5, // 5 minutes default
    end_offset: 5, // 5 minutes default
    break: 15, // 15 minutes default
    total_break: 30, // 30 minutes default
    shift_reset: 86400, // 24 hours in seconds
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target

    setNewShift(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleDateChange = (name, date) => {
    // Convert to ISO format YYYY-MM-DD
    const formattedDate = date ? date.toISOString().split('T')[0] : ''

    setNewShift(prev => ({
      ...prev,
      [name]: formattedDate
    }))
  }

  const handleShiftResetChange = event => {
    const value = event.target.value

    setShiftResetOption(value)

    if (value === 'custom') {
      setCustomReset('24')
      setNewShift(prev => ({
        ...prev,
        shift_reset: 24 * shiftResetUnit
      }))
    } else {
      setNewShift(prev => ({
        ...prev,
        shift_reset: value
      }))
    }
  }

  const handleCustomResetChange = e => {
    const value = e.target.value

    setCustomReset(value)

    const numericValue = parseInt(value) || 0

    setNewShift(prev => ({
      ...prev,
      shift_reset: numericValue * shiftResetUnit
    }))
  }

  const handleUniformTimeChange = (field, value) => {
    setUniformTime(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDaySelection = day => {
    setSelectedDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]))
  }

  const handleAddDayTime = () => {
    const updatedDaysTimes = { ...newShift.days_times }

    selectedDays.forEach(day => {
      updatedDaysTimes[day] = [{ start: uniformTime.start, end: uniformTime.end }]
    })

    setNewShift(prev => ({
      ...prev,
      days_times: updatedDaysTimes
    }))

    // Reset selected days after adding
    setSelectedDays([])
  }

  const handleSpecificDayTimeChange = (day, index, field, value) => {
    const updatedDaysTimes = { ...newShift.days_times }

    if (!updatedDaysTimes[day]) {
      updatedDaysTimes[day] = []
    }

    if (!updatedDaysTimes[day][index]) {
      updatedDaysTimes[day][index] = { start: '09:00', end: '17:00' }
    }

    updatedDaysTimes[day][index][field] = value

    setNewShift(prev => ({
      ...prev,
      days_times: updatedDaysTimes
    }))
  }

  const handleAddTimeSlotForDay = day => {
    const updatedDaysTimes = { ...newShift.days_times }

    if (!updatedDaysTimes[day]) {
      updatedDaysTimes[day] = []
    }

    updatedDaysTimes[day].push({ start: '09:00', end: '17:00' })

    setNewShift(prev => ({
      ...prev,
      days_times: updatedDaysTimes
    }))
  }

  const handleDeleteTimeSlotForDay = (day, index) => {
    const updatedDaysTimes = { ...newShift.days_times }

    updatedDaysTimes[day].splice(index, 1)

    if (updatedDaysTimes[day].length === 0) {
      delete updatedDaysTimes[day]
    }

    setNewShift(prev => ({
      ...prev,
      days_times: updatedDaysTimes
    }))
  }

  const handleStartOffsetChange = value => {
    if (value === '') {
      setNewShift(prev => ({ ...prev, start_offset: '' }))

      return
    }

    const numericValue = parseInt(value) || 0

    setNewShift(prev => ({
      ...prev,
      start_offset: numericValue
    }))
  }

  const handleEndOffsetChange = value => {
    if (value === '') {
      setNewShift(prev => ({ ...prev, end_offset: '' }))

      return
    }

    const numericValue = parseInt(value) || 0

    setNewShift(prev => ({
      ...prev,
      end_offset: numericValue
    }))
  }

  const handleBreakChange = value => {
    if (value === '') {
      setNewShift(prev => ({ ...prev, break: '' }))

      return
    }

    const numericValue = parseInt(value) || 0

    setNewShift(prev => ({
      ...prev,
      break: numericValue
    }))
  }

  const handleTotalBreakChange = value => {
    if (value === '') {
      setNewShift(prev => ({ ...prev, total_break: '' }))

      return
    }

    const numericValue = parseInt(value) || 0

    setNewShift(prev => ({
      ...prev,
      total_break: numericValue
    }))
  }

  const handleUnitChange = (type, value) => {
    switch (type) {
      case 'startOffset':
        setStartOffsetUnit(value)

        // Convert current value to seconds, then to new unit
        const currentStartOffset = newShift.start_offset * startOffsetUnit

        setNewShift(prev => ({
          ...prev,
          start_offset: Math.round(currentStartOffset / value)
        }))
        break
      case 'endOffset':
        setEndOffsetUnit(value)
        const currentEndOffset = newShift.end_offset * endOffsetUnit

        setNewShift(prev => ({
          ...prev,
          end_offset: Math.round(currentEndOffset / value)
        }))
        break
      case 'break':
        setBreakUnit(value)
        const currentBreak = newShift.break * breakUnit

        setNewShift(prev => ({
          ...prev,
          break: Math.round(currentBreak / value)
        }))
        break
      case 'totalBreak':
        setTotalBreakUnit(value)
        const currentTotalBreak = newShift.total_break * totalBreakUnit

        setNewShift(prev => ({
          ...prev,
          total_break: Math.round(currentTotalBreak / value)
        }))
        break
      case 'shiftReset':
        setShiftResetUnit(value)

        if (shiftResetOption === 'custom') {
          setNewShift(prev => ({
            ...prev,
            shift_reset: parseInt(customReset) * value
          }))
        }

        break
    }
  }

  const handlePersonChange = (event, newValue) => {
    setSelectedPersons(newValue)
    setNewShift(prev => ({
      ...prev,
      persons: newValue.map(person => person.id)
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Prepare data for submission
    const submissionData = {
      ...newShift,
      title: newShift.title.trim(),

      // Make sure these values are in seconds in the API
      start_offset: newShift.start_offset * startOffsetUnit,
      end_offset: newShift.end_offset * endOffsetUnit,
      break: newShift.break * breakUnit,
      total_break: newShift.total_break * totalBreakUnit,
      shift_reset: shiftResetOption === 'custom' ? parseInt(customReset) * shiftResetUnit : parseInt(shiftResetOption)
    }

    await onSubmit(submissionData)
    handleClose()
  }

  const handleClose = () => {
    // Reset form state
    setNewShift({
      title: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      start_offset: 5,
      end_offset: 5,
      break: 15,
      total_break: 30,
      shift_reset: 86400,
      is_active: true,
      days_times: {},
      persons: []
    })
    setActiveTab(0)
    setSelectedDays([])
    setUniformTime({ start: '08:00', end: '16:00' })
    setShiftResetOption(86400)
    setCustomReset('')
    setStartOffsetUnit(60)
    setEndOffsetUnit(60)
    setBreakUnit(60)
    setTotalBreakUnit(60)
    setShiftResetUnit(3600)
    setSelectedPersons([])
    onClose()
  }

  // Generate time options for select
  const generateTimeOptions = () => {
    const times = []

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

        times.push(timeString)
      }
    }

    return times
  }

  const timeOptions = generateTimeOptions()

  const translateDay = day => {
    return t(`shifts.dayNames.${day}`) || day
  }

  const isFormValid = () => {
    return (
      newShift.title.trim() !== '' &&
      newShift.start_date &&
      newShift.end_date &&
      Object.keys(newShift.days_times).length > 0
    )
  }

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
        {t('shifts.addShiftTitle')}
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
                  value={newShift.title}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFnsJalali}
                  localeText={{ okButtonLabel: t('common.ok'), cancelButtonLabel: t('common.cancel') }}
                >
                  <DatePicker
                    label={t('shifts.startDate')}
                    value={newShift.start_date ? new Date(newShift.start_date) : null}
                    onChange={date => handleDateChange('start_date', date)}
                    sx={{ width: '100%' }}
                    disabled={isLoading}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
                <LocalizationProvider
                  dateAdapter={AdapterDateFnsJalali}
                  localeText={{ okButtonLabel: t('common.ok'), cancelButtonLabel: t('common.cancel') }}
                >
                  <DatePicker
                    label={t('shifts.endDate')}
                    value={newShift.end_date ? new Date(newShift.end_date) : null}
                    onChange={date => handleDateChange('end_date', date)}
                    sx={{ width: '100%' }}
                    disabled={isLoading}
                    slotProps={{ textField: { fullWidth: true } }}
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
                    checked={newShift.is_active}
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
                {t('shifts.setTimesForDays')}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {weekDays.map(day => (
                  <Button
                    key={day}
                    variant={selectedDays.includes(day) ? 'contained' : 'outlined'}
                    onClick={() => handleDaySelection(day)}
                    size='small'
                    sx={{ mb: 1 }}
                    disabled={Object.keys(newShift.days_times).includes(day)}
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
                    <FormControl size='small' sx={{ minWidth: 120 }}>
                      <InputLabel>{t('shifts.start')}</InputLabel>
                      <Select
                        value={uniformTime.start}
                        label={t('shifts.start')}
                        onChange={e => handleUniformTimeChange('start', e.target.value)}
                      >
                        {timeOptions.map(time => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size='small' sx={{ minWidth: 120 }}>
                      <InputLabel>{t('shifts.end')}</InputLabel>
                      <Select
                        value={uniformTime.end}
                        label={t('shifts.end')}
                        onChange={e => handleUniformTimeChange('end', e.target.value)}
                      >
                        {timeOptions.map(time => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button variant='contained' size='small' onClick={handleAddDayTime} sx={{ whiteSpace: 'nowrap' }}>
                      {t('common.add')}
                    </Button>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('shifts.customDaysSchedule')}
              </Typography>

              {Object.keys(newShift.days_times).length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  {t('shifts.noDaysAdded')}
                </Typography>
              ) : (
                Object.keys(newShift.days_times).map(day => (
                  <Accordion key={day} sx={{ mb: 1, borderRadius: 1, overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{translateDay(day)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {newShift.days_times[day].map((timeSlot, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                          <FormControl size='small' sx={{ minWidth: 120 }}>
                            <InputLabel>{t('shifts.start')}</InputLabel>
                            <Select
                              value={timeSlot.start}
                              label={t('shifts.start')}
                              onChange={e => handleSpecificDayTimeChange(day, index, 'start', e.target.value)}
                            >
                              {timeOptions.map(time => (
                                <MenuItem key={time} value={time}>
                                  {time}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl size='small' sx={{ minWidth: 120 }}>
                            <InputLabel>{t('shifts.end')}</InputLabel>
                            <Select
                              value={timeSlot.end}
                              label={t('shifts.end')}
                              onChange={e => handleSpecificDayTimeChange(day, index, 'end', e.target.value)}
                            >
                              {timeOptions.map(time => (
                                <MenuItem key={time} value={time}>
                                  {time}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
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
                      value={newShift.start_offset === '' ? '' : newShift.start_offset}
                      onChange={e => handleStartOffsetChange(e.target.value)}
                      onBlur={() => {
                        if (newShift.start_offset === '') setNewShift(prev => ({ ...prev, start_offset: 0 }))
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
                      value={newShift.end_offset === '' ? '' : newShift.end_offset}
                      onChange={e => handleEndOffsetChange(e.target.value)}
                      onBlur={() => {
                        if (newShift.end_offset === '') setNewShift(prev => ({ ...prev, end_offset: 0 }))
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
                      value={newShift.break === '' ? '' : newShift.break}
                      onChange={e => handleBreakChange(e.target.value)}
                      onBlur={() => {
                        if (newShift.break === '') setNewShift(prev => ({ ...prev, break: 0 }))
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
                      value={newShift.total_break === '' ? '' : newShift.total_break}
                      onChange={e => handleTotalBreakChange(e.target.value)}
                      onBlur={() => {
                        if (newShift.total_break === '') setNewShift(prev => ({ ...prev, total_break: 0 }))
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
                        {option.value === 'custom' ? t('shifts.resetOptions.custom') : option.label}
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
                      placeholder={t('shifts.customValue')}
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
            {isLoading ? t('common.loading') : t('shifts.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ShiftAdd
