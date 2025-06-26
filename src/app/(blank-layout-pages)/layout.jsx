'use client'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

const Layout = props => {
  const { children } = props

  // Vars
  const direction = 'rtl'
  const systemMode = getSystemMode()

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode} direction={direction}>
        {children}
      </BlankLayout>
    </Providers>
  )
}

export default Layout
