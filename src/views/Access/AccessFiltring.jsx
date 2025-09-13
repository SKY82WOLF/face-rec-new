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
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Card
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'

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

    // Include any search inputs that have values
    if (searchInputs.first_name && searchInputs.first_name.toString().trim() !== '')
      filters.first_name = searchInputs.first_name
    if (searchInputs.last_name && searchInputs.last_name.toString().trim() !== '')
      filters.last_name = searchInputs.last_name
    if (searchInputs.person_id && searchInputs.person_id.toString().trim() !== '')
      filters.person_id = searchInputs.person_id
    if (searchInputs.national_code && searchInputs.national_code.toString().trim() !== '')
      filters.national_code = searchInputs.national_code

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

  // Send immediately when structural selections change (access, gender)
  useEffect(() => {
    sendFilters(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccess, selectedGender])

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
    <Card sx={{ p: 2, mt: 2, mb: 2, borderRadius: 2 }} elevation={1}>
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
        {/* Search accordion (compact header) */}
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
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
              <TextField
                size='small'
                value={searchInputs.first_name}
                onChange={e => setSearchInputs(s => ({ ...s, first_name: e.target.value }))}
                placeholder={t('access.filter.placeholder_first_name') || 'First name'}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
              />

              <TextField
                size='small'
                value={searchInputs.last_name}
                onChange={e => setSearchInputs(s => ({ ...s, last_name: e.target.value }))}
                placeholder={t('access.filter.placeholder_last_name') || 'Last name'}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
              />

              <TextField
                size='small'
                value={searchInputs.person_id}
                onChange={e => setSearchInputs(s => ({ ...s, person_id: e.target.value }))}
                placeholder={t('access.filter.placeholder_person_id') || 'Person ID'}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
              />

              <TextField
                size='small'
                value={searchInputs.national_code}
                onChange={e => setSearchInputs(s => ({ ...s, national_code: e.target.value }))}
                placeholder={t('access.filter.placeholder_national_code') || 'National Code'}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    pl: 0,
                    width: { xs: '100%', sm: 'auto' },
                    pl: { xs: 0 },
                    pr: { xs: 0, sm: 2 }
                  }}
                >
                  {/* Access select */}
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 170 } }} size='small'>
                    <InputLabel>{t('access.filter.access') || 'Access'}</InputLabel>
                    <Select
                      multiple
                      value={selectedAccess}
                      onChange={e =>
                        setSelectedAccess(
                          typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                        )
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

                  {/* Gender select */}
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 170 } }} size='small'>
                    <InputLabel>{t('access.filter.gender') || 'Gender'}</InputLabel>
                    <Select
                      multiple
                      value={selectedGender}
                      onChange={e =>
                        setSelectedGender(
                          typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                        )
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
                </Box>
                <Box
                  sx={{
                    mr: { xs: 0, sm: 2 },
                    order: { xs: 2, sm: 0 },
                    display: 'flex',
                    alignItems: 'center',
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  <Button
                    variant='outlined'
                    onClick={() => {
                      setSelectedAccess([5, 6])
                      setSelectedGender([])
                      setSearchInputs({ first_name: '', last_name: '', person_id: '', national_code: '' })

                      // send immediately so parent resets to page 1
                      sendFilters(true)
                    }}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    {t('common.reset') || 'Reset'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Card>
  )
}

export default AccessFiltring
