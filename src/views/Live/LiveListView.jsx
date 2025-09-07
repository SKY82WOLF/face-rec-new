import React, { useState } from 'react'

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  IconButton
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import AddIcon from '@mui/icons-material/Add'
import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { getBackendImgUrl2 } from '@/configs/routes'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import FullScreenImageModal from '@/components/FullScreenImageModal'
import LiveDetailModal from './LiveDetailModal'
import LiveEditModal from './LiveEditModal'
import AddModal from './LiveAddModal'
import { useAddPerson, useUpdatePerson } from '@/hooks/usePersons'

const LiveListView = ({ reports = [], onOpenDetail, onEdit, onAdd, onDelete }) => {
  const { t } = useTranslation()
  const [fullImageUrl, setFullImageUrl] = useState(null)

  const backendImgUrl = getBackendImgUrl2()

  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)

  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  const resolve = url => {
    if (!url) return '/images/avatars/1.png'
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return `${backendImgUrl}${url}`

    return `${backendImgUrl}/${url}`
  }

  // Modal & navigation state (mirror LiveReportCard)
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [modalData, setModalData] = useState({})
  const [personModalType, setPersonModalType] = useState(null) // 'add' | 'edit' | null
  const addPersonMutation = useAddPerson()
  const updatePersonMutation = useUpdatePerson()

  const isUnknownAccess = accessId => {
    return accessId === 7 || accessId === 'unknown' || !accessId
  }

  const isAccessAllowed = accessId => {
    const id = accessId?.id || accessId

    return id === 5
  }

  const setReportDataByIndex = index => {
    const data = reports[index]

    setCurrentIndex(index)
    setModalData({
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      national_code: data.national_code || '',
      gender_id: data.gender_id || '',
      access_id: data.access_id || '',
      person_image: data.person_image || null,
      last_person_image: data.last_person_image || null,
      person_id: data.person_id || '',
      index: data.index,
      feature_vector: data.feature_vector,
      last_person_report_id: data.last_person_report_id,
      date: data.date,
      id: data.id
    })
  }

  const handleOpen = r => {
    // prefer using report index if available (Live reports pass index)
    const index =
      typeof r.index !== 'undefined'
        ? reports.findIndex(rr => rr.index === r.index)
        : reports.findIndex(rr => rr.id === r.id)

    if (index >= 0) {
      setReportDataByIndex(index)
    } else {
      setCurrentIndex(0)
      setReportDataByIndex(0)
    }

    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handlePersonModalOpen = () => {
    const accessId = modalData.access_id?.id || modalData.access_id

    if (isUnknownAccess(accessId)) {
      setPersonModalType('add')
    } else {
      setPersonModalType('edit')
    }

    setOpen(false)
  }

  const handlePersonModalClose = () => setPersonModalType(null)

  const handleAddSubmit = async formData => {
    try {
      await addPersonMutation.mutateAsync(formData)

      // child modal will call onClose on success
    } catch (error) {
      console.error('Failed to add person:', error)
    }
  }

  const handleEditSubmit = async formData => {
    try {
      await updatePersonMutation.mutateAsync({ id: modalData.person_id, data: formData })

      // child modal will call onClose on success
    } catch (error) {
      console.error('Failed to update person:', error)
    }
  }

  const handleNavigate = direction => {
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < reports.length) {
      setReportDataByIndex(newIndex)
    }
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ width: '100%' }}>
        <Table size='medium' sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell align='center'>{t('reportCard.image')}</TableCell>
              <TableCell align='center'>{t('reportCard.name')}</TableCell>
              <TableCell align='center'>{t('reportCard.id')}</TableCell>
              <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {t('reportCard.gender')}
              </TableCell>
              {/* camera column removed for Live list view */}
              <TableCell align='center'>{t('reportCard.time')}</TableCell>
              <TableCell align='center'>{t('reportCard.access')}</TableCell>
              <TableCell align='center'>{t('reportCard.actions') || ''}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((r, idx) => (
              <TableRow key={r.id ?? r.index ?? idx} hover>
                <TableCell sx={{ paddingLeft: 0, paddingRight: 0,width: '180px' }} align='center'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                    <Avatar
                      variant='rounded'
                      src={resolve(r.image_url || r.last_person_image)}
                      sx={{
                        width: 'auto',
                        height: 96,
                        borderRadius: 1.5,
                        cursor: r.image_url || r.last_person_image ? 'pointer' : 'default',
                        width: 'auto',
                        objectFit: 'contain',
                      }}
                      onClick={() => setFullImageUrl(resolve(r.image_url || r.last_person_image))}
                    />

                    <Avatar
                      variant='rounded'
                      src={resolve(r.person_image)}
                      sx={{ width: 'auto', height: 96, borderRadius: 1.5, cursor: r.person_image ? 'pointer' : 'default',
                        width: 'auto',
                        objectFit: 'contain',
                      }}
                      onClick={() => r.person_image && setFullImageUrl(resolve(r.person_image))}
                    />
                  </Box>
                </TableCell>
                <TableCell align='center'>
                  {(() => {
                    if (r.first_name || r.last_name) {
                      return <Box sx={{ fontWeight: 600 }}>{r.first_name + ' ' + r.last_name}</Box>
                    }

                    return <Box sx={{ fontWeight: 600 }}>{t('reportCard.unknown')}</Box>
                  })()}
                </TableCell>
                <TableCell align='center'>{r.person_id || t('reportCard.unknown')}</TableCell>
                <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {(() => {
                    if (genderTypes.loading) {
                      return (
                        <Typography variant='body2' color='textSecondary'>
                          {t('reportCard.loading')}
                        </Typography>
                      )
                    }

                    const genderId = r.gender_id?.id || r.gender_id || r.person_id?.gender_id?.id
                    let icon = null

                    if (genderId === 2) {
                      icon = <i className='tabler tabler-gender-male' style={{ fontSize: 18, color: '#1976d2' }} />
                    } else if (genderId === 3) {
                      icon = <i className='tabler tabler-gender-female' style={{ fontSize: 18, color: '#d81b60' }} />
                    }

                    return (
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
                        {icon}
                        <Typography variant='body2' color='textSecondary'>
                          {genderId && genderTypes?.data
                            ? getTypeTitle(genderTypes, genderId)
                            : t('reportCard.unknown')}
                        </Typography>
                      </Box>
                    )
                  })()}
                </TableCell>

                {/* removed camera column for Live list view */}

                <TableCell align='center'>
                  <ShamsiDateTime dateTime={r.date} format='time' />
                </TableCell>

                <TableCell align='center'>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
                    <Typography
                      variant='body2'
                      color={r.access_id === 5 || r.access_id?.id === 5 ? 'success.main' : 'error.main'}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {accessTypes.loading
                        ? t('reportCard.loading')
                        : (() => {
                            const accessId = r.access_id?.id || r.access_id || r.person_id?.access_id?.id

                            if (accessId && accessTypes?.data) {
                              return getTypeTitle(accessTypes, accessId)
                            }

                            return t('reportCard.unknown')
                          })()}
                    </Typography>
                    {r.access_id?.id === 5 || r.access_id === 5 ? (
                      <LockOpenIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <LockIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                  </Box>
                </TableCell>

                <TableCell align='center'>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton
                      size='small'
                      onClick={e => {
                        e.stopPropagation()
                        handleOpen(r)
                      }}
                    >
                      <InfoIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={e => {
                        e.stopPropagation()

                        const accessId = r.access_id?.id || r.access_id || r.person_id?.access_id?.id

                        // set modal data from clicked row
                        setModalData({
                          first_name: r.first_name || '',
                          last_name: r.last_name || '',
                          national_code: r.national_code || '',
                          gender_id: r.gender_id || '',
                          access_id: r.access_id || '',
                          person_image: r.person_image || null,
                          last_person_image: r.last_person_image || null,
                          person_id: r.person_id || '',
                          index: r.index,
                          feature_vector: r.feature_vector,
                          last_person_report_id: r.last_person_report_id,
                          date: r.date,
                          id: r.id
                        })

                        if (isUnknownAccess(accessId)) {
                          // open Add modal
                          setPersonModalType('add')
                          setAddOpen(true)
                        } else {
                          // open Edit modal
                          setPersonModalType('edit')
                          setEditOpen(true)
                        }
                      }}
                    >
                      {isUnknownAccess(r.access_id) ? <AddIcon fontSize='small' /> : <EditIcon fontSize='small' />}
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={e => {
                        e.stopPropagation()
                        onDelete && onDelete(r.id)
                      }}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details & Add/Edit modals */}
      <LiveDetailModal
        open={open}
        onClose={handleClose}
        modalData={modalData}
        currentIndex={currentIndex}
        allReports={reports}
        onNavigate={handleNavigate}
        onPersonModalOpen={type => setPersonModalType(type)}
        mode={''}
      />

      <AddModal
        open={personModalType === 'add'}
        onClose={handlePersonModalClose}
        onSubmit={handleAddSubmit}
        initialData={modalData}
        mode={''}
      />

      <LiveEditModal
        open={personModalType === 'edit'}
        onClose={handlePersonModalClose}
        onSubmit={handleEditSubmit}
        initialData={modalData}
        mode={''}
      />

      <FullScreenImageModal open={!!fullImageUrl} imageUrl={fullImageUrl} onClose={() => setFullImageUrl(null)} />
    </>
  )
}

export default LiveListView
