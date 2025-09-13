'use client'

import PermissionGuard from '@/utils/PermissionGuard'

import Reports from '@/views/Reports/Reports'

export default function ReportPage() {
  return (
    <PermissionGuard permission="listPersonReports">
      <Reports />
    </PermissionGuard>
  )
}
