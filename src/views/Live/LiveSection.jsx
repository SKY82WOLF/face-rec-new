import React, { useState } from 'react'

import { Box, Card, Typography, Grid } from '@mui/material'

import LiveReportCard from './LiveReportCard'
import EmptyState from '@/components/ui/EmptyState'
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
              <Grid container spacing={2}>
                {cameraReports.length > 0 ? (
                  cameraReports.map(report => (
                    <Grid
                      sx={{ display: 'flex', flexGrow: 1 }}
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={`report_${report.index}`}
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
                  ))
                ) : (
                  <Grid sx={{ display: 'flex', justifyContent: 'center' }} item xs={12}>
                    <EmptyState message={t('live.noReports')} minHeight={120} />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        </Card>
      </Card>
    </Box>
  )
}

export default LiveSection
