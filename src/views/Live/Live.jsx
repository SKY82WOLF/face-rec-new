'use client'

import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { Typography, Box, Grid, Card } from '@mui/material'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import LiveReportCard from './LiveReportCard'
import { getLiveWebSocketUrl } from '@/configs/routes'
import { commonStyles } from '@/@core/styles/commonStyles'
import EmptyState from '@/components/ui/EmptyState'

const LiveContent = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { reports, isConnected, error } = useSelector(state => state.websocket)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    // Connect to WebSocket when component mounts
    dispatch({ type: 'websocket/connect' })

    // Disconnect when component unmounts
    return () => {
      dispatch({ type: 'websocket/disconnect' })
    }
  }, [dispatch])

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  return (
    <Box>
      <SEO
        title='داشبورد | سیستم تشخیص چهره دیانا'
        description='داشبورد اصلی سیستم تشخیص چهره دیانا'
        keywords='داشبورد, صفحه اصلی, تشخیص چهره دیانا'
      />

      {/* Live Stream Section */}
      <Card sx={{ mb: 4, p: 4, pt: 2 }}>
        <Box>
          <Typography textAlign={'center'} variant='h5' gutterBottom sx={commonStyles.centeredTitle}>
            {t('live.title')}
          </Typography>
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
              src={isPlaying ? '/images/stop-video.png' : getLiveWebSocketUrl()}
              alt='Live Stream Placeholder'
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

      {/* Reports Section */}
      <Card sx={{ p: 4, pt: 2 }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <Typography textAlign={'center'} variant='h5' sx={{ ...commonStyles.centeredTitle, width: '100%' }}>
              {t('live.reports')}
            </Typography>
            {/* {error && (
              <Typography color='error' variant='body2'>
                {error}
              </Typography>
            )} */}
          </Box>
          <Box
            sx={{
              padding: '5px',
              maxHeight: 'calc(100vh - 250px)',
              overflowY: 'auto',
              ...commonStyles.customScrollbar
            }}
          >
            <Grid container spacing={2}>
              {reports.length > 0 ? (
                reports.map(report => (
                  <Grid sx={{ display: 'flex', flexGrow: 1 }} item xs={12} sm={6} md={4} key={`report_${report.index}`}>
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
                        person_id:report.person_id,
                        image_quality: report.image_quality,
                        date: report.date
                      }}
                      allReports={reports}
                    />
                  </Grid>
                ))
              ) : (
                <Grid justifyContent={'center'} item xs={12}>
                  <EmptyState message={t('live.noReports')} minHeight={120} />
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

export default function Live() {
  return <LiveContent />
}
