// API functions for attendance management
import { attendanceList, personShiftsList } from '@/configs/routes'
import axiosInstance from './axios'

/**
 * Get attendance data for a specific person within a date range
 * @param {Object} options - Request options
 * @param {number} options.personId - Person ID
 * @param {string} options.start_date - Start date (YYYY-MM-DD format)
 * @param {string} options.end_date - End date (YYYY-MM-DD format)
 * @param {string} options.shift_ids - Shift IDs
 * @param {Array} options.entry_cam_ids - Entry camera IDs
 * @param {Array} options.exit_cam_ids - Exit camera IDs
 * @param {Array} options.entry_exit_cam_ids - Entry-exit camera IDs
 * @returns {Promise<Object>} - Response with attendance data
 */
export const getPersonAttendance = async ({
  personId,
  start_date,
  end_date,
  shift_ids,
  entry_cam_ids = [],
  exit_cam_ids = [],
  entry_exit_cam_ids = []
}) => {
  try {
    if (!personId) {
      throw new Error('Person ID is required')
    }

    if (!start_date || !end_date) {
      throw new Error('Start date and end date are required')
    }

    // Replace the :personId placeholder with actual personId
    const url = attendanceList.replace(':personId', personId)

    const params = {
      start_date,
      end_date
    }

    // Add optional parameters if provided
    if (shift_ids) {
      params.shift_ids = shift_ids
    }

    if (entry_cam_ids && entry_cam_ids.length > 0) {
      params.entry_cam_ids = entry_cam_ids.join(',')
    }

    if (exit_cam_ids && exit_cam_ids.length > 0) {
      params.exit_cam_ids = exit_cam_ids.join(',')
    }

    if (entry_exit_cam_ids && entry_exit_cam_ids.length > 0) {
      params.entry_exit_cam_ids = entry_exit_cam_ids.join(',')
    }

    const response = await axiosInstance.get(url, { params })

    return response
  } catch (error) {
    console.error('Error fetching attendance data:', error)

    throw error.response || error
  }
}

/**
 * Get attendance summary statistics for a person
 * @param {Object} options - Request options
 * @param {number} options.personId - Person ID
 * @param {string} options.start_date - Start date (YYYY-MM-DD format)
 * @param {string} options.end_date - End date (YYYY-MM-DD format)
 * @param {number} options.shift_ids - Shift IDs (optional)
 * @param {Array} options.entry_cam_ids - Entry camera IDs (optional)
 * @param {Array} options.exit_cam_ids - Exit camera IDs (optional)
 * @param {Array} options.entry_exit_cam_ids - Entry-exit camera IDs (optional)
 * @returns {Promise<Object>} - Response with attendance summary
 */
export const getAttendanceSummary = async ({ personId, start_date, end_date, shift_ids, entry_cam_ids, exit_cam_ids, entry_exit_cam_ids }) => {
  try {
    const response = await getPersonAttendance({
      personId,
      start_date,
      end_date,
      shift_ids,
      entry_cam_ids,
      exit_cam_ids,
      entry_exit_cam_ids
    })

    // Check if attendance exists and is an array
    if (!response?.results?.attendance || !Array.isArray(response.results.attendance)) {
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

    const attendance = response.results.attendance
    const totalDays = attendance.length
    const presentDays = totalDays
    const lateDays = attendance.filter(day => day.is_late).length
    const earlyExitDays = attendance.filter(day => day.is_early_exit).length
    const overtimeDays = attendance.filter(day => day.overtime_minutes > 0).length

    // Calculate total duration (sum of all durations)
    const totalDurationMinutes = attendance.reduce((sum, day) => sum + (day.duration_minutes || 0), 0)
    const totalDuration = formatDuration(totalDurationMinutes)

    // Calculate total late time (sum of all late minutes)
    const totalLateMinutes = attendance.reduce((sum, day) => sum + (day.late_minutes || 0), 0)
    const totalLateTime = formatDuration(totalLateMinutes)

    // Calculate total absent time (late + early exit time)
    const totalAbsentMinutes = attendance.reduce((sum, day) => {
      const lateTime = day.late_minutes || 0
      const earlyExitTime = day.early_exit_minutes || 0

      return sum + lateTime + earlyExitTime
    }, 0)

    const totalAbsentTime = formatDuration(totalAbsentMinutes)

    // Calculate total extra/overtime
    const totalOvertimeMinutes = attendance.reduce((sum, day) => sum + (day.overtime_minutes || 0), 0)
    const totalExtraTime = formatDuration(totalOvertimeMinutes)

    // Calculate total work time
    const totalWorkMinutes = attendance.reduce((sum, day) => sum + (day.total_work_minutes || 0), 0)
    const totalWorkTime = formatDuration(totalWorkMinutes)

    return {
      totalDays,
      presentDays,
      absentDays: 0, // Based on the API, we only get present days
      lateDays,
      earlyExitDays,
      overtimeDays,
      totalDuration,
      totalLateTime,
      totalAbsentTime,
      totalExtraTime,
      totalWorkTime,
      attendance
    }
  } catch (error) {
    console.error('Error calculating attendance summary:', error)
    throw error
  }
}

/**
 * Format duration from minutes to HH:MM format
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration (HH:MM)
 */
export const formatDuration = minutes => {
  if (!minutes || minutes < 0) return '00:00'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.floor(minutes % 60)

  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`
}

/**
 * Parse time string to minutes since midnight
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} - Minutes since midnight
 */
export const parseTimeToMinutes = timeString => {
  if (!timeString) return 0

  const [hours, minutes] = timeString.split(':').map(Number)

  return hours * 60 + minutes
}

/**
 * Get person's shifts
 * @param {Object} options - Request options
 * @param {number} options.personId - Person ID
 * @returns {Promise<Object>} - Response with person shifts
 */
export const getPersonShifts = async ({ personId }) => {
  try {
    if (!personId) {
      throw new Error('Person ID is required')
    }

    const response = await axiosInstance.get(personShiftsList.replace(':personId', personId))

    return response
  } catch (error) {
    console.error('Error fetching person shifts:', error)

    throw error.response || error
  }
}

/**
 * Calculate time difference in minutes
 * @param {string} startTime - Start time (HH:MM or full datetime)
 * @param {string} endTime - End time (HH:MM or full datetime)
 * @returns {number} - Difference in minutes
 */
export const calculateTimeDifference = (startTime, endTime) => {
  if (!startTime || !endTime) return 0

  try {
    // If it's a full datetime, extract just the time part
    const startTimeOnly = startTime.includes(' ') ? startTime.split(' ')[1] : startTime
    const endTimeOnly = endTime.includes(' ') ? endTime.split(' ')[1] : endTime

    const startMinutes = parseTimeToMinutes(startTimeOnly)
    const endMinutes = parseTimeToMinutes(endTimeOnly)

    return endMinutes - startMinutes
  } catch (error) {
    console.error('Error calculating time difference:', error)

    return 0
  }
}
