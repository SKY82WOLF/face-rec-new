import React from 'react'

import { Typography } from '@mui/material'
import moment from 'jalali-moment'

import { useTranslation } from '@/translations/useTranslation'

const ShamsiDateTime = ({ dateTime, format = 'dateTime', variant = 'body2', color = 'textSecondary' }) => {
  const { t } = useTranslation()

  // Function to format date/time based on type
  const formatShamsi = (date, type) => {
    if (!date) return t('reportCard.unknown')

    try {
      // Parse the input date with moment and convert to local timezone
      const parsedDate = moment.utc(date).local()

      if (type === 'date') {
        return parsedDate.locale('fa').format('YYYY/MM/DD')
      } else if (type === 'time') {
        return parsedDate.format('HH:mm:ss')
      } else {
        // Full date and time
        return parsedDate.locale('fa').format('YYYY/MM/DD HH:mm:ss')
      }
    } catch (error) {
      console.error('Error formatting Shamsi date:', error)

      return t('reportCard.unknown')
    }
  }

  // Determine which format to use based on the format prop
  const displayText =
    format === 'date'
      ? formatShamsi(dateTime, 'date')
      : format === 'time'
        ? formatShamsi(dateTime, 'time')
        : formatShamsi(dateTime, 'dateTime')

  return <span style={{ color: color }}>{displayText}</span>
}

export default ShamsiDateTime
