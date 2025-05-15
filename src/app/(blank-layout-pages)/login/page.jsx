'use client'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Component Imports
import Login from '@/views/Login'

// SEO Component
import SEO from '@/components/SEO'

const LoginPage = () => {
  // Vars
  const mode = getServerMode()

  return (
    <>
      <SEO title='ورود | سیستم تشخیص چهره دیانا' description='ورود به سیستم تشخیص چهره دیانا' />
      <Login mode={mode} />
    </>
  )
}

export default LoginPage
