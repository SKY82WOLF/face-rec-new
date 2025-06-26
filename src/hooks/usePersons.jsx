'use client'

import { useEffect } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getPersons, addPerson } from '@/api/persons'

const keys = 'persons'

export const useGetPersons = (options = {}) => {
  const { offset = 0, limit = 10 } = options
  const queryClient = useQueryClient()

  const queryResult = useQuery({
    queryKey: ['persons', offset, limit],
    queryFn: () => getPersons({ offset, limit }),
    staleTime: 5000,
    gcTime: 60000,
    select: data => data || []
  })

  useEffect(() => {

    // Prefetch next page
    const nextOffset = offset + limit

    queryClient.prefetchQuery({
      queryKey: ['persons', nextOffset, limit],
      queryFn: () => getPersons({ offset: nextOffset, limit }),
      staleTime: 5000,
      gcTime: 60000,
      select: data => data || []
    })

    // Prefetch previous page if it exists
    if (offset > 0) {
      const prevOffset = Math.max(0, offset - limit)

      queryClient.prefetchQuery({
        queryKey: ['persons', prevOffset, limit],
        queryFn: () => getPersons({ offset: prevOffset, limit }),
        staleTime: 5000,
        gcTime: 60000,
        select: data => data || []
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

// TODO: Implement when API is available
// export const useDeletePerson = (options = {}) => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: deletePerson,
//     onSuccess: (_, deletedId) => {
//       queryClient.setQueryData([keys], old => old?.filter(person => person.id !== deletedId))
//       queryClient.invalidateQueries({ queryKey: [keys] })
//     },
//     ...options
//   })
// }
