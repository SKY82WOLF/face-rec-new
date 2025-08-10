'use client'

import * as React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Autocomplete,
  TextField,
  Chip,
  Paper
} from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'
import PermissionTreeView from './TreeView'
import usePermissions from '@/hooks/usePermissions'
import useUsers from '@/hooks/useUsers'
import LoadingState from '@/components/ui/LoadingState'

const GroupsUpdate = ({ open, onClose, onSubmit, group, isLoading = false }) => {
  const { t } = useTranslation()
  const { permissions, isLoading: permissionsLoading } = usePermissions()
  const { users, isLoading: usersLoading } = useUsers({ page: 1, per_page: 1000 })

  const [editGroup, setEditGroup] = React.useState({
    name: '',
    permissions: [],
    users: []
  })

  React.useEffect(() => {
    if (group) {
      // Convert permissions objects to IDs for TreeView
      const permissionIds = group.permissions ? group.permissions.map(p => (typeof p === 'object' ? p.id : p)) : []

      setEditGroup({
        name: group.name,
        permissions: permissionIds,
        users: group.users ? group.users.map(u => u.id) : []
      })
    }
  }, [group])

  const handleInputChange = e => {
    const { name, value } = e.target

    setEditGroup(prev => ({ ...prev, [name]: value }))
  }

  const handlePermissionsChange = selectedPermissions => {
    setEditGroup(prev => ({ ...prev, permissions: selectedPermissions }))
  }

  const handleUsersChange = (event, value) => {
    setEditGroup(prev => ({ ...prev, users: value.map(user => user.id) }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Trim the name before submitting
    const trimmedData = {
      ...editGroup,
      name: editGroup.name.trim()
    }

    await onSubmit({ id: group.id, data: trimmedData })
    handleClose()
  }

  const handleClose = () => {
    setEditGroup({ name: '', permissions: [], users: [] })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
      dir='rtl'
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: 22, pb: 1, bgcolor: 'background.paper' }}>
        {t('groups.editGroupTitle')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Group Name */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('groups.groupName')}
              </Typography>
              <CustomTextField
                fullWidth
                label={t('groups.groupName')}
                name='name'
                value={editGroup.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                inputProps={{ style: { textAlign: 'right' } }}
              />

              {/* Users Selection */}
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main', marginTop: 2 }}>
                {t('groups.users')}
              </Typography>
              {usersLoading ? (
                <LoadingState />
              ) : (
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={option => option.username || option.email || String(option.id)}
                  value={users.filter(u => editGroup.users.includes(u.id))}
                  onChange={handleUsersChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant='outlined'
                      label={t('groups.users')}
                      placeholder={t('groups.users')}
                      inputProps={{ ...params.inputProps, style: { textAlign: 'right' } }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...chipProps } = getTagProps({ index })

                      return <Chip key={key} label={option.username || option.email || option.id} {...chipProps} />
                    })
                  }
                  disabled={isLoading}
                  sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                />
              )}

              {/* Permissions Selection */}
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main', marginTop: 2 }}>
                {t('groups.permissions')}
              </Typography>
              {permissionsLoading ? (
                <LoadingState />
              ) : permissions.length > 0 ? (
                <PermissionTreeView
                  permissions={permissions}
                  selected={editGroup.permissions}
                  onChange={handlePermissionsChange}
                  readOnly={false}
                  rtl={true}
                  showControls={true}
                />
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {t('groups.noPermissionsAvailable')}
                </Typography>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ px: 4, pb: 3, pt: 0, justifyContent: 'space-between', gap: 2, bgcolor: 'background.paper' }}
        >
          <Button onClick={handleClose} variant='outlined' color='error' sx={{ minWidth: 120 }} disabled={isLoading}>
            {t('groups.cancel')}
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            sx={{ minWidth: 140, fontWeight: 600 }}
            disabled={isLoading || !editGroup.name.trim()}
          >
            {isLoading ? t('common.loading') : t('groups.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default GroupsUpdate
