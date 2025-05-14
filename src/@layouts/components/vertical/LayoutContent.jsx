'use client'

// React Imports
import { useState, useEffect } from 'react'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledMain from '@layouts/styles/shared/StyledMain'

// Config Imports
import themeConfig from '@configs/themeConfig'

const LayoutContent = ({ children }) => {
  // Hooks
  const { settings, mounted } = useSettings()
  const [clientClasses, setClientClasses] = useState('')

  // Effect to handle client-side classes after hydration
  useEffect(() => {
    if (mounted) {
      // Determine content width class
      const contentCompact = settings.contentWidth === 'compact'
      const contentWide = settings.contentWidth === 'wide'

      // Build class string
      let classString = verticalLayoutClasses.content + ' flex-auto'

      if (contentCompact) {
        classString += ` ${verticalLayoutClasses.contentCompact} is-full`
      } else if (contentWide) {
        classString += ` ${verticalLayoutClasses.contentWide}`
      }

      // Update client-side classes
      setClientClasses(classString)
    }
  }, [settings.contentWidth, mounted])

  // For server-side rendering and initial hydration, use default from themeConfig
  // This ensures consistent rendering between server and client
  const serverContentCompact = themeConfig.contentWidth === 'compact'

  const serverClassString = classnames(verticalLayoutClasses.content, 'flex-auto', {
    [`${verticalLayoutClasses.contentCompact} is-full`]: serverContentCompact,
    [verticalLayoutClasses.contentWide]: !serverContentCompact && themeConfig.contentWidth === 'wide'
  })

  return (
    <StyledMain
      isContentCompact={mounted ? settings.contentWidth === 'compact' : serverContentCompact}
      className={mounted ? clientClasses : serverClassString}
    >
      {children}
    </StyledMain>
  )
}

export default LayoutContent
