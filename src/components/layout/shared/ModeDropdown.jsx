'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Tooltip from '@mui/material/Tooltip'

// Third-party toggle
// import { DayAndNightToggle } from 'react-day-and-night-toggle'
import { DayAndNightToggle } from '@/components/ui/DayNightToggle'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

import { useTranslation } from '@/translations/useTranslation'

const ModeDropdown = () => {
  const [mounted, setMounted] = useState(false)

  // Hooks
  const { settings, updateSettings } = useSettings()
  const { t } = useTranslation()

  // Only run client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Return translated label for current mode; when in `system` show the current
  // resolved preference (dark or light) so the tooltip matches the toggle state.
  const getModeText = () => {
    if (!mounted) {
      return t('settings.theme.system')
    }

    if (settings.mode === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

      if (prefersDark) {
        return t('settings.theme.dark')
      }

      return t('settings.theme.light')
    } else if (settings.mode === 'dark') {
      return t('settings.theme.dark')
    }

    return t('settings.theme.light')
  }

  // Determine the boolean checked state for the DayAndNightToggle.
  const getChecked = () => {
    if (!mounted) {
      return false
    }

    if (settings.mode === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    return settings.mode === 'dark'
  }

  // When the toggle is changed, map the boolean back to 'dark' or 'light'. If
  // the user toggles we consider it an explicit choice (not 'system').
  const handleChange = () => {
    const currentlyDark = getChecked()

    const newDark = !currentlyDark

    updateSettings({ mode: newDark ? 'dark' : 'light' })
  }

  return (
    <Tooltip title={getModeText()} slotProps={{ popper: { className: 'capitalize' } }}>
      <span>
        <DayAndNightToggle onChange={handleChange} checked={getChecked()} size={20} />
      </span>
    </Tooltip>
  )
}

export default ModeDropdown
