import { Box, CircularProgress, Typography } from '@mui/material'

import { commonStyles } from '@/@core/styles/commonStyles'

const LoadingState = ({ message = 'Loading...', minHeight = 200 }) => {
  return (
    <Box sx={{ ...commonStyles.loadingContainer, minHeight }}>
      <CircularProgress />
      {message && (
        <Typography sx={{ ml: 2 }} color='text.secondary'>
          {message}
        </Typography>
      )}
    </Box>
  )
}

export default LoadingState
