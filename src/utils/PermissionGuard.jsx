'use client'

import React, { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSelector } from 'react-redux'

import LoadingState from '@/components/ui/LoadingState'
import { selectPermissionsCodenames, selectPermissionsLoading } from '@/store/slices/permissionsSlice'

/**
 * Wrap pages/components that require a permission codename.
 * Usage: <PermissionGuard permission="listGroups"> <YourPage/> </PermissionGuard>
 */
const PermissionGuard = ({ permission, children, fallback = null }) => {
  const router = useRouter()
  const codenames = useSelector(selectPermissionsCodenames)
  const loading = useSelector(selectPermissionsLoading)

  // Derive auth status from tokens on each render to avoid stale state after logout
  const tokensPresent =
    typeof window !== 'undefined' && (localStorage.getItem('access_token') || localStorage.getItem('refresh_token'))

  useEffect(() => {
    if (!tokensPresent) {
      router.push('/login')
    }
  }, [tokensPresent, router])

  if (loading) return <LoadingState />

  // If not authenticated, we've redirected to login; don't render or 404
  if (!tokensPresent) return null

  const has = Array.isArray(permission) ? permission.every(p => codenames.includes(p)) : codenames.includes(permission)

  if (!has) {
    if (fallback) return fallback

    router.push('/404')

    return null
  }

  return <>{children}</>
}

export default PermissionGuard
