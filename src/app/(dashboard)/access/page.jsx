'use client'

import { useState } from 'react'

import {
  Button,
  Typography,
  Box,
  Card,
  Grid,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Pagination,
  IconButton
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import SEO from '@/components/SEO'
import ReportCard from '@/components/ReportCard'
import { useGetPersons, useAddPerson } from '@/hooks/usePersons'
import { useTranslation } from '@/translations/useTranslation'
import CustomTextField from '@/@core/components/mui/TextField'

const LIMIT_OPTIONS = [5, 10, 15, 20]

export default function Page() {
  const { t } = useTranslation()
  const [openAddModal, setOpenAddModal] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selectedImage, setSelectedImage] = useState(null)

  const [newPerson, setNewPerson] = useState({
    name: '',
    lastname: '',
    national_code: '',
    access: false,
    gender: '',
    userImage: null
  })

  const { data: personsData, isLoading } = useGetPersons({
    offset: (page - 1) * limit,
    limit
  })

  const addPersonMutation = useAddPerson()

  const handleOpenAddModal = () => setOpenAddModal(true)

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setNewPerson({
      name: '',
      lastname: '',
      national_code: '',
      access: false,
      gender: '',
      userImage: null
    })
    setSelectedImage(null)
  }

  const handleInputChange = e => {
    const { name, value, checked } = e.target

    setNewPerson(prev => ({
      ...prev,
      [name]: name === 'access' ? checked : value
    }))
  }

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      const previewUrl = URL.createObjectURL(file)

      setSelectedImage(previewUrl)

      setNewPerson(prev => ({
        ...prev,
        userImage: file
      }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      await addPersonMutation.mutateAsync(newPerson)
      handleCloseAddModal()
    } catch (error) {
      console.error('Failed to add person:', error)
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleLimitChange = event => {
    setLimit(event.target.value)
    setPage(1) // Reset to first page when changing limit
  }

  return (
    <Box sx={{ p: 4 }}>
      <SEO
        title='افراد مجاز | سیستم تشخیص چهره دیانا'
        description='مدیریت افراد مجاز سیستم تشخیص چهره دیانا'
        keywords='افراد مجاز, مدیریت دسترسی, تشخیص چهره دیانا'
      />

      <Card sx={{ backgroundColor: 'rgb(47 51 73 / 0)' }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6'>{t('access.title')}</Typography>
            <Button variant='contained' onClick={handleOpenAddModal}>
              {t('access.addNewPerson')}
            </Button>
          </Box>
          <Grid container spacing={2} sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
            {isLoading ? (
              <Typography>{t('access.loading')}</Typography>
            ) : personsData?.length > 0 ? (
              personsData.map(person => (
                <Grid sx={{ display: 'flex', flexGrow: 1 }} xs={12} sm={6} md={4} key={person.id}>
                  <ReportCard
                    reportData={{
                      id: person.id,
                      name: person.name,
                      last_name: person.last_name,
                      national_code: person.national_code,
                      access: person.access,
                      gender: person.gender,
                      created_at: person.created_at,
                      updated_at: person.updated_at,
                      is_active: person.is_active
                    }}
                  />
                </Grid>
              ))
            ) : (
              <Typography>{t('access.noPersons')}</Typography>
            )}
          </Grid>
          {personsData?.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3,
                gap: 2
              }}
            >
              <FormControl sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel>{t('access.itemsPerPage')}</InputLabel>
                <Select value={limit} onChange={handleLimitChange} label={t('access.itemsPerPage')}>
                  {LIMIT_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
                <Pagination
                  count={page + (personsData.length === limit ? 1 : 0)}
                  page={page}
                  onChange={handlePageChange}
                  color='primary'
                  showFirstButton
                  showLastButton
                  size='small'
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: 0, sm: 120 } }} /> {/* Spacer to balance the layout */}
            </Box>
          )}
        </Box>
      </Card>

      {/* Add Person Modal */}
      <Modal open={openAddModal} onClose={handleCloseAddModal} aria-labelledby='add-person-modal'>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography variant='h6' component='h2' gutterBottom>
            {t('access.addPersonModal.title')}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
              <Box
                component='img'
                src={selectedImage || '/images/avatars/1.png'}
                alt='Preview'
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  mb: 2
                }}
              />
              <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />} sx={{ mb: 2 }}>
                {t('access.addPersonModal.uploadImage')}
                <input type='file' hidden onChange={handleImageUpload} accept='image/*' />
              </Button>
            </Box>
            <CustomTextField
              fullWidth
              label={t('access.addPersonModal.name')}
              name='name'
              value={newPerson.name}
              onChange={handleInputChange}
              margin='normal'
              required
            />
            <CustomTextField
              fullWidth
              label={t('access.addPersonModal.lastName')}
              name='lastname'
              value={newPerson.lastname}
              onChange={handleInputChange}
              margin='normal'
              required
            />
            <CustomTextField
              fullWidth
              label={t('access.addPersonModal.nationalCode')}
              name='national_code'
              value={newPerson.national_code}
              onChange={e => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)

                handleInputChange({
                  target: {
                    name: 'national_code',
                    value
                  }
                })
              }}
              margin='normal'
              required
              slotProps={{
                input: {
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 10
                }
              }}
              error={newPerson.national_code.length > 0 && newPerson.national_code.length !== 10}
              helperText={
                newPerson.national_code.length > 0 && newPerson.national_code.length !== 10
                  ? t('access.addPersonModal.nationalCodeLimit')
                  : ''
              }
            />
            <FormControl fullWidth margin='normal'>
              <InputLabel>{t('access.addPersonModal.gender')}</InputLabel>
              <Select
                name='gender'
                value={newPerson.gender}
                onChange={handleInputChange}
                label={t('access.addPersonModal.gender')}
                required
              >
                <MenuItem value={false}>{t('access.addPersonModal.male')}</MenuItem>
                <MenuItem value={true}>{t('access.addPersonModal.female')}</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch name='access' checked={newPerson.access} onChange={handleInputChange} color='primary' />}
              label={newPerson.access ? t('access.addPersonModal.allowed') : t('access.addPersonModal.notAllowed')}
              sx={{ mt: 2 }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCloseAddModal}>{t('access.addPersonModal.cancel')}</Button>
              <Button type='submit' variant='contained'>
                {t('access.addPersonModal.add')}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  )
}
