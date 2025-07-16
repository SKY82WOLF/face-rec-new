'use client'

import { useState, useEffect } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'

const GroupsUpdate = ({ open, onClose, onSubmit, group, isLoading = false }) => {
  const { t } = useTranslation()

  const [editGroup, setEditGroup] = useState({
    name: ''
  })

  useEffect(() => {
    if (group) {
      setEditGroup({ name: group.name })
    }
  }, [group])

  const handleInputChange = e => {
    const { name, value } = e.target

    setEditGroup(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    await onSubmit({ id: group.id, data: editGroup })
    handleClose()
  }

  const handleClose = () => {
    setEditGroup({ name: '' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>{t('groups.editGroupTitle')}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={commonStyles.modalContainer}>
            <CustomTextField
              fullWidth
              label={t('groups.groupName')}
              name='name'
              value={editGroup.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            {t('groups.cancel')}
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading || !editGroup.name.trim()}>
            {isLoading ? t('common.loading') : t('groups.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default GroupsUpdate
