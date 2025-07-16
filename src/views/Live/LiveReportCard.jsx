import { useState, useRef } from 'react'

import { Card, Box, Typography, Button, Avatar, Divider, IconButton } from '@mui/material'
import { styled } from '@mui/system'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import Info from '@mui/icons-material/Info'

import { useTranslation } from '@/translations/useTranslation'
import { useAddPerson } from '@/hooks/usePersons'
import { useSettings } from '@core/hooks/useSettings'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import AddModal from './LiveAddModal'
import LiveDetailModal from './LiveDetailModal'
import { commonStyles } from '@/@core/styles/commonStyles'

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
  const [isAllowed, setIsAllowed] = useState(reportData.access)
  const [modalData, setModalData] = useState(reportData)
  const addPersonMutation = useAddPerson()

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

  const setReportDataByIndex = index => {
    const data = allReports[index]

    setCurrentIndex(index)
    setModalData({
      id: data.id || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      national_code: data.national_code || '',
      gender: data.gender ?? '',
      access: data.access || false,
      profile_image: data.profile_image || null,
      last_image: data.last_image || null,
      index: data.index,
      feature_vector: data.feature_vector,
      report_id: data.report_id,
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

  const handleSubmit = async formData => {
    try {
      await addPersonMutation.mutateAsync(formData)
      handleAddClose()
      handleEditClose()
    } catch (error) {
      console.error('Failed to add/edit person:', error)
    }
  }

  const handleNavigate = direction => {
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < allReports.length) {
      setReportDataByIndex(newIndex)
    }
  }

  const displayImage = reportData.last_image || reportData.profile_image || '/images/avatars/1.png'

  return (
    <>
      <StyledReportCard mode={currentMode}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            variant='rounded'
            src={displayImage}
            alt={reportData.first_name}
            sx={{ width: 60, height: 60, mr: 2 }}
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
              {reportData.gender === false ? (
                <>
                  {t('reportCard.male')}
                  <i className='tabler-gender-male' style={{ color: 'rgb(0, 83, 255)' }} />
                </>
              ) : reportData.gender === true ? (
                <>
                  {t('reportCard.female')}
                  <i className='tabler-gender-female' style={{ color: '#ff1dc8' }} />
                </>
              ) : (
                t('reportCard.unknown')
              )}
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
            {isAllowed ? t('reportCard.allowed') : t('reportCard.notAllowed')}
            {isAllowed ? <LockOpenIcon sx={{ fontSize: 16, ml: 0.5 }} /> : <LockIcon sx={{ fontSize: 16, ml: 0.5 }} />}
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            {t('reportCard.id')}: {reportData.id || t('reportCard.unknown')}
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
        onAddPerson={handleAddOpen}
        onEditPerson={handleEditOpen}
        mode={currentMode}
      />

      {/* Add Modal */}
      <AddModal
        open={addOpen}
        onClose={handleAddClose}
        onSubmit={handleSubmit}
        initialData={{
          id: modalData.id,
          first_name: modalData.first_name || '',
          last_name: modalData.last_name || '',
          national_code: modalData.national_code || '',
          gender: modalData.gender ?? '',
          access: modalData.access || false,
          profile_image: modalData.profile_image || null,
          feature_vector: modalData.feature_vector,
          report_id: modalData.report_id,
          image_quality: modalData.image_quality
        }}
        mode={currentMode}
      />

      {/* Edit Modal */}
      {/* <EditModal
          open={editOpen}
          onClose={handleEditClose}
          onSubmit={handleSubmit}
          initialData={{
            id: modalData.id,
            first_name: modalData.first_name || '',
            last_name: modalData.last_name || '',
            national_code: modalData.national_code || '',
            gender: modalData.gender ?? '',
            access: modalData.access || false,
            profile_image: modalData.profile_image || null,
            feature_vector: modalData.feature_vector,
            report_id: modalData.report_id
          }}
          mode={currentMode}
        /> */}
    </>
  )
}

export default LiveReportCard
