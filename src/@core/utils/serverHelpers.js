// Config Imports
import themeConfig from '@configs/themeConfig'

// Helper function to parse cookies on client side
const parseCookies = () => {
  if (typeof document === 'undefined') return {}

  return Object.fromEntries(
    document.cookie.split('; ').map(cookie => {
      const [name, ...value] = cookie.split('=')

      return [name, decodeURIComponent(value.join('='))]
    })
  )
}

// Helper function to set cookie
export const setSettingsCookie = settings => {
  if (typeof document === 'undefined') return

  const cookieName = themeConfig.settingsCookieName
  const cookieValue = JSON.stringify(settings)

  try {
    // Set cookie for 365 days
    document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`
  } catch (error) {
    console.error('Error setting cookie:', error)
  }
}

// Helper function to set color preference
export const setColorPref = value => {
  if (typeof document === 'undefined') return

  try {
    // Set cookie for 365 days
    document.cookie = `colorPref=${value}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`
  } catch (error) {
    console.error('Error setting colorPref cookie:', error)
  }
}

// Static functions that handle cookie operations
export const getSettingsFromCookie = () => {
  if (typeof document === 'undefined') return {}

  const cookies = parseCookies()
  const cookieName = themeConfig.settingsCookieName

  return cookies[cookieName] ? JSON.parse(cookies[cookieName]) : {}
}

export const getMode = () => {
  if (typeof document === 'undefined') return themeConfig.mode

  const settingsCookie = getSettingsFromCookie()

  // Get mode from cookie or fallback to theme config
  const _mode = settingsCookie.mode || themeConfig.mode

  return _mode
}

export const getSystemMode = () => {
  if (typeof document === 'undefined') return 'light'

  const cookies = parseCookies()
  const mode = getMode()
  const colorPrefCookie = cookies['colorPref'] || 'light'

  return (mode === 'system' ? colorPrefCookie : mode) || 'light'
}

export const getServerMode = () => {
  if (typeof document === 'undefined') return themeConfig.mode === 'system' ? 'light' : themeConfig.mode

  const mode = getMode()
  const systemMode = getSystemMode()

  return mode === 'system' ? systemMode : mode
}

export const getSkin = () => {
  if (typeof document === 'undefined') return themeConfig.skin || 'default'

  const settingsCookie = getSettingsFromCookie()

  return settingsCookie.skin || 'default'
}
