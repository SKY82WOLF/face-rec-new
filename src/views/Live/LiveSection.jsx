import React, { useState } from 'react'

import { Box, Card, Typography, Grid } from '@mui/material'

import LiveReportCard from './LiveReportCard'
import ViewModeToggle from './ViewModeToggle'
import LiveGridCard from './LiveGridCard'
import LiveListView from './LiveListView'
import LiveDetailModal from './LiveDetailModal'
import AddModal from './LiveAddModal'
import LiveEditModal from './LiveEditModal'
import EmptyState from '@/components/ui/EmptyState'
import { useAddPerson, useUpdatePerson } from '@/hooks/usePersons'
import { commonStyles } from '@/@core/styles/commonStyles'
import { getLiveWebSocketUrl } from '@/configs/routes'
import { useTranslation } from '@/translations/useTranslation'

const LiveSection = ({ camera, reports = [] }) => {
  const { t } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(true)

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  const cameraReports = reports.filter(r => String(r.camera_id) === String(camera.id))
  const [viewMode, setViewMode] = useState('list')

  // Modal & navigation state for grid view
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [modalData, setModalData] = useState({})
  const [personModalType, setPersonModalType] = useState(null) // 'add' | 'edit' | null
  const addPersonMutation = useAddPerson()
  const updatePersonMutation = useUpdatePerson()

  const isUnknownAccess = accessId => {
    return accessId === 7 || accessId === 'unknown' || !accessId
  }

  const setReportDataByIndex = index => {
    const data = cameraReports[index]

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
      date: data.date,
      id: data.id
    })
  }

  const handleOpen = index => {
    if (typeof index === 'number' && index >= 0 && index < cameraReports.length) {
      setReportDataByIndex(index)
    } else {
      setCurrentIndex(0)
      setReportDataByIndex(0)
    }

    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handlePersonModalOpen = () => {
    const accessId = modalData.access_id?.id || modalData.access_id

    if (isUnknownAccess(accessId)) {
      setPersonModalType('add')
    } else {
      setPersonModalType('edit')
    }

    setOpen(false)
  }

  const handlePersonModalClose = () => setPersonModalType(null)

  const handleNavigate = direction => {
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < cameraReports.length) {
      setReportDataByIndex(newIndex)
    }
  }

  const handleAddSubmit = async formData => {
    try {
      await addPersonMutation.mutateAsync(formData)
    } catch (error) {
      console.error('Failed to add person:', error)
    }
  }

  const handleEditSubmit = async formData => {
    try {
      await updatePersonMutation.mutateAsync({ id: modalData.person_id, data: formData })
    } catch (error) {
      console.error('Failed to update person:', error)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Card>
        <Card sx={{ mb: 4, p: 4, pt: 2, flex: '0 0 auto', boxShadow: 'none' }}>
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
              <Typography textAlign={'center'} variant='h6' gutterBottom sx={commonStyles.centeredTitle}>
                {camera.name}
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                backgroundColor: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 1
              }}
            >
              <img
                src={isPlaying ? '/images/stop-video.png' : `${getLiveWebSocketUrl()}${camera.id}`}
                alt={`Live Stream - ${camera.name}`}
                onClick={handleTogglePlay}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 'inherit',
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Box>
        </Card>

        <Card sx={{ p: 4, pt: 2, flex: '1 1 auto', display: 'flex', flexDirection: 'column', boxShadow: 'none' }}>
          <Box sx={{ p: 2, flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <Typography textAlign={'center'} variant='h6' sx={{ ...commonStyles.centeredTitle, width: '100%' }}>
                {t('live.reports')}
              </Typography>
            </Box>

            <Box
              sx={{
                padding: '5px',
                overflowY: 'auto',
                ...commonStyles.customScrollbar,
                flex: '1 1 auto',
                minHeight: 0
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <ViewModeToggle value={viewMode} onChange={setViewMode} />
              </Box>

              {cameraReports.length === 0 ? (
                <EmptyState message={t('live.noReports')} minHeight={120} />
              ) : viewMode === 'report' ? (
                <Grid container spacing={2}>
                  {cameraReports.map((report, idx) => (
                    <Grid
                      sx={{ display: 'flex', flexGrow: 1 }}
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={`report_${report.id ?? report.index ?? idx}`}
                    >
                      <LiveReportCard
                        reportData={{
                          id: report.id,
                          first_name: report.first_name,
                          last_name: report.last_name,
                          national_code: report.national_code,
                          access_id: report.access_id,
                          gender_id: report.gender_id,
                          person_image: report.person_image,
                          last_person_image: report.last_person_image,
                          feature_vector: report.feature_vector,
                          index: report.index,
                          last_person_report_id: report.last_person_report_id,
                          person_id: report.person_id,
                          image_quality: report.image_quality,
                          date: report.date
                        }}
                        allReports={cameraReports}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : viewMode === 'grid' ? (
                <Grid container spacing={2}>
                  {cameraReports.map((report, idx) => (
                    <Grid
                      sx={{ display: 'flex', flexGrow: 1, minWidth: '240px', maxWidth: '280px' }}
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={`grid_${report.id ?? report.index ?? idx}`}
                    >
                      <LiveGridCard
                        reportData={report}
                        index={idx}
                        allReports={cameraReports}
                        onOpenDetail={i => handleOpen(i)}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <LiveListView
                  reports={cameraReports}
                  onOpenDetail={id => {
                    /* not wired */
                  }}
                />
              )}
            </Box>
          </Box>
        </Card>
      </Card>
      {/* Details & Add/Edit modals for grid view */}
      <LiveDetailModal
        open={open}
        onClose={handleClose}
        modalData={modalData}
        currentIndex={currentIndex}
        allReports={cameraReports}
        onNavigate={handleNavigate}
        onPersonModalOpen={type => setPersonModalType(type)}
        mode={''}
      />

      <AddModal
        open={personModalType === 'add'}
        onClose={handlePersonModalClose}
        onSubmit={handleAddSubmit}
        initialData={modalData}
        mode={''}
      />

      <LiveEditModal
        open={personModalType === 'edit'}
        onClose={handlePersonModalClose}
        onSubmit={handleEditSubmit}
        initialData={modalData}
        mode={''}
      />
    </Box>
  )
}

export default LiveSection
