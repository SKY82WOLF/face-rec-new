'use client'

import Live from '@/views/Live/Live'
import PermissionGuard from '@/utils/PermissionGuard'

export default function LivePage() {
  return (
    <PermissionGuard permission='listTypes'>
      <Live />
    </PermissionGuard>
  )
}
