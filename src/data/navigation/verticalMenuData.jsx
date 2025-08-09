'use client'

import { useTranslation } from '@/translations/useTranslation'

const useVerticalMenuData = () => {
  const { t } = useTranslation()

  return [
    {
      label: t('sidebar.live'),
      href: '/live',
      icon: 'tabler-camera'
    },
    {
      label: t('sidebar.access'),
      href: '/access',
      icon: 'tabler-lock-cog'
    },
    {
      label: t('sidebar.reports'),
      href: '/report',
      icon: 'tabler-receipt'
    },
    {
      label: t('sidebar.users'),
      href: '/users',
      icon: 'tabler-users'
    },
    {
      label: t('cameras.title'),
      href: '/cameras',
      icon: 'tabler-camera'
    },
    {
      label: t('groups.groups'),
      href: '/groups',
      icon: 'tabler-users-group'
    },
    {
      label: t('sidebar.profile'),
      href: '/profile',
      icon: 'tabler-user'
    }
  ]
}

export default useVerticalMenuData
