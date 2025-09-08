'use client'

import { useState, useEffect, useRef } from 'react'

import {
  Box,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Typography,
  TextField,
  Button
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'

import { useTranslation } from '@/translations/useTranslation'

const CamerasFilter = ({ onChange, initialFilters = {} }) => {
  const { t } = useTranslation()

  const [searchInputs, setSearchInputs] = useState({
    name: initialFilters.name || '',
    id: initialFilters.id || ''
  })

  const debounceRef = useRef(null)
  const lastSentRef = useRef('')

  const buildFilters = () => {
    const filters = {}

    if (searchInputs.name && searchInputs.name.toString().trim() !== '') filters.name = searchInputs.name
    if (searchInputs.id && searchInputs.id.toString().trim() !== '') filters.id = searchInputs.id

    return filters
  }

  const send = (immediate = false) => {
    const filters = buildFilters()
    const serialized = JSON.stringify(filters || {})

    if (immediate) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }

      lastSentRef.current = serialized
      onChange && onChange(filters)

      return
    }

    if (lastSentRef.current === serialized) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      lastSentRef.current = serialized
      onChange && onChange(filters)
      debounceRef.current = null
    }, 400)
  }

  useEffect(() => {
    send(false)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInputs])

  return (
    <Card elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
          '& .MuiTextField-root, & .MuiButton-root': { width: { xs: '100%', sm: 'auto' } }
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
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width:'100%' }}>

              <TextField
                size='small'
                value={searchInputs.name}
                onChange={e => setSearchInputs(s => ({ ...s, name: e.target.value }))}
                placeholder={t('cameras.name') || 'Name'}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 160 } }}
              />
              <TextField
                size='small'
                value={searchInputs.id}
                onChange={e => setSearchInputs(s => ({ ...s, id: e.target.value }))}
                placeholder={t('reportCard.id') || 'ID'}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setSearchInputs({ name: '', id: '' })
                    send(true)
                  }}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {t('common.reset') || 'Reset'}
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Card>
  )
}

export default CamerasFilter
