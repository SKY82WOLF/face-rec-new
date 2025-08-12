'use client'

import { useTranslation } from '@/translations/useTranslation'
import useHasPermission from '@/utils/HasPermission'

const useVerticalMenuData = () => {
  const { t } = useTranslation()

  const hasAccessPermission = useHasPermission('listPersons')
  const hasReportsPermission = useHasPermission('listPersonReports')
  const hasUsersPermission = useHasPermission('listUsers')
  const hasCamerasPermission = useHasPermission('listCameras')
  const hasGroupsPermission = useHasPermission('listGroups')
  const hasUserPermission = useHasPermission('getUser')

  return [
    {
      label: t('sidebar.live'),
      href: '/live',
      icon: 'tabler-camera'
    },
    hasAccessPermission && {
      label: t('sidebar.access'),
      href: '/access',
      icon: 'tabler-lock-cog'
    },
    hasReportsPermission && {
      label: t('sidebar.reports'),
      href: '/report',
      icon: 'tabler-receipt'
    },
    hasUsersPermission && {
      label: t('sidebar.users'),
      href: '/users',
      icon: 'tabler-users'
    },
    hasCamerasPermission && {
      label: t('cameras.title'),
      href: '/cameras',
      icon: 'tabler-camera'
    },
    hasGroupsPermission && {
      label: t('groups.groups'),
      href: '/groups',
      icon: 'tabler-users-group'
    },
    hasUserPermission && {
      label: t('sidebar.profile'),
      href: '/profile',
      icon: 'tabler-user'
    }
  ]
}

export default useVerticalMenuData
