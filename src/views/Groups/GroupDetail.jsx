'use client'

import React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material'

import { useTranslation } from '@/translations/useTranslation'
import PermissionTreeView from './TreeView'
import usePermissions from '@/hooks/usePermissions'
import { useGroupDetail } from '@/hooks/useGroups'
import LoadingState from '@/components/ui/LoadingState'

const GroupDetail = ({ open, onClose, groupId }) => {
  const { t } = useTranslation()
  const { permissions, isLoading: permissionsLoading, convertGroupPermissionsToIds } = usePermissions()
  const { group, isLoading: groupLoading, isError } = useGroupDetail(groupId)

  // Helper function to format date for display
  const formatDateForDisplay = dateString => {
    if (!dateString) return null

    // Convert "2025-07-30 01:53:41" to a more readable format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/)) {
      return dateString.replace(' ', ' - ')
    }

    return dateString
  }

  // Helper to get all parent category IDs for the group's permissions
  const getParentCategoryIds = () => {
    if (!group?.permissions || !permissions) return []

    const categoryIds = new Set()

    group.permissions.forEach(groupPermission => {
      if (groupPermission.category_id) {
        categoryIds.add(groupPermission.category_id)
      }
    })

    return Array.from(categoryIds)
  }

  // Convert group permissions (objects) to IDs
  const permissionIds = group ? convertGroupPermissionsToIds(group.permissions) : []

  // Filter permissions to only show group's permissions and their parent categories
  const filteredPermissions = React.useMemo(() => {
    if (!permissions || !group?.permissions) return []

    const groupPermissionIds = permissionIds
    const parentCategoryIds = getParentCategoryIds()

    return permissions.filter(permission => {
      // Include if it's a permission assigned to the group
      if (groupPermissionIds.includes(permission.id)) {
        return true
      }

      // Include if it's a parent category of the group's permissions
      if (permission.isCategory && parentCategoryIds.includes(permission.id)) {
        return true
      }

      return false
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions, group?.permissions, permissionIds])

  if (!groupId) return null

  if (groupLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth dir='rtl'>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('groups.groupDetails')}</DialogTitle>
        <DialogContent>
          <LoadingState />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    )
  }

  if (isError || !group) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth dir='rtl'>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('groups.groupDetails')}</DialogTitle>
        <DialogContent>
          <Typography color='error'>{t('messages.error')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    )
  }

  // Helper to get permission names by IDs
  const getPermissionNames = permissionIds => {
    if (!permissions || !permissionIds) return []

    return permissionIds.map(id => {
      const permission = permissions.find(p => p.id === id)

      return permission ? permission.name : `Permission ${id}`
    })
  }

  const groupPermissionNames = getPermissionNames(permissionIds)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth dir='rtl'>
      <DialogTitle sx={{ fontWeight: 600 }}>{t('groups.groupDetails')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Group Information */}
          <Box>
            <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
              {t('groups.groupInfo')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                  {t('groups.groupName')}:
                </Typography>
                <Typography variant='body1'>{group.name?.trim()}</Typography>
              </Box>
              {group.id && (
                <Box>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('groups.id')}:
                  </Typography>
                  <Typography variant='body1'>{group.id}</Typography>
                </Box>
              )}
              {group.created_at && (
                <Box>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('groups.createdAt')}:
                  </Typography>
                  <Typography variant='body1'>{formatDateForDisplay(group.created_at)}</Typography>
                </Box>
              )}
              {group.updated_at && (
                <Box>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('groups.updatedAt')}:
                  </Typography>
                  <Typography variant='body1'>{formatDateForDisplay(group.updated_at)}</Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Divider />
          {/* Users */}
          <Box>
            <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
              {t('groups.users')}
            </Typography>
            {group.users && group.users.length > 0 ? (
              <Box>
                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                  {t('groups.users')} ({group.users.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {group.users.map((user, index) => (
                    <Chip
                      key={user.id || index}
                      label={user.username || user.email || `User ${user.id}`}
                      variant='outlined'
                      size='small'
                      color='secondary'
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                {t('groups.noUsersAssigned')}
              </Typography>
            )}
          </Box>
          <Divider />
          {/* Permissions */}
          <Box>
            <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
              {t('groups.permissions')}
            </Typography>
            {permissionsLoading ? (
              <LoadingState />
            ) : filteredPermissions.length > 0 ? (
              <Box>
                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                  {t('groups.assignedPermissions')} ({groupPermissionNames.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {groupPermissionNames.map((permission, index) => (
                    <Chip key={index} label={permission} variant='outlined' size='small' color='primary' />
                  ))}
                </Box>
                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                  {t('groups.permissionsTree')}:
                </Typography>
                <PermissionTreeView
                  permissions={filteredPermissions}
                  selected={permissionIds}
                  readOnly={true}
                  rtl={true}
                  showControls={false}
                />
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                {t('groups.noPermissionsAssigned')}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default GroupDetail
