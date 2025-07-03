'use client'

import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { Typography, Box, Grid, Card } from '@mui/material'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import LiveReportCard from '@/components/LiveReportCard'
import { getLiveWebSocketUrl } from '@/configs/routes'

const LivePage = () => {
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
          <Typography
            textAlign={'center'}
            variant='h5'
            gutterBottom
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              position: 'relative',
              marginBottom: '1rem',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '3px',
                backgroundColor: 'primary.main',
                borderRadius: '5px',
                marginBottom: '0.4rem'
              }
            }}
          >
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
      <Card sx={{p:4 , pt: 2 }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <Typography
              textAlign={'center'}
              variant='h5'
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '70px',
                  height: '3px',
                  backgroundColor: 'primary.main',
                  borderRadius: '5px',
                  marginBottom: '5px'
                }
              }}
            >
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
              padding:"5px",
              maxHeight: 'calc(100vh - 250px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(0,0,0,0.3)'
                }
              }
            }}
          >
            <Grid container spacing={2}>
              {reports.length > 0 ? (
                reports.map(report => (
                  <Grid sx={{ display: 'flex', flexGrow: 1}} item xs={12} sm={6} md={4} key={`report_${report.index}`}>
                    <LiveReportCard
                      reportData={{
                        id: report.id,
                        first_name: report.first_name,
                        last_name: report.last_name,
                        national_code: report.national_code,
                        access: report.access,
                        gender: report.gender,
                        profile_image:report.profile_image,
                        last_image: report.last_image,
                        feature_vector:report.feature_vector,
                        index: report.index,
                        report_id:report.report_id,
                        image_quality: report.image_quality,
                        date: report.date
                      }}
                      allReports={reports}
                    />
                  </Grid>
                ))
              ) : (
                <Typography>{t('live.noReports')}</Typography>
              )}
            </Grid>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

export default LivePage
