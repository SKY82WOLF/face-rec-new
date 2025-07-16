'use client'

import { useState } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'

const GroupsAdd = ({ open, onClose, onSubmit, isLoading = false }) => {
  const { t } = useTranslation()

  const [newGroup, setNewGroup] = useState({
    name: ''
  })

  const handleInputChange = e => {
    const { name, value } = e.target

    setNewGroup(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    await onSubmit(newGroup)
    handleClose()
  }

  const handleClose = () => {
    setNewGroup({ name: '' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{t('groups.addGroupTitle')}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 0 }}>
            <CustomTextField
              fullWidth
              label={t('groups.groupName')}
              name='name'
              value={newGroup.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} disabled={isLoading}>
            {t('groups.cancel')}
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading || !newGroup.name.trim()}>
            {isLoading ? t('common.loading') : t('groups.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default GroupsAdd
