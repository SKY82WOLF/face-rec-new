'use client'

import { useEffect, useState, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

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
  CircularProgress
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import SEO from '@/components/SEO'
import ReportCard from '@/components/ReportCard'
import { useGetPersons, useAddPerson } from '@/hooks/usePersons'
import { useTranslation } from '@/translations/useTranslation'
import CustomTextField from '@/@core/components/mui/TextField'

const LIMIT_OPTIONS = [5, 10, 15, 20]

function AccessContent({ initialPage = 1, initialLimit = 10 }) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(() => {
    const pageFromUrl = parseInt(searchParams.get('page'), 10)

    return pageFromUrl && pageFromUrl > 0 ? pageFromUrl : initialPage
  })

  const [limit, setLimit] = useState(() => {
    const limitFromUrl = parseInt(searchParams.get('limit'), 10)

    return limitFromUrl && LIMIT_OPTIONS.includes(limitFromUrl) ? limitFromUrl : initialLimit
  })

  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const [newPerson, setNewPerson] = useState({
    first_name: '',
    last_name: '',
    national_code: '',
    access: false,
    gender: 1,
    profile_image: null,
    last_image: '',
    feature_vector: '',
    index: '',
    report_id: '',
    image_quality: ''
  })

  const { data: personsData, isLoading } = useGetPersons({
    offset: (page - 1) * limit,
    limit
  })

  const addPersonMutation = useAddPerson()

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    params.set('page', page.toString())
    params.set('limit', limit.toString())
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [page, limit, router, searchParams])

  const handleOpenAddModal = () => setOpenAddModal(true)

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setNewPerson({
      first_name: '',
      last_name: '',
      national_code: '',
      access: false,
      gender: '',
      profile_image: null
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
        profile_image: file
      }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const submitData = {
        ...newPerson,
        access: newPerson.access ? 'allowed' : 'not_allowed'
      }

      await addPersonMutation.mutateAsync(submitData)
      handleCloseAddModal()
    } catch (error) {
      console.error('Failed to add person:', error)
    }
  }

  const handlePageChange = (event, value) => {
    if (value && !isNaN(value)) {
      const totalPages = Math.ceil((personsData?.total || 0) / limit)
      const newPage = Math.max(1, Math.min(value, totalPages))

      setPage(newPage)
    }
  }

  const handleLimitChange = event => {
    setLimit(event.target.value)
    setPage(1)
  }

  return (
    <Box sx={{ pt: 3 }}>
      <SEO
        title='اشخاص مجاز | سیستم تشخیص چهره دیانا'
        description='مدیریت اشخاص مجاز سیستم تشخیص چهره دیانا'
        keywords='اشخاص مجاز, مدیریت دسترسی, تشخیص چهره دیانا'
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 3 }}>
        <Typography
          variant='h4'
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            textTransform: 'uppercasemq',
            letterSpacing: '1px',
            position: 'relative',
            marginBottom: '10px',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '0',
              width: '130px',
              height: '3px',
              backgroundColor: 'primary.main',
              borderRadius: '2px',
              marginBottom: '5px'
            }
          }}
        >
          {t('access.title')}
        </Typography>
        <Button variant='contained' onClick={handleOpenAddModal}>
          {t('access.addNewPerson')}
        </Button>
      </Box>
      <Card
        elevation={0}
        sx={{
          backgroundColor:
            isLoading || !personsData?.data?.length ? 'var(--mui-palette-background-paper)' : 'transparent',
          boxShadow: isLoading || !personsData?.data?.length ? 'var(--mui-customShadows-md)' : 'none'
        }}
      >
        <Grid
          p={2}
          container
          spacing={2}
          sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)', justifyContent: 'center' }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : personsData?.data?.length > 0 ? (
            personsData.data.map((person, index) => (
              <Grid sx={{ display: 'flex', flexGrow: 1, minWidth: '330px' }} xs={12} sm={6} md={4} key={person.id}>
                <ReportCard
                  reportData={{
                    id: person.id,
                    first_name: person.first_name,
                    last_name: person.last_name,
                    national_code: person.national_code,
                    access: person.access,
                    gender: person.gender,
                    profile_image: person.profile_image,
                    index: index
                  }}
                  allReports={personsData.data}
                />
              </Grid>
            ))
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Typography>{t('access.noPersons')}</Typography>
            </Box>
          )}
        </Grid>
      </Card>
      {personsData?.data?.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 3,
            gap: 2,
            p: 2
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
              count={Math.ceil((personsData?.total || 0) / limit)}
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
                  borderRadius: '10%',
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
              name='first_name'
              value={newPerson.first_name}
              onChange={handleInputChange}
              margin='normal'
              required
            />
            <CustomTextField
              fullWidth
              label={t('access.addPersonModal.lastName')}
              name='last_name'
              value={newPerson.last_name}
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

export default function Page() {
  return (
    <Suspense>
      <AccessContent />
    </Suspense>
  )
}
