import React from 'react'

import { Typography } from '@mui/material'
import moment from 'jalali-moment'

import { useTranslation } from '@/translations/useTranslation'

const ShamsiDateTime = ({
  dateTime,
  format = 'dateTime',
  variant = 'body2',
  color = 'textSecondary',
  disableTimeConversion = false
}) => {
  const { t } = useTranslation()

  // Function to format date/time based on type
  const formatShamsi = (date, type) => {
    if (!date) return t('reportCard.unknown')

    try {
      // Parse the input date - conditionally convert from UTC to local timezone
      // If disableTimeConversion is true we keep the original parsed moment
      const parsedDate = disableTimeConversion ? moment(date) : moment.utc(date).local()

      // Use Jalali (Shamsi) calendar tokens (jYYYY, jMM, jDD) for date parts
      if (type === 'date') {
        return parsedDate.locale('fa').format('jYYYY/jMM/jDD')
      } else if (type === 'time') {
        return parsedDate.locale('fa').format('HH:mm:ss')
      } else {
        // Full date and time (Jalali date + local time)
        return parsedDate.locale('fa').format('jYYYY/jMM/jDD HH:mm:ss')
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
