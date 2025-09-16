'use client'

import { useEffect, useMemo } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getShifts, getShiftDetail, getShiftPersons, createShift, updateShift, deleteShift } from '@/api/shifts'

const useShifts = ({ page = 1, per_page = 10, order_by = 'id' } = {}) => {
  const queryClient = useQueryClient()
  const queryKey = ['shifts', page, per_page, order_by]

  const {
    data = { shifts: [], total: 0 },
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getShifts({ page, per_page, order_by })

      return {
        shifts: response.results || [],
        total: response.count || 0
      }
    },
    staleTime: 5000,
    gcTime: 120000
  })

  // Prefetch next and previous pages
  useEffect(() => {
    if (!data?.total) return

    const totalPages = Math.ceil(data.total / per_page)

    if (page < totalPages) {
      const nextPage = page + 1

      queryClient.prefetchQuery({
        queryKey: ['shifts', nextPage, per_page, order_by],
        queryFn: async () => {
          const response = await getShifts({
            page: nextPage,
            per_page,
            order_by
          })

          return {
            shifts: response.results || [],
            total: response.count || 0
          }
        }
      })
    }

    if (page > 1) {
      const prevPage = page - 1

      queryClient.prefetchQuery({
        queryKey: ['shifts', prevPage, per_page, order_by],
        queryFn: async () => {
          const response = await getShifts({
            page: prevPage,
            per_page,
            order_by
          })

          return {
            shifts: response.results || [],
            total: response.count || 0
          }
        }
      })
    }
  }, [page, per_page, order_by, data?.total, queryClient])

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    }
  })

  // Callback to get shift details (includes persons)
  const getShiftDetailData = async id => {
    try {
      const shiftData = await getShiftDetail(id)
      const personsData = await getShiftPersons(id)

      return {
        ...(shiftData.results || shiftData),
        persons: personsData?.results || []
      }
    } catch (error) {
      console.error(`Error fetching shift detail for ID ${id}:`, error)
      throw error
    }
  }

  return {
    shifts: data.shifts,
    total: data.total,
    isLoading,
    isError,
    addShift: createMutation.mutateAsync,
    updateShift: updateMutation.mutateAsync,
    deleteShift: deleteMutation.mutateAsync,
    getShiftDetail: getShiftDetailData,
    refetchShifts: refetch
  }
}

// Hook for getting a single shift's details
const useShiftDetail = shiftId => {
  const {
    data: shift,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['shift', shiftId],
    queryFn: async () => {
      if (!shiftId) return null

      try {
        // Fetch shift details
        const shiftData = await getShiftDetail(shiftId)

        // Fetch persons assigned to this shift
        const personsData = await getShiftPersons(shiftId)

        // Combine the data
        return {
          ...(shiftData.results || shiftData),
          persons: personsData?.results || []
        }
      } catch (error) {
        console.error(`Error in useShiftDetail for ID ${shiftId}:`, error)
        throw error
      }
    },
    enabled: !!shiftId,
    staleTime: 5000,
    gcTime: 120000
  })

  return {
    shift,
    isLoading,
    isError,
    refetchShift: refetch
  }
}

export { useShiftDetail }
export default useShifts
