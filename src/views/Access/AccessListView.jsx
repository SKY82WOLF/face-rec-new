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
  Button,
  Typography
} from '@mui/material'

import { useTheme } from '@mui/material/styles'

import LockIcon from '@mui/icons-material/Lock'

import LockOpenIcon from '@mui/icons-material/LockOpen'

import { useSelector } from 'react-redux'

import { backendImgUrl } from '@/configs/routes'
import FullScreenImageModal from '@/components/FullScreenImageModal'

import ShamsiDateTime from '@/components/ShamsiDateTimer'
import { useTranslation } from '@/translations/useTranslation'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'

const AccessListView = ({ persons, onOpenDetail }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [fullImageUrl, setFullImageUrl] = useState(null)
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)


  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  const openFullImage = url => {
    if (!url) return
    setFullImageUrl(url)
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ backgroundColor: 'transparent', width: '100%', overflowX: 'auto' }}
      >
        <Table size='medium' sx={{ minWidth: 760, tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell align='center' sx={{ width: 280 }}>
                {t('reportCard.person')}
              </TableCell>
              <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' }, width: 80 }}>
                {t('reportCard.id')}
              </TableCell>
              <TableCell align='center' sx={{ display: { xs: 'none', md: 'table-cell' }, width: 140 }}>
                {t('reportCard.nationalCode')}
              </TableCell>
              <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' }, width: 100 }}>
                {t('reportCard.gender')}
              </TableCell>
              <TableCell align='center' sx={{ display: { xs: 'none', md: 'table-cell' }, width: 120 }}>
                {t('reportCard.date')}
              </TableCell>
              <TableCell align='center' sx={{ width: 110 }}>
                {t('reportCard.status')}
              </TableCell>
              <TableCell align='center' sx={{ width: 120 }}>
                {t('reportCard.actions') || ''}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {persons.map(person => (
              <TableRow key={person.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0,height: '100px' }}>
                      <Avatar
                        variant='rounded'
                        src={person.person_image ? backendImgUrl + person.person_image : '/images/avatars/1.png'}
                        sx={{
                          width: 72,
                          height: 56,
                          borderRadius: 1.5,
                          cursor: person.person_image ? 'pointer' : 'default',
                          flexShrink: 0,
                          width: 'auto',
                          objectFit: 'contain',
                        }}
                        onClick={() => person.person_image && openFullImage(backendImgUrl + person.person_image)}
                      />
                      <Avatar
                        variant='rounded'
                        src={
                          person.last_person_image ? backendImgUrl + person.last_person_image : '/images/avatars/1.png'
                        }
                        sx={{
                          width: 72,
                          height: 56,
                          borderRadius: 1.5,
                          cursor: person.last_person_image ? 'pointer' : 'default',
                          flexShrink: 0,
                          width: 'auto',
                          objectFit: 'contain',
                        }}
                        onClick={() =>
                          person.last_person_image && openFullImage(backendImgUrl + person.last_person_image)
                        }
                      />
                    </Box>
                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Box sx={{ fontWeight: 600 }}>{`${person.first_name || ''} ${person.last_name || ''}`}</Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {person.person_id}
                </TableCell>
                <TableCell align='center' sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {person.national_code}
                </TableCell>
                <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {(() => {
                    if (genderTypes.loading) {
                      return (
                        <>
                          <Typography variant='body2' color='textSecondary'>
                            {t('reportCard.loading')}
                          </Typography>
                        </>
                      )
                    }

                    const genderId = person.gender_id?.id || person.gender_id
                    let icon = null

                    if (genderId === 2) {
                      icon = <i className='tabler tabler-gender-male' style={{ fontSize: 18, color: '#1976d2' }} />
                    } else if (genderId === 3) {
                      icon = <i className='tabler tabler-gender-female' style={{ fontSize: 18, color: '#d81b60' }} />
                    }

                    return (
                      <>
                        {icon}
                        <Typography variant='body2' color='textSecondary'>
                          {genderId && genderTypes?.data
                            ? getTypeTitle(genderTypes, genderId)
                            : t('reportCard.unknown')}
                        </Typography>
                      </>
                    )
                  })()}
                  </Box>
                </TableCell>
                <TableCell align='center' sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <ShamsiDateTime dateTime={person.created_at} format='date' />
                </TableCell>
                <TableCell align='center'>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography
                  variant='body2'
                  color={person.access_id?.id === 5 ? 'success.main' : 'error.main'}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {accessTypes.loading
                    ? t('reportCard.loading')
                    : (() => {
                        const accessId = person.access_id?.id || person.access_id

                        if (accessId && accessTypes?.data) {
                          return getTypeTitle(accessTypes, accessId)
                        }

                        return t('reportCard.unknown')
                      })()}
                </Typography>
                {person.access_id?.id === 5 ? (
                  <LockOpenIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <LockIcon sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                </Box>
                </TableCell>
                <TableCell align='center'>
                  <Button size='small' variant='contained' onClick={() => onOpenDetail(person.id)}>
                    {t('reportCard.details')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <FullScreenImageModal open={!!fullImageUrl} imageUrl={fullImageUrl} onClose={() => setFullImageUrl(null)} />
    </>
  )
}

export default AccessListView
