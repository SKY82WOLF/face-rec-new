import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { login, logout as logoutApi } from '@/api/auth'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleLogin = async (username, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await login(username, password)

      if (response.success && response.results?.tokens) {
        // Store tokens
        localStorage.setItem('access_token', response.results.tokens.access_token)
        localStorage.setItem('refresh_token', response.results.tokens.refresh_token)

        // Store user info
        localStorage.setItem('user', JSON.stringify(response.results.user))

        // Redirect to dashboard
        router.push('/live')
      } else {
        throw new Error(response.message || 'در ورود خطایی رخ داده')
      }

      return response
    } catch (err) {
      setError(err.message || 'در ورود خطایی رخ داده')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch (e) {
      console.error('Failed to call logout API:', e)
    }

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return {
    loading,
    error,
    handleLogin,
    handleLogout
  }
}
