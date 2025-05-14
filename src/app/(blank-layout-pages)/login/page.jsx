'use client'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Component Imports
import Login from '@/views/Login'

const LoginPage = () => {
  // Vars
  const mode = getServerMode()

  return <Login mode={mode} />
}

export default LoginPage
