'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Alert } from '@mui/material'

import WarningIcon from '@mui/icons-material/Warning'

import { useTranslation } from '@/translations/useTranslation'

const GroupDeleteModal = ({ open, onClose, onConfirm, group, isLoading = false }) => {
  const { t } = useTranslation()

  if (!group) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>{t('groups.deleteConfirmation')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity='warning' icon={<WarningIcon />} sx={{ mb: 2 }}>
            {t('groups.confirmDeleteMessage', { name: group.name })}
          </Alert>

          <Typography variant='body1' sx={{ mb: 2 }}>
            {t('groups.deleteWarning')}
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
              {t('groups.groupToDelete')}:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant='body2' color='text.secondary'>
                  {t('groups.groupName')}:
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {group.name}
                </Typography>
              </Box>

              {group.id && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('groups.id')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {group.id}
                  </Typography>
                </Box>
              )}

              {group.permissions && group.permissions.length > 0 && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('groups.assignedPermissions')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {group.permissions.length} {t('groups.permissions')}
                  </Typography>
                </Box>
              )}

              {group.users && group.users.length > 0 && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('groups.users')}:
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {group.users.length} {t('groups.users')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t('groups.cancel')}
        </Button>
        <Button onClick={onConfirm} variant='contained' color='error' disabled={isLoading}>
          {isLoading ? t('common.loading') : t('groups.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GroupDeleteModal
