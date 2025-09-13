import Groups from '@/views/Groups/Groups'
import PermissionGuard from '@/utils/PermissionGuard'

export default function GroupsPage() {
  return (
    <PermissionGuard permission='listGroups'>
      <Groups />
    </PermissionGuard>
  )
}
