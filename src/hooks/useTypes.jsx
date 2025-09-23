'use client'

import { useEffect } from 'react'

import { useDispatch } from 'react-redux'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  setGenderTypes,
  setAccessTypes,
  setCameraDirectionTypes,
  setGenderTypesLoading,
  setAccessTypesLoading,
  setCameraDirectionTypesLoading
} from '@/store/slices/typesSlice'
import { getTypes, getTypesByCategory, updateType, deleteType } from '@/api/types'

const keys = 'types'

export const useGetTypes = (options = {}) => {
  const { page = 1, per_page = 100, category_id_name = null } = options

  return useQuery({
    queryKey: ['types', page, per_page, category_id_name],
    queryFn: async () => {
      const response = await getTypes({ page, per_page, category_id_name })

      return {
        data: response.results || [],
        total: response.count || 0
      }
    },
    staleTime: 5000,
    gcTime: 60000
  })
}

export const useGetTypesByCategory = (categoryName, options = {}) => {
  return useQuery({
    queryKey: ['types', 'category', categoryName],
    queryFn: async () => {
      const response = await getTypesByCategory(categoryName)

      return {
        data: response.results || [],
        total: response.count || 0
      }
    },
    staleTime: 5000,
    gcTime: 60000,
    enabled: !!categoryName,
    ...options
  })
}

export const useGetGenderTypes = (options = {}) => {
  return useGetTypesByCategory('gender', options)
}

export const useGetAccessTypes = (options = {}) => {
  return useGetTypesByCategory('access', options)
}

export const useGetCameraDirectionTypes = (options = {}) => {
  return useGetTypesByCategory('camera direction', options)
}

export const useUpdateType = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [keys] })
    },
    ...options
  })
}

export const useDeleteType = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteType,
    onSuccess: (_, deletedId) => {
      queryClient.setQueriesData({ queryKey: [keys] }, old => {
        if (!old) return old

        return {
          ...old,
          data: old.data?.filter(type => type.id !== deletedId) || []
        }
      })
      queryClient.invalidateQueries({ queryKey: [keys] })
    },
    ...options
  })
}

export const useTypesReduxSync = () => {
  const dispatch = useDispatch()
  const genderTypesQuery = useGetGenderTypes()
  const accessTypesQuery = useGetAccessTypes()
  const cameraDirectionTypesQuery = useGetCameraDirectionTypes()

  // Gender types
  useEffect(() => {
    if (genderTypesQuery.isLoading) {
      dispatch(setGenderTypesLoading())
    } else if (genderTypesQuery.data) {
      dispatch(setGenderTypes(genderTypesQuery.data))
    }
  }, [genderTypesQuery.isLoading, genderTypesQuery.data, dispatch])

  // Access types
  useEffect(() => {
    if (accessTypesQuery.isLoading) {
      dispatch(setAccessTypesLoading())
    } else if (accessTypesQuery.data) {
      dispatch(setAccessTypes(accessTypesQuery.data))
    }
  }, [accessTypesQuery.isLoading, accessTypesQuery.data, dispatch])

  // Camera direction types
  useEffect(() => {
    if (cameraDirectionTypesQuery.isLoading) {
      dispatch(setCameraDirectionTypesLoading())
    } else if (cameraDirectionTypesQuery.data) {
      dispatch(setCameraDirectionTypes(cameraDirectionTypesQuery.data))
    }
  }, [cameraDirectionTypesQuery.isLoading, cameraDirectionTypesQuery.data, dispatch])
}
