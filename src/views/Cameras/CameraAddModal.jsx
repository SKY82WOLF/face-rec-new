import { useState } from 'react'

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

const CameraAddModal = ({ open, onClose, onSubmit, isLoading }) => {
  const { t } = useTranslation()

  const [form, setForm] = useState({
    name: '',
    cam_url: ''
  })

  const [errors, setErrors] = useState({})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [testError, setTestError] = useState('')
  const [selectedArea, setSelectedArea] = useState(null)

  const toLatinDigits = str =>
    (str || '')
      .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06f0))
      .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))

  const getResolutionText = res => {
    const cleaned = toLatinDigits(res || '').replace(/\s+/g, '')
    const parts = cleaned.split(/[x×]/i).filter(Boolean)

    if (parts.length >= 2) {
      const width = parts[0]
      const height = parts[1]

      return `${width} × ${height}`
    }

    return cleaned
  }

  const handleChange = e => {
    const { name, value } = e.target

    setForm(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.cam_url.trim()) {
      newErrors.cam_url = t('cameras.camUrlRequired')
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleTest = async e => {
    e.preventDefault()

    setTestError('')

    if (!form.cam_url.trim()) {
      setErrors(prev => ({ ...prev, cam_url: t('cameras.camUrlRequired') }))

      return
    }

    try {
      setTesting(true)

      const response = await testCamera({ camera_url: form.cam_url })

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
  }

  const handleSubmit = e => {
    e.preventDefault()
    const newErrors = {}

    if (!form.cam_url.trim()) newErrors.cam_url = t('cameras.camUrlRequired')
    if (!form.name.trim()) newErrors.name = t('cameras.nameRequired')
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    if (!testResult) {
      setTestError(t('cameras.mustTestUrlFirst'))

      return
    }

    onSubmit({ cam_url: form.cam_url, name: form.name, area: selectedArea })
  }

  const handleClose = () => {
    setForm({
      name: '',
      cam_url: ''
    })
    setErrors({})
    setTesting(false)
    setTestResult(null)
    setTestError('')
    setSelectedArea(null)
    onClose()
  }

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
                {t('cameras.addCamera')}
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
                {testError && (
                  <Typography color='error.main' variant='caption' sx={{ mt: 1, display: 'block' }}>
                    {testError}
                  </Typography>
                )}
              </Grid>

              {!testResult && (
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
                  {testError && (
                    <Typography color='error' variant='caption' sx={{ mt: 1, display: 'block' }}>
                      {testError}
                    </Typography>
                  )}
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
                          {getResolutionText(testResult.resolution)}
                        </Box>
                      </Typography>
                    </Box>
                  </Grid>

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
                </>
              )}
            </Grid>

            {testResult && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button onClick={handleClose} variant='outlined'>
                  {t('common.cancel')}
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? t('common.loading') : t('cameras.add')}
                </Button>
              </Box>
            )}
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default CameraAddModal
