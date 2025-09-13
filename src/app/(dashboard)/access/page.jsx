'use client'

import Access from '@/views/Access/Access'
import PermissionGuard from '@/utils/PermissionGuard'

export default function AccessPage() {
  return (
    <PermissionGuard permission='listPersons'>
      <Access />
    </PermissionGuard>
  )
}
