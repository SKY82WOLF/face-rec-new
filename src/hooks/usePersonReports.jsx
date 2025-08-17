'use client'

import { useEffect } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getPersonReports,
  getPersonReport,
  updatePersonReport,
  deletePersonReport,
  getPersonPersonReports
} from '@/api/personReports'

const usePersonReports = ({
  page = 1,
  per_page = 10,
  gender_id = null,
  camera_id = null,
  person_id = null,
  access_id = null,
  first_name = null,
  last_name = null,
  national_code = null,
  created_at_from = null,
  created_at_to = null,
  order_by = null
} = {}) => {
  const queryClient = useQueryClient()

  const queryKey = [
    'personReports',
    page,
    per_page,
    gender_id,
    camera_id,
    person_id,
    access_id,
    first_name,
    last_name,
    national_code,
    created_at_from,
    created_at_to,
    order_by
  ]

  const {
    data = { results: [], count: 0 },
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getPersonReports({
        page,
        per_page,
        gender_id,
        camera_id,
        person_id,
        access_id,
        first_name,
        last_name,
        national_code,
        created_at_from,
        created_at_to,
        order_by
      })

      return {
        results: response.results || [],
        count: response.count || 0
      }
    },
    staleTime: 5000,
    gcTime: 120000
  })

  // Prefetch next & previous pages
  useEffect(() => {
    if (!data?.count) return

    const totalPages = Math.ceil(data.count / per_page)

    // Prefetch next page
    if (page < totalPages) {
      const nextPage = page + 1

      queryClient.prefetchQuery({
        queryKey: [
          'personReports',
          nextPage,
          per_page,
          gender_id,
          camera_id,
          person_id,
          access_id,
          first_name,
          last_name,
          national_code,
          created_at_from,
          created_at_to,
          order_by
        ],
        queryFn: async () => {
          const response = await getPersonReports({
            page: nextPage,
            per_page,
            gender_id,
            camera_id,
            person_id,
            access_id,
            first_name,
            last_name,
            national_code,
            created_at_from,
            created_at_to,
            order_by
          })

          return {
            results: response.results || [],
            count: response.count || 0
          }
        }
      })
    }

    // Prefetch previous page
    if (page > 1) {
      const prevPage = page - 1

      queryClient.prefetchQuery({
        queryKey: [
          'personReports',
          prevPage,
          per_page,
          gender_id,
          camera_id,
          person_id,
          access_id,
          first_name,
          last_name,
          national_code,
          created_at_from,
          created_at_to,
          order_by
        ],
        queryFn: async () => {
          const response = await getPersonReports({
            page: prevPage,
            per_page,
            gender_id,
            camera_id,
            person_id,
            access_id,
            first_name,
            last_name,
            national_code,
            created_at_from,
            created_at_to,
            order_by
          })

          return {
            results: response.results || [],
            count: response.count || 0
          }
        }
      })
    }
  }, [page, per_page, data.count, queryClient, gender_id, camera_id, person_id, access_id, first_name, last_name, national_code, created_at_from, created_at_to, order_by])

  const updateMutation = useMutation({
    mutationFn: updatePersonReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personReports'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deletePersonReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personReports'] })
    }
  })

  return {
    reports: data.results,
    total: data.count,
    isLoading,
    isError,
    updateReport: updateMutation.mutateAsync,
    deleteReport: deleteMutation.mutateAsync,
    refetchReports: refetch,
    loading: updateMutation.isPending || deleteMutation.isPending
  }
}

// Hook for getting a single person report
const usePersonReport = reportId => {
  const {
    data: report,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['personReport', reportId],
    queryFn: async () => {
      if (!reportId) return null
      const response = await getPersonReport(reportId)

      return response.results || response
    },
    enabled: !!reportId,
    staleTime: 5000,
    gcTime: 120000
  })

  return {
    report,
    isLoading,
    isError,
    refetchReport: refetch
  }
}

// Hook for getting reports for a specific person
const usePersonPersonReports = (personId, { page = 1, per_page = 10 } = {}) => {
  const {
    data = { results: [], count: 0 },
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['personPersonReports', personId, page, per_page],
    queryFn: async () => {
      if (!personId) return { results: [], count: 0 }
      const response = await getPersonPersonReports(personId, { page, per_page })

      return {
        results: response.results || [],
        count: response.count || 0
      }
    },
    enabled: !!personId,
    staleTime: 5000,
    gcTime: 120000
  })

  return {
    reports: data.results,
    total: data.count,
    isLoading,
    isError,
    refetchReports: refetch
  }
}

export { usePersonReport, usePersonPersonReports }
export default usePersonReports
