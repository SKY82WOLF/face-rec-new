'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'

// SEO Component
import SEO from '@/components/SEO'

export default function Page() {
  return (
    <Box sx={{ direction: 'rtl' }}>
      <SEO
        title='پخش زنده | سیستم تشخیص چهره دیانا'
        description='مشاهده پخش زنده دوربین های سیستم تشخیص چهره دیانا'
        keywords='پخش زنده, دوربین, نظارت, تشخیص چهره'
      />

      {/* Main content */}
      <Stack direction='row' spacing={2}>
        {/* Main Content */}
        <Box sx={{ width: { xs: '100%', md: '80%' } }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant='h6'>پخش زنده</Typography>
              <Typography variant='h6'>گزارش ها</Typography>
            </Box>

            {/* Main surveillance camera feed */}
            <Box>
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 2,
                  position: 'relative',
                  backgroundImage: 'url(/images/surveillance/subway.svg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />

              {/* Person cards/reports */}
              <Stack spacing={2}>
                {[1, 2, 3].map(item => (
                  <Card
                    key={item}
                    variant='outlined'
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <i className='tabler-user' style={{ marginLeft: '8px' }} />
                          <Typography variant='body2'>آقا</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              px: 1
                            }}
                          >
                            <i className='tabler-lock-open' style={{ color: 'green', marginLeft: '5px' }} />
                            <Typography variant='body2' color='green'>
                              مجاز
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <i className='tabler-user' style={{ marginLeft: '8px' }} />
                          <Typography variant='body2'>ناشناس</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant='caption' sx={{ ml: 2 }}>
                            ۳۳۳۸۴۹۶
                          </Typography>
                          <Typography variant='caption'>۱۰:۳۵AM</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Avatar
                      alt='Person'
                      src={`/images/surveillance/person${item}.svg`}
                      sx={{ width: 60, height: 60 }}
                    />
                  </Card>
                ))}
              </Stack>
            </Box>
          </Card>
        </Box>
      </Stack>
    </Box>
  )
}
