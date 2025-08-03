import { useQuery } from '@tanstack/react-query'

import { getPermissions } from '@/api/permissions'

const usePermissions = () => {
  const {
    data = { permissions: [] },
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await getPermissions()

      return {
        permissions: response.results || response || []
      }
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000 // 10 minutes
  })

  // Flatten hierarchical permissions for TreeView
  const flattenPermissions = permissions => {
    const flattened = []

    permissions.forEach(category => {
      // Add category as parent permission
      flattened.push({
        id: category.id,
        name: category.name,
        category_id: category.category_id,
        codename: category.codename,
        parent_id: null,
        isCategory: true
      })

      // Add child permissions if they exist
      if (category.permissions && category.permissions.length > 0) {
        category.permissions.forEach(child => {
          flattened.push({
            id: child.id,
            name: child.name,
            category_id: child.category_id,
            codename: child.codename,
            parent_id: category.id,
            isCategory: false
          })
        })
      }
    })

    return flattened
  }

  const flattenedPermissions = flattenPermissions(data.permissions)

  // Helper function to convert group permissions (objects) to IDs
  const convertGroupPermissionsToIds = groupPermissions => {
    if (!groupPermissions || !Array.isArray(groupPermissions)) return []

    return groupPermissions.map(permission => {
      return typeof permission === 'object' && permission.id ? permission.id : permission
    })
  }

  return {
    permissions: flattenedPermissions,
    originalPermissions: data.permissions,
    isLoading,
    isError,
    refetchPermissions: refetch,
    convertGroupPermissionsToIds
  }
}

export default usePermissions
