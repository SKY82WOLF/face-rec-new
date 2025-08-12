'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useSelector, useDispatch } from 'react-redux'

import LoadingState from '@/components/ui/LoadingState'
import { refreshTokens } from '@/api/auth'
import { getPermissions } from '@/api/permissions'
import {
  setPermissions,
  setPermissionsLoading,
  clearPermissions,
  selectPermissionsCodenames,
  selectPermissionsLoading
} from '@/store/slices/permissionsSlice'

/**
 * Wrap pages/components that require a permission codename.
 * Usage: <PermissionGuard permission="listGroups"> <YourPage/> </PermissionGuard>
 */
const PermissionGuard = ({ permission, children, fallback = null }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const codenames = useSelector(selectPermissionsCodenames)
  const loading = useSelector(selectPermissionsLoading)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let mounted = true

    const verifyAuth = async () => {
      const refresh = localStorage.getItem('refresh_token')

      // Must validate via refresh token API
      if (!refresh) {
        router.push('/login')

        return
      }

      try {
        // refreshTokens will validate refresh token and return new tokens
        const res = await refreshTokens(refresh)
        const tokens = res?.results?.tokens || res?.tokens || res

        if (tokens?.access_token && tokens?.refresh_token) {
          localStorage.setItem('access_token', tokens.access_token)
          localStorage.setItem('refresh_token', tokens.refresh_token)
        }

        // After successful refresh, fetch latest permissions
        if (mounted) {
          dispatch(setPermissionsLoading())

          try {
            const permResp = await getPermissions()
            const perms = permResp.results || permResp || []

            dispatch(setPermissions(perms))
          } catch (permErr) {
            dispatch(clearPermissions())
          }

          setCheckingAuth(false)
        }
      } catch (e) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        router.push('/login')

        return
      }
    }

    verifyAuth()

    return () => {
      mounted = false
    }
  }, [router, dispatch])

  if (checkingAuth || loading) return <LoadingState />

  const has = Array.isArray(permission) ? permission.every(p => codenames.includes(p)) : codenames.includes(permission)

  if (!has) {
    if (fallback) return fallback

    router.push('/404')

    return null
  }

  return <>{children}</>
}

export default PermissionGuard
