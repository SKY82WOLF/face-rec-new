import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { useDispatch } from 'react-redux'

import { login, logout as logoutApi } from '@/api/auth'
import { setPermissions, setPermissionsLoading, clearPermissions } from '@/store/slices/permissionsSlice'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const dispatch = useDispatch()

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

        // Sidebar/permissions come in login response under results.sidebar
        // We store the sidebar array and derive codenames in the slice
        dispatch(setPermissionsLoading())
        const sidebarPermissions = response.results.sidebar || []

        dispatch(setPermissions(sidebarPermissions))

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
    localStorage.removeItem('permissions')
    localStorage.removeItem('sidebar_nav')
    dispatch(clearPermissions())
    router.push('/login')
  }

  return {
    loading,
    error,
    handleLogin,
    handleLogout
  }
}
