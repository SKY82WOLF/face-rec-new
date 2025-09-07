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
import { backendImgUrl } from '@/configs/routes'
import ImageCarousel from '@/components/ImageCarousel'

// import FullScreenImageModal from '@/components/FullScreenImageModal'

const StyledReportCard = styled(Card)(({ theme, mode }) => ({
  ...commonStyles.transparentCard,
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  marginBottom: theme.spacing(2),

  // Keep the card shape but limit width so it doesn't stretch across the row
  width: '100%',
  maxWidth: 440,
  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.12)'}`,
  boxShadow: mode === 'dark' ? '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)' : theme.shadows[1],
  transition: 'all 0.2s ease-in-out',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  height: '100%',
  boxSizing: 'border-box',
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

  // const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null)

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

  // Prepare images for carousel
  const images = []

  // Add person image if available
  if (reportData.person_image) {
    images.push(backendImgUrl + reportData.person_image)
  }

  // Add last person image if available and different from person image
  if (reportData.last_person_image) {
    const lastPersonImageUrl = backendImgUrl + reportData.last_person_image

    if (!images.includes(lastPersonImageUrl)) {
      images.push(lastPersonImageUrl)
    }
  }

  // If no images found, use fallback
  if (images.length === 0) {
    images.push('/images/avatars/1.png')
  }

  return (
    <>
      <StyledReportCard
        mode={currentMode}
        onClick={handleOpen}
        sx={{
          cursor: 'pointer',
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Image carousel */}
        <ImageCarousel
          images={images}
          aspectRatio={{ xs: '3 / 2', sm: '16 / 9' }}
          objectFit='cover'
          objectPosition='center'
          transitionDuration={2000}
          alt={`${reportData.first_name || ''} ${reportData.last_name || ''}`}
          sx={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0
          }}
        />

        {/* Divider between image and details */}
        <Divider sx={{ borderColor: 'divider' }} />

        {/* Details section beneath image - compact, centered, responsive */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1 1 auto',
            minHeight: { xs: 56, sm: 72 }
          }}
        >
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography
              variant='h6'
              align='center'
              sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {`${reportData.first_name || ''} ${reportData.last_name || ''}`}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 0.5,
                justifyContent: 'space-between',
                width: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                {(() => {
                  if (genderTypes.loading) {
                    return (
                      <>
                        <Typography variant='body2' color='textSecondary'>
                          {t('reportCard.loading')}
                        </Typography>
                      </>
                    )
                  }

                  const genderId = reportData.gender_id?.id || reportData.gender_id
                  let icon = null

                  if (genderId === 2) {
                    icon = <i className='tabler tabler-gender-male' style={{ fontSize: 18, color: '#1976d2' }} />
                  } else if (genderId === 3) {
                    icon = <i className='tabler tabler-gender-female' style={{ fontSize: 18, color: '#d81b60' }} />
                  }

                  return (
                    <>
                      {icon}
                      <Typography variant='body2' color='textSecondary'>
                        {genderId && genderTypes?.data ? getTypeTitle(genderTypes, genderId) : t('reportCard.unknown')}
                      </Typography>
                    </>
                  )
                })()}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Typography
                  variant='body2'
                  color={isAllowed ? 'success.main' : 'error.main'}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
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
                </Typography>
                {isAllowed ? (
                  <LockOpenIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <LockIcon sx={{ fontSize: 16, color: 'error.main' }} />
                )}
              </Box>
            </Box>

            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Button
                sx={{ width: '100%' }}
                variant='outlined'
                onClick={e => {
                  e.stopPropagation()
                  handleOpen()
                }}
                startIcon={<Info />}
              >
                {t('reportCard.details')}
              </Button>
            </Box>
          </Box>
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
      {/* <FullScreenImageModal
        open={!!fullScreenImageUrl}
        imageUrl={fullScreenImageUrl}
        onClose={() => setFullScreenImageUrl(null)}
      /> */}
    </>
  )
}

export default AccessReportCard
