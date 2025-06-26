'use client'

import { useEffect } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getUsers, createUser } from '@/api/users'

const useUsers = (offset = 0, limit = 10) => {
  const queryClient = useQueryClient()

  const queryKey = ['users', offset, limit]

  const {
    data: users = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => getUsers(offset, limit),
    staleTime: 5000,
    gcTime:120000,
  })

  // Prefetch next & previous pages whenever offset or limit changes
  useEffect(() => {
    if (offset >= limit) {
      queryClient.prefetchQuery({
        queryKey: ['users', offset - limit, limit],
        queryFn: () => getUsers(offset - limit, limit),
        staleTime: 5000,
        gcTime: 120000
      })
    }

    queryClient.prefetchQuery({
      queryKey: ['users', offset + limit, limit],
      queryFn: () => getUsers(offset + limit, limit),
      staleTime: 5000,
      gcTime: 120000
    })
  }, [offset, limit, queryClient])

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return {
    users,
    isLoading,
    isError,
    addUser: mutation.mutateAsync,
    refetchUsers: refetch
  }
}

export default useUsers
