'use client'
import { createContext, useMemo, useState, useEffect } from 'react'

// Config Imports
import themeConfig from '@configs/themeConfig'
import primaryColorConfig from '@configs/primaryColorConfig'

// Hook Imports
import { useObjectCookie } from '@core/hooks/useObjectCookie'

// Initial Settings Context
export const SettingsContext = createContext(null)

// Settings Provider
export const SettingsProvider = props => {
  // Initial Settings
  const initialSettings = {
    mode: themeConfig.mode,
    skin: themeConfig.skin,
    semiDark: themeConfig.semiDark,
    layout: themeConfig.layout,
    navbarContentWidth: themeConfig.navbar.contentWidth,
    contentWidth: themeConfig.contentWidth,
    footerContentWidth: themeConfig.footer.contentWidth,
    primaryColor: primaryColorConfig[0].main
  }

  const updatedInitialSettings = {
    ...initialSettings,
    mode: props.mode || themeConfig.mode
  }

  // Client-side mounted state
  const [mounted, setMounted] = useState(false)

  // Cookies
  const [settingsCookie, updateSettingsCookie] = useObjectCookie(
    themeConfig.settingsCookieName,
    JSON.stringify(props.settingsCookie) !== '{}' ? props.settingsCookie : updatedInitialSettings
  )

  // State - start with updatedInitialSettings for consistent server rendering
  const [_settingsState, _updateSettingsState] = useState(updatedInitialSettings)

  // Update settings state with cookie values after mounting
  useEffect(() => {
    const mergedSettings = {
      ...updatedInitialSettings,
      ...(JSON.stringify(settingsCookie) !== '{}' ? settingsCookie : {})
    }

    _updateSettingsState(mergedSettings)
    setMounted(true)
  }, [settingsCookie])

  const updateSettings = (settings, options) => {
    const { updateCookie = true } = options || {}

    _updateSettingsState(prev => {
      const newSettings = { ...prev, ...settings }

      // Update cookie if needed
      if (updateCookie) updateSettingsCookie(newSettings)

      return newSettings
    })
  }

  /**
   * Updates the settings for page with the provided settings object.
   * Updated settings won't be saved to cookie hence will be reverted once navigating away from the page.
   *
   * @param settings - The partial settings object containing the properties to update.
   * @returns A function to reset the page settings.
   *
   * @example
   * useEffect(() => {
   *     return updatePageSettings({ theme: 'dark' });
   * }, []);
   */
  const updatePageSettings = settings => {
    updateSettings(settings, { updateCookie: false })

    // Returns a function to reset the page settings
    return () => updateSettings(settingsCookie, { updateCookie: false })
  }

  const resetSettings = () => {
    updateSettings(initialSettings)
  }

  const isSettingsChanged = useMemo(
    () => JSON.stringify(initialSettings) !== JSON.stringify(_settingsState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_settingsState]
  )

  return (
    <SettingsContext.Provider
      value={{
        settings: _settingsState,
        updateSettings,
        isSettingsChanged,
        resetSettings,
        updatePageSettings,
        mounted
      }}
    >
      {props.children}
    </SettingsContext.Provider>
  )
}
