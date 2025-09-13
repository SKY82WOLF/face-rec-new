import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

import { Modal, Fade, Backdrop, Box, Typography, Button, Grid, IconButton, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import VideocamIcon from '@mui/icons-material/Videocam'

import { useTranslation } from '@/translations/useTranslation'
import { testCamera } from '@/api/cameras'
import CustomTextField from '@/@core/components/mui/TextField'
import { commonStyles } from '@/@core/styles/commonStyles'
import CropperImage from '@/components/ui/CropperImage'

const modalStyle = {
  ...commonStyles.modalContainer,
  width: '96%',
  maxWidth: 1000
}

const CameraEditModal = ({ open, onClose, onSubmit, camera, isLoading }) => {
  const { t } = useTranslation()

  const [form, setForm] = useState({
    name: '',
    cam_url: ''
  })

  const [errors, setErrors] = useState({})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [testError, setTestError] = useState('')
  const [urlTestedOk, setUrlTestedOk] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const autoTestedRef = useRef(false)
  const [forceDirty, setForceDirty] = useState(false)

  // Update form when camera data changes
  useEffect(() => {
    if (camera) {
      setForm({
        name: camera.name || '',
        cam_url: camera.cam_url || ''
      })
      setTestResult(null)
      setTestError('')
      setUrlTestedOk(false)
      setForceDirty(false)

      // preload area from camera if available
      const cameraArea = camera.area || camera.bounding_box || null

      if (cameraArea && typeof cameraArea.x === 'number') {
        setSelectedArea({
          x: Math.round(cameraArea.x),
          y: Math.round(cameraArea.y),
          width: Math.round(cameraArea.width),
          height: Math.round(cameraArea.height)
        })
      } else {
        setSelectedArea(null)
      }
    }
  }, [camera])

  const handleChange = e => {
    const { name, value } = e.target

    setForm(prev => ({ ...prev, [name]: value }))

    if (name === 'cam_url') {
      // mark URL as untested when user edits it
      setUrlTestedOk(false)
      setTestResult(null)
      setTestError('')
      setForceDirty(true)
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = t('cameras.nameRequired')
    }

    if (!form.cam_url.trim()) {
      newErrors.cam_url = t('cameras.camUrlRequired')
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const testUrlDirect = useCallback(
    async url => {
      setTestError('')

      if (!url || !url.trim()) {
        setErrors(prev => ({ ...prev, cam_url: t('cameras.camUrlRequired') }))

        return
      }

      try {
        setTesting(true)
        const response = await testCamera({ camera_url: url })

        if (response?.success) {
          setTestResult(response.results)
          setUrlTestedOk(true)
          setForceDirty(false)
        } else {
          setTestError(response?.message || t('cameras.testFailed'))
          setTestResult(null)
          setUrlTestedOk(false)
          setForceDirty(true)
        }
      } catch (err) {
        setTestError(err?.message || t('cameras.testFailed'))
        setTestResult(null)
        setUrlTestedOk(false)
        setForceDirty(true)
      } finally {
        setTesting(false)
      }
    },
    [t]
  )

  const testCurrentUrl = useCallback(async () => {
    await testUrlDirect(form.cam_url)
  }, [form.cam_url, testUrlDirect])

  const handleTest = async e => {
    e.preventDefault()
    await testCurrentUrl()
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Always test before submit
      setTesting(true)
      setTestError('')
      const response = await testCamera({ camera_url: form.cam_url })

      if (!response?.success) {
        setTestError(response?.message || t('cameras.testFailed'))

        return
      }
    } catch (err) {
      setTestError(err?.message || t('cameras.testFailed'))

      return
    } finally {
      setTesting(false)
    }

    onSubmit({ id: camera.id, data: { cam_url: form.cam_url, name: form.name, area: selectedArea } })
  }

  const handleClose = () => {
    setErrors({})
    setTesting(false)
    setTestResult(null)
    setTestError('')
    setUrlTestedOk(false)
    setForceDirty(false)
    autoTestedRef.current = false
    onClose()
  }

  const isUrlDirty = useMemo(() => camera && form.cam_url !== (camera.cam_url || ''), [camera, form.cam_url])

  // Auto-test on open for the selected camera URL, once per open
  useEffect(() => {
    if (open && camera?.cam_url && !autoTestedRef.current) {
      autoTestedRef.current = true
      testUrlDirect(camera.cam_url)
    }

    if (!open) {
      autoTestedRef.current = false
    }
  }, [open, camera?.id, camera?.cam_url, testUrlDirect])

  if (!camera) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VideocamIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant='h5' component='h2'>
                {t('cameras.editCamera')}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size='small'>
              <CloseIcon />
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid flexDirection='column' container spacing={3}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('cameras.camUrl')}
                  name='cam_url'
                  value={form.cam_url}
                  onChange={handleChange}
                  error={!!errors.cam_url}
                  helperText={errors.cam_url}
                  required
                />
                {isUrlDirty && !urlTestedOk && (
                  <Typography variant='caption' color='warning.main' sx={{ mt: 1, display: 'block' }}>
                    {t('cameras.changeUrlToRetest')}
                  </Typography>
                )}
                {testError && (
                  <Typography color='error.main' variant='caption' sx={{ mt: 1, display: 'block' }}>
                    {testError}
                  </Typography>
                )}
              </Grid>

              {urlTestedOk && (
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label={t('cameras.name')}
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
              )}
              {testing && !urlTestedOk && !isUrlDirty && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
                    <CircularProgress size={28} sx={{ mr: 2 }} />
                    <Typography variant='body2'>{t('cameras.testing')}</Typography>
                  </Box>
                </Grid>
              )}
              {testResult && (
                <>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' sx={{ mb: 1 }}>
                      {t('cameras.preview')}
                    </Typography>
                    <CropperImage
                      imageUrl={`data:image/jpeg;base64,${testResult.frame}`}
                      area={selectedArea}
                      onAreaChange={setSelectedArea}
                    />
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
                  </Grid>
                </>
              )}
              {(isUrlDirty || forceDirty) && !urlTestedOk && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={handleClose} variant='outlined'>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={handleTest}
                      variant='contained'
                      disabled={testing || !form.cam_url.trim()}
                      startIcon={testing ? <CircularProgress size={20} /> : null}
                    >
                      {testing ? t('cameras.testing') : t('cameras.testCamera')}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
            {urlTestedOk && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button onClick={handleClose} variant='outlined'>
                  {t('common.cancel')}
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={isLoading || testing}
                  startIcon={isLoading || testing ? <CircularProgress size={20} /> : null}
                >
                  {isLoading || testing ? t('common.loading') : t('cameras.save')}
                </Button>
              </Box>
            )}
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default CameraEditModal
