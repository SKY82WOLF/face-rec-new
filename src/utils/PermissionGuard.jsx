'use client'

import React, { useEffect, useState } from 'react'

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

  // Prevent reading localStorage during SSR and initial render
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only access localStorage after mount
  useEffect(() => {
    if (!isMounted) return

    const tokensPresent = localStorage.getItem('access_token') || localStorage.getItem('refresh_token')

    if (!tokensPresent) {
      router.push('/login')
    }
  }, [isMounted, router])

  // While hydrating on client, render nothing to match server Suspense fallback
  if (!isMounted) return null

  if (loading) return <LoadingState />

  const tokensPresent = localStorage.getItem('access_token') || localStorage.getItem('refresh_token')

  // If not authenticated, we've redirected to login; don't render
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
