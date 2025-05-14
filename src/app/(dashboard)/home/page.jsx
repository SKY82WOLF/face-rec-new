import Link from 'next/link'

import { Button, Typography, Box, Card } from '@mui/material'

export default function Page() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom>
        Home page
      </Typography>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant='body1' paragraph>
          Welcome to the starter kit!
        </Typography>

        <Button
          component={Link}
          href='/surveillance'
          variant='contained'
          color='primary'
          startIcon={<i className='tabler-video' />}
        >
          View Surveillance Dashboard
        </Button>
      </Card>
    </Box>
  )
}
