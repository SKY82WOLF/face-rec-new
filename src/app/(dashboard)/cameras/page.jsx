'use client'

import Cameras from '@/views/Cameras/Cameras'
import PermissionGuard from '@/utils/PermissionGuard'

export default function CamerasPage() {
  return (
    <PermissionGuard permission='listCameras'>
      <Cameras />
    </PermissionGuard>
  )
}
