'use client'

import { useEffect } from 'react'

import { getPrimaryColor, applyPrimaryColor } from '@core/components/customizer/primaryColorUtils'
import primaryColorConfig from '@configs/primaryColorConfig'

/**
 * Client component that initializes and applies the primary color
 * This is separated from the layout to avoid "use client" directive issues with metadata
 */
const PrimaryColorInitializer = () => {
  useEffect(() => {
    // Apply primary color from storage or use default
    const savedColor = getPrimaryColor()

    if (savedColor) {
      applyPrimaryColor(savedColor)
    } else {
      // Use default from config
      applyPrimaryColor(primaryColorConfig[0].main)
    }
  }, [])

  // This component doesn't render anything
  return null
}

export default PrimaryColorInitializer
