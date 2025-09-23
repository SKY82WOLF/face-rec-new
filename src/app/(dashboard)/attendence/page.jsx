'use client'

import AttendanceContent from '@/views/Attendence/Attendence'
import PermissionGuard from '@/utils/PermissionGuard'

export default function Attendance() {
  return (
    <PermissionGuard permission='getAttendence'>
      <AttendanceContent />
    </PermissionGuard>
  )
}

