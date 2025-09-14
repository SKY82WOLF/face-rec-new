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

import CameraAltIcon from '@mui/icons-material/CameraAlt'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import InfoIcon from '@mui/icons-material/Info'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import PsychologyIcon from '@mui/icons-material/Psychology'

import { useSelector } from 'react-redux'

import { getBackendImgUrl2 } from '@/configs/routes'
import FullScreenImageModal from '@/components/FullScreenImageModal'
import EmotionAnalysisModal from '@/components/EmotionAnalysisModal'

import ShamsiDateTime from '@/components/ShamsiDateTimer'
import { useTranslation } from '@/translations/useTranslation'

import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import useCameras from '@/hooks/useCameras'

const ReportsListView = ({ reports, onOpenDetail, onEdit, onAdd, onDelete }) => {
  const { t } = useTranslation()
  const [fullImageUrl, setFullImageUrl] = useState(null)
  const [emotionModalData, setEmotionModalData] = useState(null)

  const backendImgUrl = getBackendImgUrl2()

  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)
  const { cameras: camerasData } = useCameras({ page: 1, per_page: 200 })

  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ width: '100%' }}>
        <Table size='medium' sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: '200px' }} align='center'>
                {t('reportCard.image')}
              </TableCell>
              <TableCell align='center'>{t('reportCard.name')}</TableCell>
              <TableCell align='center'>{t('reportCard.id')}</TableCell>
              <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {t('reportCard.gender')}
              </TableCell>
              <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {t('reportCard.camera')}
              </TableCell>
              <TableCell align='center'>{t('reportCard.date')}</TableCell>
              <TableCell align='center'>{t('reportCard.access')}</TableCell>
              <TableCell align='center'>{t('reportCard.actions') || ''}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map(r => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ paddingLeft: 0, paddingRight: 0, width: '200px' }} align='center'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                    <Avatar
                      variant='rounded'
                      src={
                        r.image_thumbnail_url
                          ? `${backendImgUrl}/${r.image_thumbnail_url}`
                          : r.image_url
                            ? `${backendImgUrl}/${r.image_url}`
                            : '/images/avatars/1.png'
                      }
                      sx={{
                        width: 120,
                        height: 76,
                        borderRadius: 1.5,
                        cursor: r.image_url ? 'pointer' : 'default'
                      }}
                      onClick={() => setFullImageUrl(r.image_url ? `${backendImgUrl}/${r.image_url}` : null)}
                    />

                    <Avatar
                      variant='rounded'
                      src={r.person_image_url ? `${backendImgUrl}/${r.person_image_url}` : '/images/avatars/1.png'}
                      sx={{
                        width: 120,
                        height: 76,
                        borderRadius: 1.5,
                        cursor: r.person_image_url ? 'pointer' : 'default',
                        objectFit: 'contain',
                        borderRadius: 1.5,
                        width: 'auto'
                      }}
                      onClick={() => r.person_image_url && setFullImageUrl(`${backendImgUrl}/${r.person_image_url}`)}
                    />
                  </Box>
                </TableCell>
                <TableCell align='center'>
                  {(() => {
                    if (r.person_id?.first_name && r.person_id?.last_name) {
                      return (
                        <Box sx={{ fontWeight: 600 }}>{r.person_id?.first_name + ' ' + r.person_id?.last_name}</Box>
                      )
                    }

                    return <Box sx={{ fontWeight: 600 }}>{t('reportCard.unknown')}</Box>
                  })()}
                </TableCell>
                <TableCell align='center'>{r.person_id?.person_id}</TableCell>
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

                <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <CameraAltIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                    <Typography variant='body2' color='primary.main'>
                      {(camerasData || []).find?.(c => c.id === r.camera_id || c.camera_id === r.camera_id)
                        ? camerasData.find(c => c.id === r.camera_id || c.camera_id === r.camera_id).title ||
                          camerasData.find(c => c.id === r.camera_id || c.camera_id === r.camera_id).name
                        : `Camera ${r.camera_id}`}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align='center'>
                  <ShamsiDateTime dateTime={r.created_at} format='datetime' />
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
                        onOpenDetail && onOpenDetail(r.id)
                      }}
                    >
                      <InfoIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='secondary'
                      onClick={e => {
                        e.stopPropagation()
                        setEmotionModalData(r)
                      }}
                    >
                      <PsychologyIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={e => {
                        e.stopPropagation()
                        const accessId = r.access_id?.id || r.access_id || r.person_id?.access_id?.id
                        const isUnknown = accessId === 7 || accessId === 'unknown' || !accessId

                        if (isUnknown && onAdd) onAdd(r)
                        else if (!isUnknown && onEdit) onEdit(r)
                      }}
                    >
                      {(() => {
                        const accessId = r.access_id?.id || r.access_id || r.person_id?.access_id?.id
                        const isUnknown = accessId === 7 || accessId === 'unknown' || !accessId

                        return isUnknown ? <AddIcon fontSize='small' /> : <EditIcon fontSize='small' />
                      })()}
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

      <FullScreenImageModal open={!!fullImageUrl} imageUrl={fullImageUrl} onClose={() => setFullImageUrl(null)} />

      {/* Emotion Analysis Modal */}
      {emotionModalData && (
        <EmotionAnalysisModal
          open={!!emotionModalData}
          onClose={() => setEmotionModalData(null)}
          reportData={emotionModalData}
        />
      )}
    </>
  )
}

export default ReportsListView
