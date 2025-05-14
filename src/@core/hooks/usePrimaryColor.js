'use client'

import { useEffect, useState } from 'react'

import { getPrimaryColor, applyPrimaryColor, setPrimaryColor } from '@core/components/customizer/primaryColorUtils'
import primaryColorConfig from '@configs/primaryColorConfig'

/**
 * Custom hook to use and manage primary color
 * Returns the current primary color and a function to update it
 */
export const usePrimaryColor = () => {
  const [color, setColor] = useState(null)

  useEffect(() => {
    // Get saved color on mount
    const savedColor = getPrimaryColor()
    const initialColor = savedColor || primaryColorConfig[0].main

    setColor(initialColor)
    applyPrimaryColor(initialColor)
  }, [])

  // Function to update the primary color
  const updateColor = newColor => {
    setPrimaryColor(newColor)
    setColor(newColor)

    return newColor
  }

  return [color, updateColor]
}
