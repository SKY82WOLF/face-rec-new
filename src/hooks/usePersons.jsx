'use client'

import { useEffect } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getPersons, addPerson, updatePerson, deletePerson } from '@/api/persons'

const keys = 'persons'

export const useGetPersons = (options = {}) => {
  const { page = 1, per_page = 10 } = options
  const queryClient = useQueryClient()

  const queryResult = useQuery({
    queryKey: ['persons', page, per_page],
    queryFn: async () => {
      const response = await getPersons({ page, per_page })

      return {
        data: response.results || [], // The array of persons
        total: response.count || 0 // The total count
      }
    },
    staleTime: 5000,
    gcTime: 60000
  })

  useEffect(() => {
    // Exit early if the data isn't available yet
    if (!queryResult.data) {
      return
    }

    // Calculate the total number of pages
    const totalPages = Math.ceil(queryResult.data.total / per_page)

    // --- Start of Change ---
    // Prefetch the next page only if the current page is not the last one
    if (page < totalPages) {
      const nextpage = page + 1

      queryClient.prefetchQuery({
        queryKey: ['persons', nextpage, per_page],
        queryFn: async () => {
          const response = await getPersons({ page: nextpage, per_page })

          return {
            data: response.results || [],
            total: response.count || 0
          }
        },
        staleTime: 5000,
        gcTime: 60000
      })
    }

    // Prefetch previous page if it exists
    if (page > 1) {
      const prevpage = page - 1

      queryClient.prefetchQuery({
        queryKey: ['persons', prevpage, per_page],
        queryFn: async () => {
          const response = await getPersons({ page: prevpage, per_page })

          return {
            data: response.results || [],
            total: response.count || 0
          }
        },
        staleTime: 5000,
        gcTime: 60000
      })
    }
  }, [page, per_page, queryClient, queryResult.data])

  return queryResult
}

export const useAddPerson = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [keys] })
    },
    ...options
  })
}

export const useUpdatePerson = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePerson,
    onSuccess: (variables) => {
      // Update the specific person in all queries
      queryClient.setQueriesData({ queryKey: [keys] }, old => {
        if (!old) return old

        return {
          ...old,
          data: old.data?.map(person => (person.id === variables.id ? { ...person, ...variables.data } : person)) || []
        }
      })
      queryClient.invalidateQueries({ queryKey: [keys] })
    },
    ...options
  })
}

export const useDeletePerson = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePerson,
    onSuccess: (_, deletedId) => {
      // Update all queries with the 'persons' prefix
      queryClient.setQueriesData({ queryKey: [keys] }, old => {
        if (!old) return old

        return {
          ...old,
          data: old.data?.filter(person => person.id !== deletedId) || []
        }
      })
      queryClient.invalidateQueries({ queryKey: [keys] })
    },
    ...options
  })
}
