import { useState } from 'react'

import { Card, Box, Typography, Button, Avatar, Divider, Chip } from '@mui/material'
import { styled } from '@mui/system'
import InfoIcon from '@mui/icons-material/Info'
import EditIcon from '@mui/icons-material/Edit'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import PersonIcon from '@mui/icons-material/Person'

import { useSelector } from 'react-redux'

import { useTranslation } from '@/translations/useTranslation'
import { getBackendImgUrl2 } from '@/configs/routes'
import { selectGenderTypes } from '@/store/slices/typesSlice'
import ShamsiDateTime from '@/components/ShamsiDateTimer'
import ReportsDetailModal from './ReportsDetailModal'
import ReportsEditModal from './ReportsEditModal'
import { commonStyles } from '@/@core/styles/commonStyles'

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

const ReportCard = ({ reportData, allReports, onOpenDetail }) => {
  const { t } = useTranslation()
  const [openEdit, setOpenEdit] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Get types data
  const genderTypes = useSelector(selectGenderTypes)

  // Helper function to get type title by ID
  const getTypeTitle = (types, id) => {
    if (!types?.data || !id) return t('reportCard.unknown')
    const type = types.data.find(type => type.id === id)

    return type?.translate?.trim() || type?.title?.trim() || t('reportCard.unknown')
  }

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


  const confidencePercentage = Math.round((reportData.confidence || 0) * 100)
  const fiqaPercentage = Math.round((reportData.fiqa || 0) * 100)

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
      <StyledReportCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            variant='rounded'
            src={isHovered ? fullImage : thumbnailImage}
            alt={`Person ${reportData.person_id}`}
            sx={{
              width: 60,
              height: 60,
              mr: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' gutterBottom>
              Person ID: {reportData.person_id || 'Unknown'}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              {t('reportCard.gender')}:{' '}
              {genderTypes.loading ? t('reportCard.loading') : getTypeTitle(genderTypes, reportData.gender_id)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip
              icon={<CameraAltIcon />}
              label={`Camera ${reportData.camera_id}`}
              size='small'
              color='primary'
              variant='outlined'
            />
            <Typography variant='caption' color='textSecondary'>
              ID: {reportData.id}
            </Typography>
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
            <Button variant='outlined' size='small' onClick={onOpenDetail} startIcon={<InfoIcon />}>
              {t('reportCard.details')}
            </Button>
            <Button variant='outlined' size='small' onClick={() => setOpenEdit(true)} startIcon={<EditIcon />}>
              {t('common.edit')}
            </Button>
          </Box>
        </Box>
      </StyledReportCard>
      <ReportsEditModal open={openEdit} onClose={() => setOpenEdit(false)} reportData={reportData} />
    </>
  )
}

export default ReportCard
