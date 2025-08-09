import { useState, useEffect } from 'react'

import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import VideocamIcon from '@mui/icons-material/Videocam'

import { useTranslation } from '@/translations/useTranslation'
import CustomTextField from '@/@core/components/mui/TextField'
import { commonStyles } from '@/@core/styles/commonStyles'

const modalStyle = {
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 600
}

const CameraEditModal = ({ open, onClose, onSubmit, camera, isLoading }) => {
  const { t } = useTranslation()

  const [form, setForm] = useState({
    name: '',
    cam_url: '',
    cam_user: '',
    cam_password: '',
    is_active: true
  })

  const [errors, setErrors] = useState({})

  // Update form when camera data changes
  useEffect(() => {
    if (camera) {
      setForm({
        name: camera.name || '',
        cam_url: camera.cam_url || '',
        cam_user: camera.cam_user || '',
        cam_password: camera.cam_password || '',
        is_active: !!camera.is_active
      })
    }
  }, [camera])

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

    if (!form.name.trim()) {
      newErrors.name = t('cameras.nameRequired')
    }

    if (!form.cam_url.trim()) {
      newErrors.cam_url = t('cameras.camUrlRequired')
    }

    if (!form.cam_user.trim()) {
      newErrors.cam_user = t('cameras.camUserRequired')
    }

    if (!form.cam_password.trim()) {
      newErrors.cam_password = t('cameras.camPasswordRequired')
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit({ id: camera.id, data: form })
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

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
              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
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
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label={t('cameras.camUser')}
                  name='cam_user'
                  value={form.cam_user}
                  onChange={handleChange}
                  error={!!errors.cam_user}
                  helperText={errors.cam_user}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label={t('cameras.camPassword')}
                  name='cam_password'
                  type='password'
                  value={form.cam_password}
                  onChange={handleChange}
                  error={!!errors.cam_password}
                  helperText={errors.cam_password}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.is_active}
                      onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                  }
                  label={t('cameras.isActive')}
                />
              </Grid>
            </Grid>

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
                {isLoading ? t('common.loading') : t('cameras.save')}
              </Button>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default CameraEditModal
