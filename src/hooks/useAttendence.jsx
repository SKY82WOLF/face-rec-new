'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getPersonAttendance, getAttendanceSummary, getPersonShifts } from '@/api/attendence'

const useAttendence = ({
  personId,
  start_date,
  end_date,
  shift_ids,
  entry_cam_ids,
  exit_cam_ids,
  entry_exit_cam_ids,
  enabled = true
} = {}) => {
  const queryClient = useQueryClient()

  // Use a distinct query key for summary so it doesn't collide with the main
  // attendance data query (they use a different shape/result).
  const queryKey = [
    'attendance-summary',
    personId,
    start_date,
    end_date,
    shift_ids,
    entry_cam_ids,
    exit_cam_ids,
    entry_exit_cam_ids
  ]

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
        return null
      }

      const response = await getPersonAttendance({
        personId,
        start_date,
        end_date,
        shift_ids,
        entry_cam_ids,
        exit_cam_ids,
        entry_exit_cam_ids
      })

      // Normalize attendance into an array to avoid passing objects to the UI
      const attendanceArray = Array.isArray(response.results?.attendance) ? response.results.attendance : []

      return {
        attendance: attendanceArray,
        count: attendanceArray.length,
        personId: response.results?.person_id || personId,
        personName: response.results?.person_name || null,
        startDate: start_date,
        endDate: end_date
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
const useAttendanceSummary = ({
  personId,
  start_date,
  end_date,
  shift_ids,
  entry_cam_ids,
  exit_cam_ids,
  entry_exit_cam_ids,
  enabled = true
} = {}) => {
  const queryClient = useQueryClient()

  const queryKey = [
    'attendance-data',
    personId,
    start_date,
    end_date,
    shift_ids,
    entry_cam_ids,
    exit_cam_ids,
    entry_exit_cam_ids
  ]

  const {
    data: summary,
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

      // Helper to format minutes to HH:MM
      const formatMinutesToHHMM = minutes => {
        if (!minutes || minutes < 0) return '00:00'

        const hours = Math.floor(minutes / 60)
        const remaining = Math.floor(minutes % 60)

        return `${String(hours).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
      }

      // Attendance query key (same as the list hook) - try to read cached list data first
      const attendanceQueryKey = [
        'attendance-data',
        personId,
        start_date,
        end_date,
        shift_ids,
        entry_cam_ids,
        exit_cam_ids,
        entry_exit_cam_ids
      ]

      const cached = queryClient.getQueryData(attendanceQueryKey)

      let attendance = null

      if (cached && Array.isArray(cached.attendance)) {
        // Use cached attendance data to compute the summary (avoids duplicate network calls)
        attendance = cached.attendance
      } else {
        // Fall back to fetching from API if list data isn't cached
        const response = await getPersonAttendance({
          personId,
          start_date,
          end_date,
          shift_ids,
          entry_cam_ids,
          exit_cam_ids,
          entry_exit_cam_ids
        })

        attendance = response.results?.attendance || []
      }

      // If no attendance data, return empty summary
      if (!attendance || !Array.isArray(attendance) || attendance.length === 0) {
        return {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          earlyExitDays: 0,
          overtimeDays: 0,
          averageDuration: '00:00',
          totalWorkTime: '00:00',
          totalDuration: '00:00',
          totalLateTime: '00:00',
          totalAbsentTime: '00:00',
          totalExtraTime: '00:00',
          attendance: []
        }
      }

      const totalDays = attendance.length
      const presentDays = totalDays
      const lateDays = attendance.filter(day => day.is_late).length
      const earlyExitDays = attendance.filter(day => day.is_early_exit).length
      const overtimeDays = attendance.filter(day => day.overtime_minutes > 0).length

      const totalDurationMinutes = attendance.reduce((sum, day) => sum + (day.duration_minutes || 0), 0)
      const totalDuration = formatMinutesToHHMM(totalDurationMinutes)

      const totalLateMinutes = attendance.reduce((sum, day) => sum + (day.late_minutes || 0), 0)
      const totalLateTime = formatMinutesToHHMM(totalLateMinutes)

      const totalAbsentMinutes = attendance.reduce((sum, day) => {
        const lateTime = day.late_minutes || 0
        const earlyExitTime = day.early_exit_minutes || 0

        return sum + lateTime + earlyExitTime
      }, 0)

      const totalAbsentTime = formatMinutesToHHMM(totalAbsentMinutes)

      const totalExtraMinutes = attendance.reduce((sum, day) => sum + (day.overtime_minutes || 0), 0)
      const totalExtraTime = formatMinutesToHHMM(totalExtraMinutes)

      return {
        totalDays,
        presentDays,
        absentDays: 0,
        lateDays,
        earlyExitDays,
        overtimeDays,
        averageDuration: totalDuration,
        totalWorkTime: totalDuration,
        totalDuration,
        totalLateTime,
        totalAbsentTime,
        totalExtraTime,
        attendance
      }
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
const useAttendanceDetail = ({
  personId,
  date,
  start_date,
  end_date,
  shift_ids,
  entry_cam_ids,
  exit_cam_ids,
  entry_exit_cam_ids,
  enabled = true
} = {}) => {
  const {
    data: attendanceDetail,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: [
      'attendance-detail',
      personId,
      date,
      start_date,
      end_date,
      shift_ids,
      entry_cam_ids,
      exit_cam_ids,
      entry_exit_cam_ids
    ],
    queryFn: async () => {
      if (!personId) {
        throw new Error('Person ID is required')
      }

      // Determine start/end for the API call. Prefer explicit start_date/end_date if provided
      let sd = start_date || null
      let ed = end_date || null

      if (!sd && date) {
        sd = date
      }

      if (!ed) {
        if (date) {
          const nextDay = new Date(date)

          nextDay.setDate(nextDay.getDate() + 1)
          ed = nextDay.toISOString().split('T')[0]
        }
      }

      if (!sd || !ed) {
        throw new Error('Start date and end date are required')
      }

      const response = await getPersonAttendance({
        personId,
        start_date: sd,
        end_date: ed,
        shift_ids,
        entry_cam_ids,
        exit_cam_ids,
        entry_exit_cam_ids
      })

      const attendance = response.results?.attendance

      if (!Array.isArray(attendance)) {
        // If API returns an object (e.g., message), return null instead of throwing
        return null
      }

      // If date is provided, find the matching day; otherwise return the first day's detail
      if (date) {
        const dayData = attendance.find(day => day.date?.startsWith(date))

        return dayData || null
      }

      return attendance[0] || null
    },
    enabled: enabled && !!personId && (!!date || (!!start_date && !!end_date)),
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

// Hook for getting person shifts
const usePersonShifts = ({ personId, enabled = true } = {}) => {
  const {
    data: shifts,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['personShifts', personId],
    queryFn: async () => {
      if (!personId) return []

      const response = await getPersonShifts({ personId })

      return response.results || []
    },
    enabled: enabled && !!personId,
    staleTime: 5000,
    gcTime: 120000
  })

  return {
    shifts: shifts || [],
    isLoading,
    isError,
    error,
    refetchShifts: refetch
  }
}

export { useAttendanceSummary, useAttendanceDetail, usePersonShifts }
export default useAttendence
