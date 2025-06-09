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
      label: t('sidebar.profile'),
      href: '/profile',
      icon: 'tabler-user'
    },
  ]
}

export default useVerticalMenuData
