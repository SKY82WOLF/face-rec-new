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
  Divider,
  Avatar
} from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'

import { useTranslation } from '@/translations/useTranslation'
import PermissionTreeView from './TreeView'
import usePermissions from '@/hooks/usePermissions'
import { useGroupDetail } from '@/hooks/useGroups'
import LoadingState from '@/components/ui/LoadingState'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import AnimatedDialog from '@/components/AnimatedDialog'

const GroupDetail = ({ open, onClose, groupId }) => {
  const { t } = useTranslation()
  const { permissions, isLoading: permissionsLoading, convertGroupPermissionsToIds } = usePermissions()
  const { group, isLoading: groupLoading, isError } = useGroupDetail(groupId)

  // Helper to get all parent category IDs for the group's permissions
  const getParentCategoryIds = () => {
    if (!group?.permissions || !permissions) return []

    const categoryIds = new Set()

    group.permissions.forEach(groupPermission => {
      const parentId = groupPermission.category_id ?? groupPermission.sidebar_id ?? null

      if (parentId !== null && parentId !== undefined) {
        categoryIds.add(parentId)
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
    const parentCategoryIds = getParentCategoryIds().map(id => `cat-${id}`)

    return permissions.filter(permission => {
      const pid = String(permission.id)

      // Include if it's a permission assigned to the group
      if (!permission.isCategory && pid.startsWith('perm-')) {
        const rawId = parseInt(pid.replace('perm-', ''), 10)

        if (groupPermissionIds.includes(rawId)) return true
      }

      // Include if it's a parent category of the group's permissions
      if (permission.isCategory && parentCategoryIds.includes(pid)) {
        return true
      }

      return false
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions, group?.permissions, permissionIds])

  if (!groupId) return null

  if (groupLoading) {
    return (
      <AnimatedDialog open={open} onClose={onClose} maxWidth='md' fullWidth dir='rtl'>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('groups.groupDetails')}</DialogTitle>
        <DialogContent>
          <LoadingState />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogActions>
      </AnimatedDialog>
    )
  }

  if (isError || !group) {
    return (
      <AnimatedDialog open={open} onClose={onClose} maxWidth='md' fullWidth dir='rtl'>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('groups.groupDetails')}</DialogTitle>
        <DialogContent>
          <Typography color='error'>{t('messages.error')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogActions>
      </AnimatedDialog>
    )
  }

  // Helper to get permission names by IDs
  const getPermissionNames = permissionIds => {
    if (!permissions || !permissionIds) return []

    return permissionIds.map(id => {
      const itemId = `perm-${id}`
      const permission = permissions.find(p => String(p.id) === itemId)

      return permission ? permission.name : `Permission ${id}`
    })
  }

  const groupPermissionNames = getPermissionNames(permissionIds)

  return (
    <AnimatedDialog open={open} onClose={onClose} maxWidth='md' fullWidth dir='rtl'>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('groups.groupDetails')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Modern header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 3,
              background: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <GroupIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {group.name?.trim()}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                ID: {group.id}
              </Typography>
            </Box>
            <Chip
              label={`${t('groups.users')}: ${group.users ? group.users.length : 0}`}
              size='small'
              color='primary'
              variant='outlined'
            />
          </Box>
          {/* Info grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('groups.createdAt')}
              </Typography>
              <Typography variant='body2'>
                <ShamsiDateTime dateTime={group.created_at} />
              </Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('groups.updatedAt')}
              </Typography>
              <Typography variant='body2'>
                <ShamsiDateTime dateTime={group.updated_at} />
              </Typography>
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
                    <Chip
                      key={index}
                      label={permission}
                      color='primary'
                      variant='outlined'
                      size='small'
                      sx={{ border: '1px solid', borderRadius: '10px' }}
                    />
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
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
        <Button sx={{ mt: 2 }} variant='contained' onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </AnimatedDialog>
  )
}

export default GroupDetail
