import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

import { getPermissions } from '@/api/permissions'
import { selectSidebar } from '@/store/slices/permissionsSlice'

const usePermissions = () => {
  const sidebar = useSelector(selectSidebar)

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

  // Build flattened tree with categories from sidebar + child permissions from flat list
  const buildFlattened = (flatPermissions, sidebarItems) => {
    if (!Array.isArray(flatPermissions)) return []

    const sidebarMap = new Map()

    if (Array.isArray(sidebarItems)) {
      sidebarItems.forEach(item => {
        if (item && typeof item.id !== 'undefined') {
          const title = item.title || item.lable || `Category ${item.id}`
          const sortOrder = typeof item.sort_order === 'number' ? item.sort_order : Number.MAX_SAFE_INTEGER

          sidebarMap.set(item.id, { id: item.id, title, sortOrder })
        }
      })
    }

    const grouped = new Map()

    flatPermissions.forEach(p => {
      const categoryId = p.sidebar_id ?? null

      if (!grouped.has(categoryId)) grouped.set(categoryId, [])
      grouped.get(categoryId).push(p)
    })

    const flattened = []

    const categoryIds = Array.from(grouped.keys())

    categoryIds.sort((a, b) => {
      const aMeta = sidebarMap.get(a)
      const bMeta = sidebarMap.get(b)
      const aOrder = aMeta?.sortOrder ?? Number.MAX_SAFE_INTEGER
      const bOrder = bMeta?.sortOrder ?? Number.MAX_SAFE_INTEGER

      if (aOrder !== bOrder) return aOrder - bOrder

      return (a ?? 0) - (b ?? 0)
    })

    categoryIds.forEach(categoryId => {
      const meta = sidebarMap.get(categoryId)
      const categoryName = meta?.title || `Category ${categoryId ?? 'Uncategorized'}`
      const categoryNodeId = categoryId != null ? `cat-${categoryId}` : 'cat-uncategorized'

      // Category node
      flattened.push({
        id: categoryNodeId,
        name: categoryName,
        category_id: null,
        codename: undefined,
        parent_id: null,
        isCategory: true
      })

      // Child permission nodes
      const children = grouped.get(categoryId) || []

      children.forEach(child => {
        flattened.push({
          id: `perm-${child.id}`,
          name: child.name,
          category_id: categoryNodeId,
          codename: child.codename,
          parent_id: categoryNodeId,
          isCategory: false
        })
      })
    })

    return flattened
  }

  const flattenedPermissions = buildFlattened(data.permissions, sidebar)

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
