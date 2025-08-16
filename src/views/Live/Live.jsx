'use client'

import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { Typography, Box, Card } from '@mui/material'
import TextField from '@mui/material/TextField'

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import LiveSection from './LiveSection'
import { commonStyles } from '@/@core/styles/commonStyles'
import EmptyState from '@/components/ui/EmptyState'
import Autocomplete from '@/@core/components/mui/Autocomplete'
import useCameras from '@/hooks/useCameras'

const LiveContent = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { reports, isConnected, error } = useSelector(state => state.websocket)
  const [selectedCameraIds, setSelectedCameraIds] = useState([])

  // Fetch cameras to populate selector
  const { cameras = [], isLoading: isCamerasLoading } = useCameras({ page: 1, per_page: 100 })

  // Select the first camera by default when cameras load
  useEffect(() => {
    if (cameras.length > 0 && selectedCameraIds.length === 0) {
      setSelectedCameraIds([String(cameras[0].id)])
    }
  }, [cameras, selectedCameraIds.length])

  useEffect(() => {
    // Connect to WebSocket when component mounts
    dispatch({ type: 'websocket/connect' })

    // Disconnect when component unmounts
    return () => {
      dispatch({ type: 'websocket/disconnect' })
    }
  }, [dispatch])

  return (
    <Box display={'flex'} flexDirection={'column'}>
      <SEO
        title='داشبورد | سیستم تشخیص چهره دیانا'
        description='داشبورد اصلی سیستم تشخیص چهره دیانا'
        keywords='داشبورد, صفحه اصلی, تشخیص چهره دیانا'
      />

      {/* Selector Card */}
      <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2, mb: 2 }}>
            {/* Camera Selector (multi-select) */}
            <Autocomplete
              multiple
              size='small'
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'primary.main' }
                },
                '& .MuiAutocomplete-tag': {
                  backgroundColor: 'primary.main',
                  color: '#fff'
                }
              }}
              options={cameras}
              loading={isCamerasLoading}
              value={cameras.filter(cam => selectedCameraIds.includes(String(cam.id)))}
              getOptionLabel={option => option?.name || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, newValues) => {
                const ids = Array.isArray(newValues) ? newValues.map(v => String(v.id)) : []

                setSelectedCameraIds(ids)
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={'انتخاب دوربین‌ها'}
                  placeholder={'انتخاب دوربین‌ها'}
                  InputLabelProps={{ ...params.InputLabelProps, sx: { color: 'primary.main' } }}
                  InputProps={{
                    ...params.InputProps,
                    sx: { color: 'primary.main' }
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </Card>

      {cameras.length === 0 ? (
        <Card sx={{ p: 4, pt: 2 }}>
          <Box sx={{ p: 2 }}>
            <EmptyState
              message={t('live.noCameras') || t('cameras.noData') || 'هیچ دوربینی موجود نیست'}
              minHeight={300}
            />
          </Box>
        </Card>
      ) : selectedCameraIds.length <= 1 ? (
        (() => {
          const cam = cameras.find(c => String(c.id) === String(selectedCameraIds[0]))

          if (!cam) {
            return (
              <Card sx={{ p: 4, pt: 2 }}>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    <Typography textAlign={'center'} variant='h5' sx={{ ...commonStyles.centeredTitle, width: '100%' }}>
                      {t('live.reports')}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )
          }

          return <LiveSection camera={cam} reports={reports} />
        })()
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            flexGrow: 1,
            alignItems: 'stretch',
            minHeight: 0
          }}
        >
          {cameras
            .filter(cam => selectedCameraIds.includes(String(cam.id)))
            .map(cam => (
              <Box
                key={`live_section_${cam.id}`}
                sx={{
                  display: 'flex',
                  width: { xs: '100%', md: '50%' },
                  flexDirection: 'column',
                  flex: { xs: '1 1 100%', md: '1 1 45%' },
                  minHeight: 0,
                  boxSizing: 'border-box',
                  p: 1
                }}
              >
                <LiveSection camera={cam} reports={reports} />
              </Box>
            ))}
        </Box>
      )}
    </Box>
  )
}

export default function Live() {
  return <LiveContent />
}
