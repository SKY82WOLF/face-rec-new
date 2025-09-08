'use client'

import { useEffect } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getCameras, getCamera, createCamera, updateCamera, deleteCamera } from '@/api/cameras'

const useCameras = ({ page = 1, per_page = 10, filters = {}, order_by = null } = {}) => {
  const queryClient = useQueryClient()

  const filtersKey = JSON.stringify(filters || {})
  const parsedFilters = filtersKey ? JSON.parse(filtersKey) : {}
  const queryKey = ['cameras', page, per_page, filtersKey, order_by]

  const {
    data = { cameras: [], total: 0 },
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getCameras({ page, per_page, filters: parsedFilters, order_by })

      return {
        cameras: response.results || [],
        total: response.count || 0
      }
    },
    staleTime: 5000,
    gcTime: 120000
  })

  // Prefetch next & previous pages
  useEffect(() => {
    if (!data?.total) return

    const totalPages = Math.ceil(data.total / per_page)

    // Prefetch next page
    if (page < totalPages) {
      const nextPage = page + 1

      queryClient.prefetchQuery({
        queryKey: ['cameras', nextPage, per_page, filtersKey, order_by],
        queryFn: async () => {
          const response = await getCameras({
            page: nextPage,
            per_page,
            filters: parsedFilters,
            order_by
          })

          return {
            cameras: response.results || [],
            total: response.count || 0
          }
        }
      })
    }

    // Prefetch previous page
    if (page > 1) {
      const prevPage = page - 1

      queryClient.prefetchQuery({
        queryKey: ['cameras', prevPage, per_page, filtersKey, order_by],
        queryFn: async () => {
          const response = await getCameras({
            page: prevPage,
            per_page,
            filters: parsedFilters,
            order_by
          })

          return {
            cameras: response.results || [],
            total: response.count || 0
          }
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, per_page, data?.total, queryClient, filtersKey, order_by])

  const createMutation = useMutation({
    mutationFn: createCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
    }
  })

  return {
    cameras: data.cameras,
    total: data.total,
    isLoading,
    isError,
    addCamera: createMutation.mutateAsync,
    updateCamera: updateMutation.mutateAsync,
    deleteCamera: deleteMutation.mutateAsync,
    refetchCameras: refetch,
    loading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  }
}

// Hook for getting a single camera's details
const useCameraDetail = cameraId => {
  const {
    data: camera,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['camera', cameraId],
    queryFn: async () => {
      if (!cameraId) return null
      const response = await getCamera(cameraId)

      return response.results || response
    },
    enabled: !!cameraId,
    staleTime: 5000,
    gcTime: 120000
  })

  return {
    camera,
    isLoading,
    isError,
    refetchCamera: refetch
  }
}

export { useCameraDetail }
export default useCameras
