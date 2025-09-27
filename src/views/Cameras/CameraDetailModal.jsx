import { useEffect, useState } from 'react'

import {
  Fade,
  Backdrop,
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import VideocamIcon from '@mui/icons-material/Videocam'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'
import { testCamera } from '@/api/cameras'
import { selectCameraDirectionTypes } from '@/store/slices/typesSlice'
import CropperImage from '@/components/ui/CropperImage'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import AnimatedModal from '@/components/AnimatedModal'

const modalStyle = {
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 600
}

const CameraDetailModal = ({ open, onClose, camera }) => {
  const { t } = useTranslation()
  const cameraDirectionTypes = useSelector(selectCameraDirectionTypes)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [testError, setTestError] = useState('')

  // Reset preview state when switching cameras or closing
  useEffect(() => {
    if (!open || !camera) {
      setTestResult(null)
      setTestError('')
    }
  }, [open, camera])

  if (!camera) return null

  const getActiveChip = isActive => {
    const label = isActive ? t('cameras.statusOptions.active') : t('cameras.statusOptions.inactive')
    const color = isActive ? 'success' : 'error'

    return <Chip size='small' label={label} color={color} variant='outlined' />
  }

  const getDirectionName = directionId => {
    const direction = cameraDirectionTypes.data.find(d => d.id === directionId)

    return direction ? direction.translate || direction.title : t('cameras.unknownDirection')
  }

  return (
    <AnimatedModal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
      sx={{
        '&:focus': {
          outline: 'none'
        }
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VideocamIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant='h5' component='h2'>
                {t('cameras.cameraDetail')}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size='small'>
              <CloseIcon />
            </IconButton>
          </Box>

          <TableContainer component={Paper} variant='outlined'>
            <Table size='small'>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.name')}</TableCell>
                  <TableCell>{camera.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.camUrl')}</TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary' sx={{ direction: 'ltr' }}>
                      {camera.cam_url}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.id')}</TableCell>
                  <TableCell>{camera.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.isActive')}</TableCell>
                  <TableCell>{getActiveChip(!!camera.is_active)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.direction')}</TableCell>
                  <TableCell>{getDirectionName(camera.direction_id)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.createdAt')}</TableCell>
                  <TableCell>
                    <ShamsiDateTime dateTime={camera.created_at} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.updatedAt')}</TableCell>
                  <TableCell>
                    <ShamsiDateTime dateTime={camera.updated_at} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant='subtitle1'>{t('cameras.preview')}</Typography>
            <Button
              size='small'
              onClick={async () => {
                try {
                  setTesting(true)
                  setTestError('')
                  const response = await testCamera({ camera_url: camera.cam_url })

                  if (response?.success) {
                    setTestResult(response.results)
                  } else {
                    setTestError(response?.message || t('cameras.testFailed'))
                    setTestResult(null)
                  }
                } catch (err) {
                  setTestError(err?.message || t('cameras.testFailed'))
                  setTestResult(null)
                } finally {
                  setTesting(false)
                }
              }}
              variant='contained'
              disabled={testing}
              startIcon={testing ? <CircularProgress size={20} /> : null}
            >
              {testing ? t('cameras.testing') : t('cameras.testCamera')}
            </Button>
          </Box>

          {testError && (
            <Typography color='error.main' variant='caption' sx={{ mt: 1, display: 'block' }}>
              {testError}
            </Typography>
          )}

          {testResult && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  border: theme => `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  <CropperImage
                    imageUrl={`data:image/jpeg;base64,${testResult.frame}`}
                    area={camera?.area}
                    onAreaChange={() => {}} // No-op function to make it read-only
                  />
                </div>
              </Box>
              <Box sx={{ mt: 1.5 }}>
                <Typography variant='body2'>
                  {t('cameras.codec')}: {testResult.codec}
                </Typography>
                <Typography variant='body2'>
                  {t('cameras.fps')}: {testResult.fps}
                </Typography>
                <Typography variant='body2'>
                  {t('cameras.resolution')}:{' '}
                  <Box component='span' sx={{ direction: 'ltr', unicodeBidi: 'isolate' }}>
                    {(() => {
                      const toLatinDigits = str =>
                        (str || '')
                          .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06f0))
                          .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))

                      const cleaned = toLatinDigits(testResult.resolution || '').replace(/\s+/g, '')
                      const parts = cleaned.split(/[x×]/i).filter(Boolean)

                      if (parts.length >= 2) {
                        return `${parts[0]} × ${parts[1]}`
                      }

                      return cleaned
                    })()}
                  </Box>
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={onClose} variant='contained'>
              {t('common.close')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </AnimatedModal>
  )
}

export default CameraDetailModal
