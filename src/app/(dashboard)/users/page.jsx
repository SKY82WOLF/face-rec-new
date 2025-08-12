'use client'

import Users from '@/views/Users/Users'
import PermissionGuard from '@/utils/PermissionGuard'

export default function UsersPage() {
  return (
    <PermissionGuard permission='listUsers'>
      <Users />
    </PermissionGuard>
  )
}
