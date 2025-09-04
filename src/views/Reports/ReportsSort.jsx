import React from 'react'

import { Box, Card, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

import { useTranslation } from '@/translations/useTranslation'

const SORT_FIELDS = [
  { value: 'created_at', label: 'reportCard.date' },
  { value: 'person_id', label: 'reportCard.personId' },
  { value: 'confidence', label: 'reportCard.confidence' },
  { value: 'fiqa', label: 'reportCard.fiqa' },
  { value: 'camera_id', label: 'reportCard.camera' },
  { value: 'id', label: 'reportCard.id' },
  { value: 'similarity_score', label: 'reportCard.similarityScore' }
]

export default function ReportsSort({ orderBy, setOrderBy }) {
  const { t } = useTranslation()

  // derive current field and direction from orderBy (e.g. '-created_at' -> field:'created_at', dir:'asc')
  const field = typeof orderBy === 'string' && orderBy.startsWith('-') ? orderBy.slice(1) : orderBy
  const direction = typeof orderBy === 'string' && orderBy.startsWith('-') ? 'asc' : 'desc'

  const currentField = field || 'created_at'

  return (
    <Card sx={{ p: 2, mb: 2, backgroundColor: 'transparent', boxShadow: 'none'}}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControl size='small'>
          <InputLabel>{t('common.sortBy') || 'Sort By'}</InputLabel>
          <Select
            value={currentField}
            label={t('common.sortBy') || 'Sort By'}
            onChange={e => {
              const newField = e.target.value

              // keep current direction when switching field
              setOrderBy(direction === 'asc' ? `-${newField}` : `${newField}`)
            }}
            sx={{ minWidth: 180 }}
          >
            {SORT_FIELDS.map(f => (
              <MenuItem key={f.value} value={f.value}>
                {t(f.label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small'>
          <InputLabel>{t('common.order') || 'Order'}</InputLabel>
          <Select
            value={direction}
            label={t('common.order') || 'Order'}
            onChange={e => {
              const newDir = e.target.value

              // toggle prefix according to new direction
              setOrderBy(newDir === 'asc' ? `-${currentField}` : `${currentField}`)
            }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value='desc'>{t('groups.ascending') || 'Ascending'}</MenuItem>
            <MenuItem value='asc'>{t('groups.descending') || 'Descending'}</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Card>
  )
}
