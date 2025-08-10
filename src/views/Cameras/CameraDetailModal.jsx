import {
  Modal,
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
  Chip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import VideocamIcon from '@mui/icons-material/Videocam'

import { useTranslation } from '@/translations/useTranslation'
import { commonStyles } from '@/@core/styles/commonStyles'

const modalStyle = {
  ...commonStyles.modalContainer,
  width: '90%',
  maxWidth: 600
}

const CameraDetailModal = ({ open, onClose, camera }) => {
  const { t } = useTranslation()

  if (!camera) return null

  const getActiveChip = isActive => {
    const label = isActive ? t('cameras.statusOptions.active') : t('cameras.statusOptions.inactive')
    const color = isActive ? 'success' : 'error'

    return <Chip size='small' label={label} color={color} variant='outlined' />
  }

  return (
    <Modal
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
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.camUser')}</TableCell>
                  <TableCell>{camera.cam_user}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.camPassword')}</TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {camera.cam_password}
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
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.createdAt')}</TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {camera.created_at}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('cameras.updatedAt')}</TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {camera.updated_at}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={onClose} variant='contained'>
              {t('common.close')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default CameraDetailModal
