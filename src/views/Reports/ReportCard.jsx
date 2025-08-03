import { useState } from 'react'

import { Card, Box, Typography, Button, Avatar, Divider } from '@mui/material'
import { styled } from '@mui/system'
import InfoIcon from '@mui/icons-material/Info'
import EditIcon from '@mui/icons-material/Edit'

import { useTranslation } from '@/translations/useTranslation'
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

  const displayImage = reportData.person_image || reportData.last_image || '/images/avatars/1.png'

  return (
    <>
      <StyledReportCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            variant='rounded'
            src={displayImage}
            alt={reportData.first_name}
            sx={{ width: 60, height: 60, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' gutterBottom>
              {`${reportData.first_name || ''} ${reportData.last_name || ''}`}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              {t('reportCard.nationalCode')}: {reportData.national_code || t('reportCard.unknown')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant='body2'
              color={reportData.status === 'allowed' ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {reportData.status === 'allowed' ? t('reportCard.allowed') : t('reportCard.notAllowed')}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant='body2' color='textSecondary'>
            {t('reportCard.date')}: {reportData.date || t('reportCard.unknown')}
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
