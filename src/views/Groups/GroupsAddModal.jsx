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

const GroupsAdd = ({ open, onClose, onSubmit, isLoading = false }) => {
  const { t } = useTranslation()
  const { permissions, isLoading: permissionsLoading } = usePermissions()
  const { users, isLoading: usersLoading } = useUsers({ page: 1, per_page: 1000 })

  const [newGroup, setNewGroup] = React.useState({
    name: '',
    permissions: [],
    users: []
  })

  const handleInputChange = e => {
    const { name, value } = e.target

    setNewGroup(prev => ({ ...prev, [name]: value }))
  }

  const handlePermissionsChange = selectedPermissions => {
    setNewGroup(prev => ({ ...prev, permissions: selectedPermissions }))
  }

  const handleUsersChange = (event, value) => {
    setNewGroup(prev => ({ ...prev, users: value.map(user => user.id) }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Trim the name before submitting
    const trimmedData = {
      ...newGroup,
      name: newGroup.name.trim()
    }

    await onSubmit(trimmedData)
    handleClose()
  }

  const handleClose = () => {
    setNewGroup({ name: '', permissions: [], users: [] })
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
      <DialogTitle sx={{ fontWeight: 700, fontSize: 22, pb: 1, bgcolor: 'background.default' }}>
        {t('groups.addGroupTitle')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Group Name */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('groups.groupName')}
              </Typography>
              <CustomTextField
                fullWidth
                label={t('groups.groupName')}
                name='name'
                value={newGroup.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Paper>

            {/* Users Selection */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('groups.users')}
              </Typography>
              {usersLoading ? (
                <LoadingState />
              ) : (
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={option => option.username || option.email || String(option.id)}
                  value={users.filter(u => newGroup.users.includes(u.id))}
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
            </Paper>

            {/* Permissions Selection */}
            <Paper
              elevation={2}
              sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 2 }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                {t('groups.permissions')}
              </Typography>
              {permissionsLoading ? (
                <LoadingState />
              ) : permissions.length > 0 ? (
                <PermissionTreeView
                  permissions={permissions}
                  selected={newGroup.permissions}
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
          sx={{ px: 4, pb: 3, pt: 0, justifyContent: 'space-between', gap: 2, bgcolor: 'background.default' }}
        >
          <Button onClick={handleClose} variant='outlined' color='error' sx={{ minWidth: 120 }} disabled={isLoading}>
            {t('groups.cancel')}
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            sx={{ minWidth: 140, fontWeight: 600 }}
            disabled={isLoading || !newGroup.name.trim()}
          >
            {isLoading ? t('common.loading') : t('groups.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default GroupsAdd
