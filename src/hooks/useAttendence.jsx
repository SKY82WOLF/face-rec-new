'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getPersonAttendance, getAttendanceSummary } from '@/api/attendence'

const useAttendence = ({ personId, start_date, end_date, enabled = true } = {}) => {
  const queryClient = useQueryClient()
  const queryKey = ['attendance', personId, start_date, end_date]

  const {
    data = { attendance: [], count: 0, personId: null, personName: null, startDate: null, endDate: null },
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!personId || !start_date || !end_date) {
        throw new Error('Person ID, start date, and end date are required')
      }

      const response = await getPersonAttendance({ personId, start_date, end_date })

      // Handle case where attendance is an object with message instead of array
      const attendance = response.results?.attendance
      const attendanceArray = Array.isArray(attendance) ? attendance : []

      return {
        attendance: attendanceArray,
        count: response.results?.count || 0,
        personId: response.results?.person_id || personId,
        personName: response.results?.person_name || null,
        startDate: response.results?.start_date || start_date,
        endDate: response.results?.end_date || end_date
      }
    },
    enabled: enabled && !!personId && !!start_date && !!end_date,
    staleTime: 5000,
    gcTime: 120000
  })

  return {
    attendance: data.attendance,
    count: data.count,
    personId: data.personId,
    personName: data.personName,
    startDate: data.startDate,
    endDate: data.endDate,
    isLoading,
    isError,
    error,
    refetchAttendance: refetch
  }
}

// Hook for getting attendance summary statistics
const useAttendanceSummary = ({ personId, start_date, end_date, enabled = true } = {}) => {
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['attendance-summary', personId, start_date, end_date],
    queryFn: async () => {
      if (!personId || !start_date || !end_date) {
        throw new Error('Person ID, start date, and end date are required')
      }

      return await getAttendanceSummary({ personId, start_date, end_date })
    },
    enabled: enabled && !!personId && !!start_date && !!end_date,
    staleTime: 10000,
    gcTime: 300000
  })

  return {
    summary: summary || {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      earlyExitDays: 0,
      overtimeDays: 0,
      averageDuration: '00:00',
      totalWorkTime: '00:00',
      attendance: []
    },
    isLoading,
    isError,
    error,
    refetchSummary: refetch
  }
}

// Hook for a single day's attendance detail
const useAttendanceDetail = ({ personId, date, enabled = true } = {}) => {
  const {
    data: attendanceDetail,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['attendance-detail', personId, date],
    queryFn: async () => {
      if (!personId || !date) {
        throw new Error('Person ID and date are required')
      }

      // For a single day, start_date and end_date should be the same
      // But since the API requires at least 2 days, we'll get a 2-day range and filter
      const nextDay = new Date(date)

      nextDay.setDate(nextDay.getDate() + 1)
      const endDate = nextDay.toISOString().split('T')[0]

      const response = await getPersonAttendance({
        personId,
        start_date: date,
        end_date: endDate
      })

      // Find the specific day's data
      const attendance = response.results?.attendance

      if (!Array.isArray(attendance)) {
        return null
      }

      const dayData = attendance.find(day => day.date?.startsWith(date))

      return dayData || null
    },
    enabled: enabled && !!personId && !!date,
    staleTime: 5000,
    gcTime: 120000
  })

  return {
    attendanceDetail,
    isLoading,
    isError,
    error,
    refetchDetail: refetch
  }
}

export { useAttendanceSummary, useAttendanceDetail }
export default useAttendence
