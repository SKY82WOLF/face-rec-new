'use client'

import { useState, useEffect, useRef } from 'react'

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  TextField,
  Button,
  Stack
} from '@mui/material'

import { useSelector } from 'react-redux'

import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import { useTranslation } from '@/translations/useTranslation'

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

const AccessFiltring = ({ onChange, initialFilters = {} }) => {
  const { t } = useTranslation()

  const accessTypes = useSelector(selectAccessTypes)
  const genderTypes = useSelector(selectGenderTypes)

  // Defaults: access 5 and 6 both selected
  const [selectedAccess, setSelectedAccess] = useState(initialFilters.access_id || [5, 6])
  const [selectedGender, setSelectedGender] = useState(initialFilters.gender_id || [])

  // Support multi-select search fields. Default to first_name.
  const [selectedSearchFields, setSelectedSearchFields] = useState(initialFilters.searchFields || ['first_name'])

  // Separate search inputs for each possible field
  const [searchInputs, setSearchInputs] = useState({
    first_name: initialFilters.first_name || '',
    last_name: initialFilters.last_name || '',
    person_id: initialFilters.person_id || '',
    national_code: initialFilters.national_code || ''
  })

  // Debounce filter changes to avoid rapid requests (e.g. typing in search)
  const debounceTimeoutRef = useRef(null)
  const lastSentFiltersRef = useRef('')

  const buildFilters = () => {
    const filters = {}

    if (selectedAccess && selectedAccess.length > 0) filters.access_id = selectedAccess
    if (selectedGender && selectedGender.length > 0) filters.gender_id = selectedGender

    // For each selected search field, pull corresponding input value(s)
    if (selectedSearchFields.includes('first_name')) {
      if (searchInputs.first_name && searchInputs.first_name.toString().trim() !== '') {
        filters.first_name = searchInputs.first_name
      }
    }

    if (selectedSearchFields.includes('last_name')) {
      if (searchInputs.last_name && searchInputs.last_name.toString().trim() !== '') {
        filters.last_name = searchInputs.last_name
      }
    }

    if (selectedSearchFields.includes('person_id')) {
      if (searchInputs.person_id && searchInputs.person_id.toString().trim() !== '') {
        filters.person_id = searchInputs.person_id
      }
    }

    if (selectedSearchFields.includes('national_code')) {
      if (searchInputs.national_code && searchInputs.national_code.toString().trim() !== '') {
        filters.national_code = searchInputs.national_code
      }
    }

    return filters
  }

  const sendFilters = (immediate = false) => {
    const filters = buildFilters()
    const serialized = JSON.stringify(filters || {})

    // Immediate sends always notify parent (so page reset works)
    if (immediate) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }

      lastSentFiltersRef.current = serialized
      onChange && onChange(filters)

      return
    }

    // Debounced send: don't send if unchanged
    if (lastSentFiltersRef.current === serialized) return

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      lastSentFiltersRef.current = serialized
      onChange && onChange(filters)
      debounceTimeoutRef.current = null
    }, 500)
  }

  // Send immediately when structural selections change (access, gender, selected search fields)
  useEffect(() => {
    sendFilters(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccess, selectedGender, selectedSearchFields])

  // Debounce typing changes (searchInputs) — send after user stops typing
  useEffect(() => {
    sendFilters(false)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInputs])

  return (
    <Box sx={{ mb: 2 }}>
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
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size='small'>
          <InputLabel>{t('access.filter.access') || 'Access'}</InputLabel>
          <Select
            multiple
            value={selectedAccess}
            onChange={e =>
              setSelectedAccess(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
            }
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

        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size='small'>
          <InputLabel>{t('access.filter.gender') || 'Gender'}</InputLabel>
          <Select
            multiple
            value={selectedGender}
            onChange={e =>
              setSelectedGender(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
            }
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

        <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 220 } }}>
          <InputLabel>{t('access.filter.searchBy') || 'Search By'}</InputLabel>
          <Select
            multiple
            value={selectedSearchFields}
            onChange={e =>
              setSelectedSearchFields(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
            }
            input={<OutlinedInput label={t('access.filter.searchBy') || 'Search By'} />}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(value => (
                  <Chip
                    key={value}
                    label={
                      value === 'first_name'
                        ? t('access.filter.firstName') || 'First name'
                        : value === 'last_name'
                          ? t('access.filter.lastName') || 'Last name'
                          : value === 'person_id'
                            ? t('access.filter.id') || 'ID'
                            : value === 'national_code'
                              ? t('access.filter.nationalCode') || 'National Code'
                              : value
                    }
                    size='small'
                  />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            <MenuItem value='first_name'>{t('access.filter.firstName') || 'First name'}</MenuItem>
            <MenuItem value='last_name'>{t('access.filter.lastName') || 'Last name'}</MenuItem>
            <MenuItem value='person_id'>{t('access.filter.id') || 'ID'}</MenuItem>
            <MenuItem value='national_code'>{t('access.filter.nationalCode') || 'National Code'}</MenuItem>
          </Select>
        </FormControl>

        {/* Render separate inputs depending on selected search fields */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          {selectedSearchFields.includes('first_name') && (
            <TextField
              size='small'
              value={searchInputs.first_name}
              onChange={e => setSearchInputs(s => ({ ...s, first_name: e.target.value }))}
              placeholder={t('access.filter.placeholder_first_name') || 'First name'}
              sx={{ minWidth: { xs: '100%', sm: 140 } }}
            />
          )}

          {selectedSearchFields.includes('last_name') && (
            <TextField
              size='small'
              value={searchInputs.last_name}
              onChange={e => setSearchInputs(s => ({ ...s, last_name: e.target.value }))}
              placeholder={t('access.filter.placeholder_last_name') || 'Last name'}
              sx={{ minWidth: { xs: '100%', sm: 140 } }}
            />
          )}

          {selectedSearchFields.includes('person_id') && (
            <TextField
              size='small'
              value={searchInputs.person_id}
              onChange={e => setSearchInputs(s => ({ ...s, person_id: e.target.value }))}
              placeholder={t('access.filter.placeholder_person_id') || 'Person ID'}
              sx={{ minWidth: { xs: '100%', sm: 140 } }}
            />
          )}

          {selectedSearchFields.includes('national_code') && (
            <TextField
              size='small'
              value={searchInputs.national_code}
              onChange={e => setSearchInputs(s => ({ ...s, national_code: e.target.value }))}
              placeholder={t('access.filter.placeholder_national_code') || 'National Code'}
              sx={{ minWidth: { xs: '100%', sm: 140 } }}
            />
          )}
        </Box>

        <Button
          variant='outlined'
          onClick={() => {
            setSelectedAccess([5, 6])
            setSelectedGender([])
            setSelectedSearchFields(['first_name'])
            setSearchInputs({ first_name: '', last_name: '', person_id: '', national_code: '' })

            // send immediately so parent resets to page 1
            sendFilters(true)
          }}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {t('common.reset') || 'Reset'}
        </Button>
      </Stack>
    </Box>
  )
}

export default AccessFiltring
