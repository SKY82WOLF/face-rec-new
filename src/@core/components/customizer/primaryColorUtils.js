'use client'

// Config Imports
import themeConfig from '@configs/themeConfig'

/**
 * Set the primary color and persist it in localStorage and cookies
 * @param {string} color - The hex color to set as primary
 */
export const setPrimaryColor = color => {
  if (typeof window === 'undefined') return

  try {
    // Store in localStorage for immediate use
    localStorage.setItem('primaryColor', color)

    // Save in cookie for persistence across sessions
    const cookieName = themeConfig.settingsCookieName
    const existingCookie = getCookieObject(cookieName)
    const updatedCookie = { ...existingCookie, primaryColor: color }

    // Set cookie for 365 days
    document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(updatedCookie))}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`

    // Apply the color immediately by updating CSS variables
    applyPrimaryColor(color)
  } catch (error) {
    console.error('Error setting primary color:', error)
  }
}

/**
 * Get the current primary color or default from config
 */
export const getPrimaryColor = () => {
  if (typeof window === 'undefined') return null

  const savedColor = localStorage.getItem('primaryColor')

  if (savedColor) return savedColor

  // Try to get from cookie
  const cookieName = themeConfig.settingsCookieName
  const cookieSettings = getCookieObject(cookieName)

  return cookieSettings?.primaryColor || null
}

/**
 * Apply the primary color to the document by updating CSS variables
 */
export const applyPrimaryColor = color => {
  if (typeof document === 'undefined' || !color) return

  // Update CSS variables
  document.documentElement.style.setProperty('--primary-color', color)

  // Create darker/lighter variations
  const rgb = hexToRgb(color)

  if (rgb) {
    // Convert to RGB format for CSS variables
    const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`

    // Update MUI palette variables as well for better theme integration
    document.documentElement.style.setProperty('--mui-palette-primary-main', color)
    document.documentElement.style.setProperty('--mui-palette-primary-mainChannel', rgbString)

    // Lighter shade (opacity 12%)
    document.documentElement.style.setProperty('--mui-palette-primary-lighterOpacity', `rgba(${rgbString}, 0.12)`)

    // Additional variations
    document.documentElement.style.setProperty('--mui-palette-primary-light', lightenColor(color, 0.2))

    document.documentElement.style.setProperty('--mui-palette-primary-dark', darkenColor(color, 0.2))
  }
}

/**
 * Helper function to parse cookies
 */
function getCookieObject(cookieName) {
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=')

    acc[name] = value

    return acc
  }, {})

  try {
    return cookies[cookieName] ? JSON.parse(decodeURIComponent(cookies[cookieName])) : {}
  } catch (error) {
    return {}
  }
}

/**
 * Helper function to convert hex to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

/**
 * Helper function to lighten a color
 */
function lightenColor(hex, amount) {
  const rgb = hexToRgb(hex)

  if (!rgb) return hex

  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount))
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount))
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))

  return rgbToHex(r, g, b)
}

/**
 * Helper function to darken a color
 */
function darkenColor(hex, amount) {
  const rgb = hexToRgb(hex)

  if (!rgb) return hex

  const r = Math.max(0, Math.round(rgb.r * (1 - amount)))
  const g = Math.max(0, Math.round(rgb.g * (1 - amount)))
  const b = Math.max(0, Math.round(rgb.b * (1 - amount)))

  return rgbToHex(r, g, b)
}

/**
 * Helper function to convert RGB to hex
 */
function rgbToHex(r, g, b) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}
