import { Box, Typography } from '@mui/material'

import { commonStyles } from '@/@core/styles/commonStyles'

const EmptyState = ({ message, icon, minHeight = 200 }) => {
  return (
    <Box sx={{ ...commonStyles.emptyContainer, minHeight }}>
      {icon && <Box sx={{ textAlign:'center', mb: 2, fontSize: '3rem', color: 'text.secondary' }}>{icon}</Box>}
      <Typography variant='h6' color='text.secondary'>
        {message}
      </Typography>
    </Box>
  )
}

export default EmptyState
