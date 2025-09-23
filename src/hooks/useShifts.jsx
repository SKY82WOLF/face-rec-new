'use client'

import { useEffect, useMemo } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getShifts,
  getShiftDetail,
  getShiftPersons,
  createShift,
  updateShift,
  deleteShift,
  assignPersonsToShift
} from '@/api/shifts'

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
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })

      const newShiftId = response?.results?.id || response?.id

      if (newShiftId) {
        // Invalidate specific shift queries
        queryClient.invalidateQueries({ queryKey: ['shift', newShiftId] })
        queryClient.invalidateQueries({ queryKey: ['shiftForEdit', newShiftId] })
        queryClient.invalidateQueries({ queryKey: ['shiftForView', newShiftId] })

        // Clear and invalidate shift persons to get fresh data
        queryClient.invalidateQueries({ queryKey: ['shiftPersonsInfinite', newShiftId] })
        queryClient.refetchQueries({ queryKey: ['shiftPersonsInfinite', newShiftId] })
      }
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateShift,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })

      if (id) {
        // Invalidate specific shift queries
        queryClient.invalidateQueries({ queryKey: ['shift', id] })
        queryClient.invalidateQueries({ queryKey: ['shiftForEdit', id] })
        queryClient.invalidateQueries({ queryKey: ['shiftForView', id] })

        // Clear and invalidate shift persons to get fresh data
        queryClient.invalidateQueries({ queryKey: ['shiftPersonsInfinite', id] })
        queryClient.refetchQueries({ queryKey: ['shiftPersonsInfinite', id] })
      }
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShift,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })

      // Only invalidate specific shift queries
      if (deletedId) {
        queryClient.invalidateQueries({ queryKey: ['shift', deletedId] })
        queryClient.invalidateQueries({ queryKey: ['shiftForEdit', deletedId] })
        queryClient.invalidateQueries({ queryKey: ['shiftForView', deletedId] })

        // Remove the specific shift persons query from cache
        queryClient.removeQueries({ queryKey: ['shiftPersonsInfinite', deletedId] })
      }
    }
  })

  const assignPersonsMutation = useMutation({
    mutationFn: ({ shiftId, personIds }) => assignPersonsToShift(shiftId, personIds),
    onSuccess: (_, { shiftId }) => {
      // Clear and invalidate shift persons to get fresh data
      queryClient.invalidateQueries({ queryKey: ['shiftPersonsInfinite', shiftId] })
      queryClient.refetchQueries({ queryKey: ['shiftPersonsInfinite', shiftId] })

      // Also invalidate shift detail queries that include persons
      queryClient.invalidateQueries({ queryKey: ['shift', shiftId] })
      queryClient.invalidateQueries({ queryKey: ['shiftForEdit', shiftId] })
      queryClient.invalidateQueries({ queryKey: ['shiftForView', shiftId] })
    }
  })

  // Callback to get shift details (includes persons)
  const getShiftDetailData = async id => {
    try {
      const shiftData = await getShiftDetail(id)
      const personsData = await getShiftPersons(id, { page: 1, per_page: 5000 })

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
    assignPersonsToShift: assignPersonsMutation.mutateAsync,
    getShiftDetail: getShiftDetailData,
    refetchShifts: refetch
  }
}

// Hook for getting a single shift's details (for detail modal - with all persons)
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
        const personsData = await getShiftPersons(shiftId, { page: 1, per_page: 5000 })

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

// Hook for getting shift details for edit modal (with all persons for sync)
const useShiftDetailForEdit = shiftId => {
  const {
    data: shift,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['shiftForEdit', shiftId],
    queryFn: async () => {
      if (!shiftId) return null

      try {
        // Fetch shift details
        const shiftData = await getShiftDetail(shiftId)

        // Fetch persons assigned to this shift with per_page=5000 for sync
        const personsData = await getShiftPersons(shiftId, { page: 1, per_page: 5000 })

        // Combine the data
        return {
          ...(shiftData.results || shiftData),
          persons: personsData?.results || []
        }
      } catch (error) {
        console.error(`Error in useShiftDetailForEdit for ID ${shiftId}:`, error)
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

// Hook for getting shift details for detail modal (with infinite scroll for persons)
const useShiftDetailForView = shiftId => {
  const {
    data: shift,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['shiftForView', shiftId],
    queryFn: async () => {
      if (!shiftId) return null

      try {
        // Fetch shift details only (no persons)
        const shiftData = await getShiftDetail(shiftId)

        return {
          ...(shiftData.results || shiftData),
          persons: [] // Empty array, will be loaded separately with infinite scroll
        }
      } catch (error) {
        console.error(`Error in useShiftDetailForView for ID ${shiftId}:`, error)
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

export { useShiftDetail, useShiftDetailForEdit, useShiftDetailForView }
export default useShifts
