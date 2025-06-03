import { useState } from 'react'

import {
  Card,
  Box,
  Typography,
  Button,
  Modal,
  Fade,
  Backdrop,
  TextField,
  Switch,
  FormControlLabel,
  Avatar,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { styled } from '@mui/system'
import LockIcon from '@mui/icons-material/Lock'
import EditIcon from '@mui/icons-material/Edit'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Info } from '@mui/icons-material'

// Create a styled Card component with consistent styling
const StyledReportCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexGrow: 1,

  // backgroundColor: theme.palette.background.paper,
  // borderRadius: theme.shape.borderRadius,
  // boxShadow: theme.shadows[3],
}))

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4
}

const editModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4
}

const ReportCard = ({ report }) => {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isAllowed, setIsAllowed] = useState(report.status === 'مجاز')

  const [formData, setFormData] = useState({
    nationalCode: report.nationalCode || '',
    name: report.name || 'ناشناس',
    gender: report.gender || 'نامشخص',
    status: report.status || 'غیر مجاز'
  })

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleEditOpen = () => {
    setEditOpen(true)
    setOpen(false)
  }

  const handleEditClose = () => setEditOpen(false)

  const handleInputChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStatusChange = event => {
    setIsAllowed(event.target.checked)
    setFormData(prev => ({
      ...prev,
      status: event.target.checked ? 'مجاز' : 'غیر مجاز'
    }))
  }

  return (
    <>
      <StyledReportCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2}}>
          <Avatar src={'/images/avatars/1.png'} alt={report.name} sx={{ width: 60, height: 60, mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' gutterBottom>
              {report.name || 'ناشناس'}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              کد ملی: {report.nationalCode || 'نامشخص'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant='body2'
              color={isAllowed ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center', mr: 1 }}
            >
              {report.status}
              {isAllowed && <LockIcon sx={{ fontSize: 16, ml: 0.5 }} />}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant='body2' color='textSecondary'>
            زمان: {report.time}
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            جنسیت: {report.gender || 'نامشخص'}
          </Typography>
          <Button variant='outlined' size='small' onClick={handleOpen} startIcon={<Info />}>
            جزئیات
          </Button>
        </Box>
      </StyledReportCard>

      {/* Details Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500
          }
        }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar src={'/images/avatars/1.png'} alt={report.name} sx={{ width: 100, height: 100, mr: 3 }} />
              <Box>
                <Typography variant='h5' gutterBottom>
                  {report.name || 'ناشناس'}
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  کد ملی: {report.nationalCode || 'نامشخص'}
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  جنسیت: {report.gender || 'نامشخص'}
                </Typography>
                <Typography
                  variant='body1'
                  color={isAllowed ? 'success.main' : 'error.main'}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  وضعیت: {report.status}
                  {isAllowed && <LockIcon sx={{ fontSize: 20, ml: 0.5 }} />}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant='body1' gutterBottom>
                زمان: {report.time}
              </Typography>
              <Typography variant='body1' gutterBottom>
                تاریخ: {report.date || 'نامشخص'}
              </Typography>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant='outlined' onClick={handleClose}>
                بستن
              </Button>
              <Button
                variant='contained'
                onClick={handleEditOpen}
                startIcon={isAllowed ? <EditIcon /> : <PersonAddIcon />}
              >
                {isAllowed ? 'ویرایش اطلاعات' : 'اضافه کردن به لیست مجاز'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500
          }
        }}
      >
        <Fade in={editOpen}>
          <Box sx={editModalStyle}>
            <Typography variant='h6' gutterBottom>
              {isAllowed ? 'ویرایش اطلاعات' : 'اضافه کردن به لیست مجاز'}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label='نام'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label='کد ملی'
                name='nationalCode'
                value={formData.nationalCode}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>جنسیت</InputLabel>
                <Select name='gender' value={formData.gender} onChange={handleInputChange} label='جنسیت'>
                  <MenuItem value='مرد'>م7.1.1رد</MenuItem>
                  <MenuItem value='زن'>زن</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={isAllowed} onChange={handleStatusChange} color='primary' />}
                label={isAllowed ? 'مجاز' : 'غیر مجاز'}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant='outlined' onClick={handleEditClose}>
                انصراف
              </Button>
              <Button variant='contained' onClick={handleEditClose}>
                {isAllowed ? 'ذخیره تغییرات' : 'اضافه کردن'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

export default ReportCard
