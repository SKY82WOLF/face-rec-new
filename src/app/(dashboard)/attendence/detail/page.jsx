'use client'

import AttendanceDetailContent from '@/views/Attendence/AttendanceDetail'
import PermissionGuard from '@/utils/PermissionGuard'

export default function AttendanceDetail() {
  return (
    <PermissionGuard permission='getAttendence'>
      <AttendanceDetailContent />
    </PermissionGuard>
  )
}
