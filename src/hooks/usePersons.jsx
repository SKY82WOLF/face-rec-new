'use client'

import { useEffect } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getPersons, addPerson, deletePerson } from '@/api/persons'

const keys = 'persons'

export const useGetPersons = (options = {}) => {
  const { offset = 0, limit = 10 } = options
  const queryClient = useQueryClient()

  const queryResult = useQuery({
    queryKey: ['persons', offset, limit],
    queryFn: async () => {
      const response = await getPersons({ offset, limit })

      return {
        data: response.data || [], // The array of persons
        total: response.total || 0 // The total count
      }
    },
    staleTime: 5000,
    gcTime: 60000
  })

  useEffect(() => {
    // Prefetch next page
    const nextOffset = offset + limit

    queryClient.prefetchQuery({
      queryKey: ['persons', nextOffset, limit],
      queryFn: async () => {
        const response = await getPersons({ offset: nextOffset, limit })

        return {
          data: response.data || [],
          total: response.total || 0
        }
      },
      staleTime: 5000,
      gcTime: 60000
    })

    // Prefetch previous page if it exists
    if (offset > 0) {
      const prevOffset = Math.max(0, offset - limit)

      queryClient.prefetchQuery({
        queryKey: ['persons', prevOffset, limit],
        queryFn: async () => {
          const response = await getPersons({ offset: prevOffset, limit })

          return {
            data: response.data || [],
            total: response.total || 0
          }
        },
        staleTime: 5000,
        gcTime: 60000
      })
    }
  }, [offset, limit, queryClient])

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

// TODO: Implement when API is available
// export const useUpdatePerson = (options = {}) => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: updatePerson,
//     onSuccess: (data, variables) => {
//       queryClient.setQueryData([keys], old =>
//         old?.map(person => (person.id === variables.id ? { ...person, ...variables.data } : person))
//       )
//       queryClient.invalidateQueries({ queryKey: [keys] })
//     },
//     ...options
//   })
// }

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
