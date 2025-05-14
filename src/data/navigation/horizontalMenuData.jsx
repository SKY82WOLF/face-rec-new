'use client'

import { useTranslation } from '@/translations/useTranslation'

const useHorizontalMenuData = () => {
  const { t } = useTranslation()

  return [
    {
      label: t('sidebar.dashboard'),
      href: '/home',
      icon: 'tabler-smart-home'
    },
    {
      label: t('sidebar.profile'),
      href: '/profile',
      icon: 'tabler-user'
    },
    {
      label: t('sidebar.live'),
      href: '/surveillance',
      icon: 'tabler-camera'
    }
  ]
}

export default useHorizontalMenuData
