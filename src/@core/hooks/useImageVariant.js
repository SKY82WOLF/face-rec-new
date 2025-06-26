// React Imports
import { useMemo } from 'react'

// Hook Imports
import { useSettings } from './useSettings'

export const useImageVariant = (mode, imgLight, imgDark, imgLightBordered, imgDarkBordered) => {
  // Hooks
  const { settings } = useSettings()

  return useMemo(() => {
    const isBordered = settings?.skin === 'bordered'
    const isDarkMode = mode === 'dark'

    if (isBordered && imgLightBordered && imgDarkBordered) {
      return isDarkMode ? imgDarkBordered : imgLightBordered
    }

    return isDarkMode ? imgDark : imgLight
  }, [mode, settings?.skin, imgLight, imgDark, imgLightBordered, imgDarkBordered])
}
