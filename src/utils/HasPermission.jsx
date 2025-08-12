import { useSelector } from 'react-redux'

import { selectPermissionsCodenames } from '@/store/slices/permissionsSlice'

/**
 * Hook to check if current user has a permission codename.
 * Accepts a string or array of strings. Returns boolean.
 */
const useHasPermission = permission => {
  const codenames = useSelector(selectPermissionsCodenames)

  if (!permission) return false

  const required = Array.isArray(permission) ? permission : [permission]

  return required.every(p => codenames.includes(p))
}

export default useHasPermission
