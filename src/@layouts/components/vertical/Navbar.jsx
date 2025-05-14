'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import useScrollTrigger from '@mui/material/useScrollTrigger'

// Third-party Imports
import classnames from 'classnames'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledHeader from '@layouts/styles/vertical/StyledHeader'

const Navbar = props => {
  // Props
  const { children, overrideStyles } = props

  // Hooks
  const { settings, mounted } = useSettings()
  const theme = useTheme()
  const [clientClasses, setClientClasses] = useState('')

  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true
  })

  // For client-side rendering
  useEffect(() => {
    if (mounted) {
      // Vars
      const { navbarContentWidth } = settings
      const headerFixed = themeConfig.navbar.type === 'fixed'
      const headerStatic = themeConfig.navbar.type === 'static'
      const headerFloating = themeConfig.navbar.floating === true
      const headerDetached = themeConfig.navbar.detached === true
      const headerAttached = themeConfig.navbar.detached === false
      const headerBlur = themeConfig.navbar.blur === true
      const headerContentCompact = navbarContentWidth === 'compact'
      const headerContentWide = navbarContentWidth === 'wide'

      // Build classes
      const classes = classnames(verticalLayoutClasses.header, {
        [verticalLayoutClasses.headerFixed]: headerFixed,
        [verticalLayoutClasses.headerStatic]: headerStatic,
        [verticalLayoutClasses.headerFloating]: headerFloating,
        [verticalLayoutClasses.headerDetached]: !headerFloating && headerDetached,
        [verticalLayoutClasses.headerAttached]: !headerFloating && headerAttached,
        [verticalLayoutClasses.headerBlur]: headerBlur,
        [verticalLayoutClasses.headerContentCompact]: headerContentCompact,
        [verticalLayoutClasses.headerContentWide]: headerContentWide,
        scrolled: trigger
      })

      setClientClasses(classes)
    }
  }, [settings, mounted, trigger])

  // For server-side rendering
  const headerFixed = themeConfig.navbar.type === 'fixed'
  const headerStatic = themeConfig.navbar.type === 'static'
  const headerFloating = themeConfig.navbar.floating === true
  const headerDetached = themeConfig.navbar.detached === true
  const headerAttached = themeConfig.navbar.detached === false
  const headerBlur = themeConfig.navbar.blur === true
  const headerContentCompact = themeConfig.navbar.contentWidth === 'compact'
  const headerContentWide = themeConfig.navbar.contentWidth === 'wide'

  const serverClasses = classnames(verticalLayoutClasses.header, {
    [verticalLayoutClasses.headerFixed]: headerFixed,
    [verticalLayoutClasses.headerStatic]: headerStatic,
    [verticalLayoutClasses.headerFloating]: headerFloating,
    [verticalLayoutClasses.headerDetached]: !headerFloating && headerDetached,
    [verticalLayoutClasses.headerAttached]: !headerFloating && headerAttached,
    [verticalLayoutClasses.headerBlur]: headerBlur,
    [verticalLayoutClasses.headerContentCompact]: headerContentCompact,
    [verticalLayoutClasses.headerContentWide]: headerContentWide,
    scrolled: false // No scroll on initial render
  })

  return (
    <StyledHeader theme={theme} overrideStyles={overrideStyles} className={mounted ? clientClasses : serverClasses}>
      <div className={classnames(verticalLayoutClasses.navbar, 'flex bs-full')}>{children}</div>
    </StyledHeader>
  )
}

export default Navbar
