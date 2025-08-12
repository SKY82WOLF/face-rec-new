'use client'

import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getSidebar } from '@/api/sidebar'

const STORAGE_KEY = 'sidebar_nav'
const STORAGE_TTL_MS = 60_000

const useSidebar = () => {
  // Helpers to load/save with TTL
  const loadFromStorage = () => {
    if (typeof window === 'undefined') return { data: [], valid: false }

    try {
      const raw = localStorage.getItem(STORAGE_KEY)

      if (!raw) return { data: [], valid: false }

      const parsed = JSON.parse(raw)
      const ts = typeof parsed?.ts === 'number' ? parsed.ts : 0
      const data = Array.isArray(parsed?.data) ? parsed.data : []
      const isValid = Date.now() - ts < STORAGE_TTL_MS

      if (!isValid) {
        localStorage.removeItem(STORAGE_KEY)

        return { data: [], valid: false }
      }

      return { data, valid: true }
    } catch (e) {
      return { data: [], valid: false }
    }
  }

  const saveToStorage = data => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), data: Array.isArray(data) ? data : [] }))
    } catch (e) {
      // ignore
    }
  }

  const { data: cached } = useMemo(loadFromStorage, [])
  const hasValidStored = Array.isArray(cached) && cached.length > 0

  const {
    data = { results: hasValidStored ? cached : [] },
    isLoading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['sidebar'],
    queryFn: async () => {
      const response = await getSidebar()

      return { results: response.results || [] }
    },
    enabled: true, // allow refetch anytime
    initialData: hasValidStored ? { results: cached } : undefined,
    staleTime: 300000,
    gcTime: 300000
  })

  // Persist fetched sidebar to localStorage with TTL
  useEffect(() => {
    const current = Array.isArray(data?.results) ? data.results : []

    saveToStorage(current)
  }, [data])

  return {
    sidebar: data.results,
    isLoading,
    isFetching,
    isError,
    refetchSidebar: refetch
  }
}

export default useSidebar
