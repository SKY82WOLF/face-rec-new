'use client'

import { useMemo, useState, useEffect } from 'react'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { selectPermissionsCodenames } from '@/store/slices/permissionsSlice'
import useSidebar from '@/hooks/useSidebar'

const useVerticalMenuData = () => {
  const { t } = useTranslation()
  const codenames = useSelector(selectPermissionsCodenames)
  const codenameSet = useMemo(() => new Set(codenames || []), [codenames])

  // Mount guard to keep SSR/CSR output consistent during hydration
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch and cache sidebar (API called once if missing, cached with TTL by hook)
  const { sidebar: sidebarData } = useSidebar()
  const sidebar = useMemo(() => (Array.isArray(sidebarData) ? sidebarData : []), [sidebarData])

  // Always-available sections
  const staticItems = [{ label: t('sidebar.live'), href: '/live', icon: 'tabler-camera' }]

  // Build dynamic items from sidebar + user codenames (only after mount to avoid hydration mismatch)
  const dynamicItems = useMemo(() => {
    if (!mounted) return []

    return sidebar
      .filter(s => Array.isArray(s.permissions) && s.permissions.length > 0)
      .filter(s => typeof s.href === 'string' && s.href.trim().length > 0)
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
      .map(s => {
        const codenamesInGroup = s.permissions.map(p => p.codename).filter(Boolean)

        if (codenamesInGroup.length === 0) return null

        const hasAny = codenamesInGroup.some(cn => codenameSet.has(cn))

        if (!hasAny) return null

        return {
          label: s.title?.trim?.() || s.lable || '',
          href: s.href || '#',
          icon: s.icon || 'tabler-circle'
        }
      })
      .filter(Boolean)
  }, [mounted, sidebar, codenameSet])

  // Profile is always present
  const profileItem = { label: t('sidebar.profile'), href: '/profile', icon: 'tabler-user' }
  const shiftsItem = { label: t('sidebar.shifts'), href: '/shifts', icon: 'tabler-clock' }

  return [...staticItems, ...dynamicItems, profileItem, shiftsItem]
}

export default useVerticalMenuData
