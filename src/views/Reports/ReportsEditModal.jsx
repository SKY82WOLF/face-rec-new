import { useState } from 'react'

import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  DialogActions
} from '@mui/material'

import { useSelector } from 'react-redux'

import { commonStyles } from '@/@core/styles/commonStyles'
import { useTranslation } from '@/translations/useTranslation'
import { selectGenderTypes } from '@/store/slices/typesSlice'

const modalStyle = {
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 500
}

const cameraOptions = [
  { value: 1, label: 'Camera 1' },
  { value: 2, label: 'Camera 2' },
  { value: 3, label: 'Camera 3' }
]

const ReportsEditModal = ({ open, onClose, reportData }) => {
  const { t } = useTranslation()

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)

  const [form, setForm] = useState({
    gender_id: reportData?.gender_id || '',
    camera_id: reportData?.camera_id || ''
  })

  const handleChange = e => {
    const { name, value } = e.target

    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()

    // Here you would call an API or mutate data
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box sx={modalStyle} component='form' onSubmit={handleSubmit}>
          <Typography variant='h6' mb={2}>
            {t('common.edit')}
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('reportCard.gender')}</InputLabel>
            <Select
              name='gender_id'
              value={form.gender_id || ''}
              onChange={handleChange}
              label={t('reportCard.gender')}
            >
              {genderTypes?.data?.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.translate?.trim() || type.title?.trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('reportCard.camera')}</InputLabel>
            <Select
              name='camera_id'
              value={form.camera_id || ''}
              onChange={handleChange}
              label={t('reportCard.camera')}
            >
              {cameraOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DialogActions sx={{ justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
            <Button type='submit' variant='contained'>
              {t('common.save')}
            </Button>
          </DialogActions>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ReportsEditModal
