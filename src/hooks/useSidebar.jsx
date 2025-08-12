'use client'

import { useQuery } from '@tanstack/react-query'

import { getSidebar } from '@/api/sidebar'

const useSidebar = () => {
  const {
    data = { results: [] },
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['sidebar'],
    queryFn: async () => {
      const response = await getSidebar()

      return {
        results: response.results || []
      }
    },
    staleTime: 300000,
    gcTime: 600000
  })

  return {
    sidebar: data.results,
    isLoading,
    isError,
    refetchSidebar: refetch
  }
}

export default useSidebar
