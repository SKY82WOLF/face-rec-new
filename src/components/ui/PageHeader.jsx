import { Box, Typography, Button } from '@mui/material'

import { commonStyles } from '@/@core/styles/commonStyles'

const PageHeader = ({ title, actionButton, actionButtonProps = {}, underlineWidth = 157 }) => {
  return (
    <Box sx={commonStyles.pageHeader}>
      <Typography
        variant='h4'
        sx={{
          ...commonStyles.pageTitle,
          '&::after': {
            ...commonStyles.pageTitle['&::after'],
            width: underlineWidth
          }
        }}
      >
        {title}
      </Typography>
      {actionButton && (
        <Button variant='contained' sx={{ whiteSpace: 'nowrap' }} {...actionButtonProps}>
          {actionButton}
        </Button>
      )}
    </Box>
  )
}

export default PageHeader
