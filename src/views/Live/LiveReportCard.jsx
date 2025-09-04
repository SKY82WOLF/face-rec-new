import { useState, useRef } from 'react'

import { Card, Box, Typography, Button, Avatar, Divider, IconButton } from '@mui/material'
import { styled } from '@mui/system'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import Info from '@mui/icons-material/Info'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { useAddPerson, useUpdatePerson } from '@/hooks/usePersons'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import { useSettings } from '@core/hooks/useSettings'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import AddModal from './LiveAddModal'
import LiveEditModal from './LiveEditModal'
import LiveDetailModal from './LiveDetailModal'
import { commonStyles } from '@/@core/styles/commonStyles'
import FullScreenImageModal from '@/components/FullScreenImageModal'

const StyledReportCard = styled(Card)(({ theme, mode }) => ({
  ...commonStyles.transparentCard,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexGrow: 1,
  border: `2px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.12)'}`,
  boxShadow: mode === 'dark' ? '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)' : theme.shadows[1],
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow:
      mode === 'dark' ? '0px 6px 12px rgba(36, 18, 18, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.3)' : theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}))

const LiveReportCard = ({ reportData, allReports }) => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [modalData, setModalData] = useState(reportData)
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null)
  const addPersonMutation = useAddPerson()
  const updatePersonMutation = useUpdatePerson()
  const [personModalType, setPersonModalType] = useState(null) // 'add' | 'edit' | null

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)

  // Helper function to get type title by ID
  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  const getCurrentMode = () => {
    if (settings?.mode === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }

      return 'light'
    }

    return settings?.mode || 'light'
  }

  const currentMode = getCurrentMode()

  // Helper to determine if access is allowed (access_id === 5 means allowed)
  const isAccessAllowed = accessId => {
    const id = accessId?.id || accessId

    return id === 5
  }

  const setReportDataByIndex = index => {
    const data = allReports[index]

    setCurrentIndex(index)
    setModalData({
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      national_code: data.national_code || '',
      gender_id: data.gender_id || '',
      access_id: data.access_id || '',
      person_image: data.person_image || null,
      last_person_image: data.last_person_image || null,
      person_id: data.person_id || '',
      index: data.index,
      feature_vector: data.feature_vector,
      last_person_report_id: data.last_person_report_id,
      date: data.date
    })
  }

  const handleOpen = () => {
    const index = allReports.findIndex(r => r.index === reportData.index)

    if (index >= 0) {
      setCurrentIndex(index)
      setReportDataByIndex(index)
    } else {
      setCurrentIndex(0)
      setReportDataByIndex(0)
    }

    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleAddOpen = () => {
    setAddOpen(true)
    setOpen(false)
  }

  const handleEditOpen = () => {
    setEditOpen(true)
    setOpen(false)
  }

  const handleAddClose = () => setAddOpen(false)

  const handleEditClose = () => setEditOpen(false)

  const handleAddSubmit = async formData => {
    try {
      await addPersonMutation.mutateAsync(formData)

      // child modal will close itself on success
    } catch (error) {
      console.error('Failed to add person:', error)
    }
  }

  const handleEditSubmit = async formData => {
    try {
      await updatePersonMutation.mutateAsync({ id: modalData.person_id, data: formData })

      // child modal will close itself on success
    } catch (error) {
      console.error('Failed to update person:', error)
    }
  }

  const handleNavigate = direction => {
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < allReports.length) {
      setReportDataByIndex(newIndex)
    }
  }

  const displayImage = reportData.last_person_image || reportData.person_image || '/images/avatars/1.png'

  // Helper to determine if access is unknown
  const isUnknownAccess = accessId => {
    return accessId === 7 || accessId === 'unknown' || !accessId
  }

  // Unified handler for opening the correct modal
  const handlePersonModalOpen = () => {
    const accessId = reportData.access_id?.id || reportData.access_id

    if (isUnknownAccess(accessId)) {
      setPersonModalType('add')
    } else {
      setPersonModalType('edit')
    }

    setOpen(false)
  }

  const handlePersonModalClose = () => setPersonModalType(null)

  // Get access status for current report
  const accessId = reportData.access_id?.id || reportData.access_id
  const isAllowed = isAccessAllowed(accessId)

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
            <Typography variant='body1' color='textSecondary'>
              <ShamsiDateTime dateTime={modalData.date} format='time' />
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' color='textSecondary' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {genderTypes.loading
                ? t('reportCard.loading')
                : (() => {
                    const genderId = reportData.gender_id?.id || reportData.gender_id

                    if (genderId && genderTypes?.data) {
                      return <>{getTypeTitle(genderTypes, genderId)}</>
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
          <Typography variant='body2' color='textSecondary'>
            {t('reportCard.id')}: {reportData.person_id || t('reportCard.unknown')}
          </Typography>
          <Button variant='outlined' size='small' onClick={handleOpen} startIcon={<Info />}>
            {t('reportCard.details')}
          </Button>
        </Box>
      </StyledReportCard>

      {/* Details Modal */}
      <LiveDetailModal
        open={open}
        onClose={handleClose}
        modalData={modalData}
        currentIndex={currentIndex}
        allReports={allReports}
        onNavigate={handleNavigate}
        onPersonModalOpen={handlePersonModalOpen}
        mode={currentMode}
      />

      {/* Add Modal */}
      <AddModal
        open={personModalType === 'add'}
        onClose={handlePersonModalClose}
        onSubmit={handleAddSubmit}
        initialData={{
          id: modalData.id,
          first_name: modalData.first_name || '',
          last_name: modalData.last_name || '',
          national_code: modalData.national_code || '',
          gender_id: modalData.gender_id || '',
          access_id: modalData.access_id || '',
          person_image: modalData.person_image || null,
          last_person_image: modalData.last_person_image || null,
          feature_vector: modalData.feature_vector,
          last_person_report_id: modalData.last_person_report_id,
          person_id: modalData.person_id,
          image_quality: modalData.image_quality
        }}
        mode={currentMode}
      />

      {/* Edit Modal */}
      <LiveEditModal
        open={personModalType === 'edit'}
        onClose={handlePersonModalClose}
        onSubmit={handleEditSubmit}
        initialData={{
          id: modalData.id,
          first_name: modalData.first_name || '',
          last_name: modalData.last_name || '',
          national_code: modalData.national_code || '',
          gender_id: modalData.gender_id || '',
          access_id: modalData.access_id || '',
          person_image: modalData.person_image || null,
          last_person_image: modalData.last_person_image || null,
          feature_vector: modalData.feature_vector,
          last_person_report_id: modalData.last_person_report_id,
          image_quality: modalData.image_quality
        }}
        mode={currentMode}
      />
      <FullScreenImageModal
        open={!!fullScreenImageUrl}
        imageUrl={fullScreenImageUrl}
        onClose={() => setFullScreenImageUrl(null)}
      />
    </>
  )
}

export default LiveReportCard
