'use client'

import { useEffect, useMemo } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getGroups, getGroupDetail, createGroup, updateGroup, deleteGroup } from '@/api/groups'

const useGroups = ({ page = 1, per_page = 10, sort_by = 'id', sort_order = 'asc' } = {}) => {
  const queryClient = useQueryClient()
  const queryKey = ['groups', page, per_page]

  const {
    data = { groups: [], total: 0 },
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getGroups({ page, per_page })

      return {
        groups: response.results || [],
        total: response.count || 0
      }
    },
    staleTime: 5000,
    gcTime: 120000
  })

  // Client-side sorting
  const sortedGroups = useMemo(() => {
    if (!data.groups || data.groups.length === 0) return []

    const sorted = [...data.groups].sort((a, b) => {
      let aValue = a[sort_by]
      let bValue = b[sort_by]

      // Handle date fields
      if (sort_by === 'created_at' || sort_by === 'updated_at') {
        aValue = new Date(aValue.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
        bValue = new Date(bValue.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sort_order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    return sorted
  }, [data.groups, sort_by, sort_order])

  useEffect(() => {
    if (!data?.total) return

    const totalPages = Math.ceil(data.total / per_page)

    if (page < totalPages) {
      const nextPage = page + 1

      queryClient.prefetchQuery({
        queryKey: ['groups', nextPage, per_page],
        queryFn: async () => {
          const response = await getGroups({
            page: nextPage,
            per_page
          })

          return {
            groups: response.results || [],
            total: response.count || 0
          }
        }
      })
    }

    if (page > 1) {
      const prevPage = page - 1

      queryClient.prefetchQuery({
        queryKey: ['groups', prevPage, per_page],
        queryFn: async () => {
          const response = await getGroups({
            page: prevPage,
            per_page
          })

          return {
            groups: response.results || [],
            total: response.count || 0
          }
        }
      })
    }
  }, [page, per_page, data?.total, queryClient])

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    }
  })

  return {
    groups: sortedGroups,
    total: data.total,
    isLoading,
    isError,
    addGroup: createMutation.mutateAsync,
    updateGroup: updateMutation.mutateAsync,
    deleteGroup: deleteMutation.mutateAsync,
    refetchGroups: refetch
  }
}

// Hook for getting a single group's details
const useGroupDetail = groupId => {
  const {
    data: group,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) return null
      const response = await getGroupDetail(groupId)

      // Extract the group data from the response structure
      return response.results || response
    },
    enabled: !!groupId,
    staleTime: 5000,
    gcTime: 120000
  })

  return {
    group,
    isLoading,
    isError,
    refetchGroup: refetch
  }
}

export { useGroupDetail }
export default useGroups
