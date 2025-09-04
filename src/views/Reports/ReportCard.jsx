import { useState } from 'react'

import { Card, Box, Typography, Button, Avatar, Divider, Chip } from '@mui/material'
import { styled } from '@mui/system'
import InfoIcon from '@mui/icons-material/Info'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import PersonIcon from '@mui/icons-material/Person'

import { useSelector } from 'react-redux'

import LockIcon from '@mui/icons-material/Lock'

import LockOpenIcon from '@mui/icons-material/LockOpen'

import FullScreenImageModal from '@/components/FullScreenImageModal'

import useCameras from '@/hooks/useCameras'

import { useTranslation } from '@/translations/useTranslation'
import { getBackendImgUrl2 } from '@/configs/routes'
import { selectGenderTypes, selectAccessTypes } from '@/store/slices/typesSlice'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import ReportsEditModal from './ReportsEditModal'
import { commonStyles } from '@/@core/styles/commonStyles'
import useHasPermission from '@/utils/HasPermission'

const StyledReportCard = styled(Card)(({ theme }) => ({
  ...commonStyles.transparentCard,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexGrow: 1,
  border: `1px solid rgba(0, 0, 0, 0.12)`,
  boxShadow: theme.shadows[1],
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}))

const ReportCard = ({ reportData, allReports, onOpenDetail, onOpenPersonAdd, onOpenPersonEdit }) => {
  const { t } = useTranslation()
  const [openEdit, setOpenEdit] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null)

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)
  const accessTypes = useSelector(selectAccessTypes)
  const { cameras: camerasData } = useCameras({ page: 1, per_page: 200 })

  // Helper function to get type title by ID
  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

  // Person display helpers
  const personObj =
    typeof reportData.person_id === 'object' && reportData.person_id !== null ? reportData.person_id : null

  const personCodeRaw =
    personObj?.person_id ?? personObj?.id ?? (typeof reportData.person_id === 'object' ? null : reportData.person_id)

  const personCode = personCodeRaw == null ? t('reportCard.unknown') : String(personCodeRaw)
  const firstName = personObj?.first_name?.trim?.() || ''
  const lastName = personObj?.last_name?.trim?.() || ''
  const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : t('reportCard.unknown')

  // Get proper image URLs
  const backendImgUrl = getBackendImgUrl2()

  const thumbnailImage = reportData.image_thumbnail_url
    ? `${backendImgUrl}/${reportData.image_thumbnail_url}`
    : reportData.image_url
      ? `${backendImgUrl}/${reportData.image_url}`
      : '/images/avatars/1.png'

  const fullImage = reportData.image_url
    ? `${backendImgUrl}/${reportData.image_url}`
    : reportData.person_image_url
      ? `${backendImgUrl}/${reportData.person_image_url}`
      : '/images/avatars/1.png'

  const hasUpdatePermission = useHasPermission('updatePersonReport')

  const confidencePercentage = Math.round((reportData.confidence || 0) * 100)
  const similarityScore = Math.round((reportData.similarity_score || 0) * 100)
  const fiqaPercentage = Math.round((reportData.fiqa || 0) * 100)

  const getSimilarityColor = similarity => {
    if (similarity >= 0.8) return 'success'
    if (similarity >= 0.6) return 'warning'

    return 'error'
  }

  const getConfidenceColor = confidence => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'warning'

    return 'error'
  }

  const getFiqaColor = fiqa => {
    if (fiqa >= 0.4) return 'success'
    if (fiqa >= 0.3) return 'warning'

    return 'error'
  }

  return (
    <>
      <StyledReportCard onClick={() => onOpenDetail && onOpenDetail()} sx={{ cursor: 'pointer' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            variant='rounded'
            src={isHovered ? fullImage : thumbnailImage}
            alt={`Person ${fullName || personCode}`}
            sx={{
              width: 60,
              height: 60,
              mr: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={e => {
              e.stopPropagation()
              setFullScreenImageUrl(fullImage)
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' color='textSecondary' fontWeight={600}>
              {fullName}
            </Typography>
            <Typography variant='body2' color='textSecondary' component='div'>
              {(() => {
                if (genderTypes.loading) {
                  return (
                    <Typography variant='body2' color='textSecondary'>
                      {t('reportCard.loading')}
                    </Typography>
                  )
                }

                const genderId = reportData.gender_id?.id || reportData.gender_id || reportData.person_id?.gender_id?.id
                let icon = null

                if (genderId === 2) {
                  icon = <i className='tabler tabler-gender-male' style={{ fontSize: 18, color: '#1976d2' }} />
                } else if (genderId === 3) {
                  icon = <i className='tabler tabler-gender-female' style={{ fontSize: 18, color: '#d81b60' }} />
                }

                return (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {icon}
                    <Typography variant='body2' color='textSecondary'>
                      {genderId && genderTypes?.data ? getTypeTitle(genderTypes, genderId) : t('reportCard.unknown')}
                    </Typography>
                  </Box>
                )
              })()}
            </Typography>
            <Typography variant='caption' color='textSecondary'>
              {t('reportCard.personId')}: {personCode}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip
              icon={<CameraAltIcon />}
              label={
                (camerasData || []).find?.(c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id)
                  ? camerasData.find(c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id)
                      .title ||
                    camerasData.find(c => c.id === reportData.camera_id || c.camera_id === reportData.camera_id).name
                  : `Camera ${reportData.camera_id}`
              }
              size='small'
              color='primary'
              variant='outlined'
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant='body2' color={reportData.access_id?.id === 5 ? 'success.main' : 'error.main'}>
                {accessTypes.loading
                  ? t('reportCard.loading')
                  : (() => {
                      const accessId = reportData.access_id?.id || reportData.access_id

                      if (accessId && accessTypes?.data) return getTypeTitle(accessTypes, accessId)

                      return t('reportCard.unknown')
                    })()}
              </Typography>
              {reportData.access_id?.id === 5 ? (
                <LockOpenIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <LockIcon sx={{ fontSize: 16, color: 'error.main' }} />
              )}
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />

        {/* Confidence and FIQA Scores */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant='caption' color='textSecondary'>
              {t('reportCard.confidence')}
            </Typography>
            <Chip label={`${confidencePercentage}%`} color={getConfidenceColor(reportData.confidence)} size='small' />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant='caption' color='textSecondary'>
              {t('reportCard.similarity')}
            </Typography>
            <Chip label={`${similarityScore}%`} color={getSimilarityColor(reportData.similarity_score)} size='small' />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant='caption' color='textSecondary'>
              {t('reportCard.fiqa')}
            </Typography>
            <Chip label={`${fiqaPercentage}%`} color={getFiqaColor(reportData.fiqa)} size='small' />
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant='body2' color='textSecondary'>
            {t('reportCard.date')}: <ShamsiDateTime dateTime={reportData.created_at} format='date' />
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='outlined'
              size='small'
              onClick={e => {
                e.stopPropagation()
                onOpenDetail && onOpenDetail()
              }}
              startIcon={<InfoIcon />}
            >
              {t('reportCard.details')}
            </Button>
            {hasUpdatePermission && (
              <Button
                variant='outlined'
                size='small'
                onClick={e => {
                  e.stopPropagation()

                  const accessId =
                    reportData.access_id?.id || reportData.access_id || reportData.person_id?.access_id?.id

                  const isUnknown = accessId === 7 || accessId === 'unknown' || !accessId

                  if (isUnknown) onOpenPersonAdd && onOpenPersonAdd()
                  else onOpenPersonEdit && onOpenPersonEdit()
                }}
                startIcon={(() => {
                  const accessId =
                    reportData.access_id?.id || reportData.access_id || reportData.person_id?.access_id?.id

                  const isUnknown = accessId === 7 || accessId === 'unknown' || !accessId

                  return isUnknown ? <AddIcon /> : <EditIcon />
                })()}
              >
                {(() => {
                  const accessId =
                    reportData.access_id?.id || reportData.access_id || reportData.person_id?.access_id?.id

                  const isUnknown = accessId === 7 || accessId === 'unknown' || !accessId

                  return isUnknown ? t('reportCard.addToAllowed') : t('common.edit')
                })()}
              </Button>
            )}
          </Box>
        </Box>
      </StyledReportCard>
      <ReportsEditModal open={openEdit} onClose={() => setOpenEdit(false)} reportData={reportData} />
      <FullScreenImageModal
        open={!!fullScreenImageUrl}
        imageUrl={fullScreenImageUrl}
        onClose={() => setFullScreenImageUrl(null)}
      />
    </>
  )
}

export default ReportCard
