'use client'

import PermissionGuard from '@/utils/PermissionGuard'
import Shifts from '@/views/Shift/Shift'

export default function ShiftsPage() {
  return (

    // <PermissionGuard permission='listShifts'>
    
    <Shifts />

    // </PermissionGuard>
  )
}
