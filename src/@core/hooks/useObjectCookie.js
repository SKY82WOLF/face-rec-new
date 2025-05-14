'use client'

// React Imports
import { useState, useEffect } from 'react'

// Import our custom cookie utils
import { getSettingsFromCookie, setSettingsCookie } from '@core/utils/serverHelpers'

export const useObjectCookie = (key, fallback) => {
  // Initialize with fallback data
  const [value, setValue] = useState(fallback)

  // Load cookie value on client-side only
  useEffect(() => {
    const cookieValue = getSettingsFromCookie()

    if (Object.keys(cookieValue).length > 0) {
      setValue(cookieValue)
    }
  }, [])

  const updateValue = newVal => {
    setSettingsCookie(newVal)
    setValue(newVal)
  }

  return [value, updateValue]
}
