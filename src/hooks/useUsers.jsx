'use client'

import { useEffect } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getUsers, createUser } from '@/api/users'

const useUsers = ({ page = 1, per_page = 10 } = {}) => {
  const queryClient = useQueryClient()
  const queryKey = ['users', page, per_page]

  const {
    data = { users: [], total: 0 },
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getUsers({ page, per_page })

      return {
        users: response.results || [], // The array of users
        total: response.count || 0 // The total count for pagination
      }
    },
    staleTime: 5000,
    gcTime: 120000
  })

  // Prefetch next & previous pages whenever page or per_page changes
  useEffect(() => {
    if (!data?.total) return

    const totalPages = Math.ceil(data.total / per_page)

    // Prefetch the next page
    if (page < totalPages) {
      const nextPage = page + 1

      queryClient.prefetchQuery({
        queryKey: ['users', nextPage, per_page],

        // FIXED: The prefetch query function must also transform the data
        // to match the shape that is stored in the cache.
        queryFn: async () => {
          const response = await getUsers({ page: nextPage, per_page })

          return {
            users: response.results || [],
            total: response.count || 0
          }
        }
      })
    }

    // Prefetch the previous page
    if (page > 1) {
      const prevPage = page - 1

      queryClient.prefetchQuery({
        queryKey: ['users', prevPage, per_page],

        // FIXED: Also transform the data here for consistency.
        queryFn: async () => {
          const response = await getUsers({ page: prevPage, per_page })

          return {
            users: response.results || [],
            total: response.count || 0
          }
        }
      })
    }
  }, [page, per_page, data?.total, queryClient])

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return {
    users: data.users,
    total: data.total,
    isLoading,
    isError,
    addUser: mutation.mutateAsync,
    refetchUsers: refetch
  }
}

export default useUsers
