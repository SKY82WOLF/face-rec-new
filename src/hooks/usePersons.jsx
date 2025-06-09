'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getPersons, addPerson } from '@/api/persons'

const keys = 'persons'

export const useGetPersons = (options = {}) => {
  const { offset = 0, limit = 10, ...restOptions } = options
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: [keys, offset, limit],
    queryFn: () => getPersons({ offset, limit }),
    staleTime: 30 * 1000,
    select: data => {
      // Return the data as is, without transforming it
      return data || []
    },
    onSuccess: () => {
      // Prefetch next page
      const nextOffset = offset + limit

      queryClient.prefetchQuery({
        queryKey: [keys, nextOffset, limit],
        queryFn: () => getPersons({ offset: nextOffset, limit })
      })

      // Prefetch previous page if not on first page
      if (offset > 0) {
        const prevOffset = Math.max(0, offset - limit)

        queryClient.prefetchQuery({
          queryKey: [keys, prevOffset, limit],
          queryFn: () => getPersons({ offset: prevOffset, limit })
        })
      }
    },
    ...restOptions
  })
}

export const useAddPerson = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addPerson,
    onSuccess: newPerson => {
      queryClient.setQueryData([keys], old => [...(old || []), newPerson])
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
