import { useState } from 'react'

import {
  Card,
  Box,
  Typography,
  Button,
  Avatar,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import { styled } from '@mui/system'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import DeleteIcon from '@mui/icons-material/Delete'
import Info from '@mui/icons-material/Info'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { useDeletePerson } from '@/hooks/usePersons'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import { useSettings } from '@core/hooks/useSettings'

// Import the new modal components
import AccessDetailModal from './AccessDetailModal'
import AccessEditModal from './AccessEditModal'
import { commonStyles } from '@/@core/styles/commonStyles'
import FullScreenImageModal from '@/components/FullScreenImageModal'

const StyledReportCard = styled(Card)(({ theme, mode }) => ({
  ...commonStyles.transparentCard,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexGrow: 1,
  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.12)'}`,
  boxShadow: mode === 'dark' ? '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)' : theme.shadows[1],
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: mode === 'dark' ? '0px 6px 12px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.3)' : theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}))

const AccessReportCard = ({ reportData, allReports }) => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isAllowed, setIsAllowed] = useState(reportData.access_id?.id === 5)
  const [modalData, setModalData] = useState(reportData)
  const [formData, setFormData] = useState({})
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null)

  const deletePersonMutation = useDeletePerson()

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)

  // Helper function to get type title by ID
  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  // Get current mode from settings
  const getCurrentMode = () => {
    if (settings?.mode === 'system') {
      // Check if we're on the client side and get system preference
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }

      return 'light' // fallback for server-side
    }

    return settings?.mode || 'light'
  }

  const currentMode = getCurrentMode()

  const setReportDataByIndex = index => {
    const data = allReports[index]

    setCurrentIndex(index)
    setModalData({
      id: data.id || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      national_code: data.national_code || '',
      gender_id: data.gender_id || '',
      access_id: data.access_id || '',
      person_image: data.person_image || null,
      last_person_image: data.last_person_image || null,
      last_person_report_id: data.last_person_report_id,
      person_id: data.person_id,
      created_at: data.created_at || null,
      index
    })
    setIsAllowed(data.access_id?.id === 5)
  }

  const handleOpen = () => {
    setCurrentIndex(reportData.index)
    setReportDataByIndex(reportData.index)
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleEditOpen = () => {
    // Check if this is an update (person has an ID and access_id is not unknown) or add (no ID or unknown access)
    const accessId = modalData.access_id?.id || modalData.access_id
    const isUnknown = accessId === 7 || accessId === 'unknown' || !accessId

    setFormData({
      ...modalData,
      access: isAllowed, // Ensure access is boolean in formData
      // If unknown access, don't pass the ID to trigger add mode
      id: isUnknown ? undefined : modalData.id
    })
    setEditOpen(true)
    setOpen(false)
  }

  const handleEditClose = () => setEditOpen(false)

  const handleDeleteOpen = () => setDeleteConfirmOpen(true)
  const handleDeleteClose = () => setDeleteConfirmOpen(false)

  const handleDelete = async () => {
    try {
      await deletePersonMutation.mutateAsync(modalData.id)
      handleDeleteClose()
      handleClose()
    } catch (error) {
      console.error('Failed to delete person:', error)
    }
  }

  const handleNavigate = direction => {
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < allReports.length) {
      setReportDataByIndex(newIndex)
    }
  }

  const displayImage = reportData.person_image || reportData.last_person_image || '/images/avatars/1.png'

  return (
    <>
      <StyledReportCard mode={currentMode} onClick={handleOpen} sx={{ cursor: 'pointer' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            variant='rounded'
            src={displayImage}
            alt={reportData.first_name}
            sx={{ width: 60, height: 60, mr: 2, cursor: 'pointer' }}
            onClick={e => {
              e.stopPropagation()
              setFullScreenImageUrl(displayImage)
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' gutterBottom>
              {`${reportData.first_name || ''} ${reportData.last_name || ''}`}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              {t('reportCard.id')}: {reportData.person_id || t('reportCard.unknown')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' color='textSecondary' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {genderTypes.loading
                ? t('reportCard.loading')
                : (() => {
                    const genderId = reportData.gender_id?.id || reportData.gender_id

                    if (genderId && genderTypes?.data) {
                      return <span>{getTypeTitle(genderTypes, genderId)}</span>
                    }

                    return t('reportCard.unknown')
                  })()}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography
            variant='body2'
            color={isAllowed ? 'success.main' : 'error.main'}
            sx={{ display: 'flex', alignItems: 'center', mr: 1 }}
          >
            {accessTypes.loading
              ? t('reportCard.loading')
              : (() => {
                  const accessId = reportData.access_id?.id || reportData.access_id

                  if (accessId && accessTypes?.data) {
                    return getTypeTitle(accessTypes, accessId)
                  }

                  return t('reportCard.unknown')
                })()}
            {isAllowed ? <LockOpenIcon sx={{ fontSize: 16, ml: 0.5 }} /> : <LockIcon sx={{ fontSize: 16, ml: 0.5 }} />}
          </Typography>
          <Button variant='outlined' size='small' onClick={handleOpen} startIcon={<Info />}>
            {t('reportCard.details')}
          </Button>
        </Box>
      </StyledReportCard>

      {/* Details Modal */}
      <AccessDetailModal
        open={open}
        onClose={handleClose}
        modalData={modalData}
        currentIndex={currentIndex}
        allReports={allReports}
        onNavigate={handleNavigate}
        onEditOpen={handleEditOpen}
        onDeleteOpen={handleDeleteOpen}
      />

      {/* Edit/Add Modal */}
      <AccessEditModal
        open={editOpen}
        onClose={handleEditClose}
        formData={formData}
        setFormData={setFormData}
        isAllowed={isAllowed}
        setIsAllowed={setIsAllowed}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteClose} aria-labelledby='delete-confirm-dialog-title'>
        <DialogTitle id='delete-confirm-dialog-title'>{t('access.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('access.confirmDeleteMessage', {
              name: `${modalData.first_name || ''} ${modalData.last_name || ''}`.trim() || t('reportCard.unknown')
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} variant='outlined'>
            {t('reportCard.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color='error'
            variant='contained'
            startIcon={<DeleteIcon />}
            disabled={deletePersonMutation.isLoading}
          >
            {deletePersonMutation.isLoading ? t('access.deleting') : t('access.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <FullScreenImageModal
        open={!!fullScreenImageUrl}
        imageUrl={fullScreenImageUrl}
        onClose={() => setFullScreenImageUrl(null)}
      />
    </>
  )
}

export default AccessReportCard
