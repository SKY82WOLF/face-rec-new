'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { useTranslation } from '@/translations/useTranslation'


const StyledSVG = styled('svg')(({ theme }) => ({
  width: '100%',
  maxWidth: '450px',
  height: '450px',
  '& path[fill="#6c63ff"]': {
    fill: theme.palette.primary.main
  },
  '& path[fill="#090814"]': {
    fill: theme.palette.mode === 'dark' ? '#fff' : '#000'
  },
  '& path[fill="#fff"]': {
    fill: theme.palette.mode === 'dark' ? '#000' : '#fff'
  },
  '& path[fill="#ccc"]': {
    fill: theme.palette.mode === 'dark' ? '#e0e0e0' : '#666'
  },
  '& path[fill="#b6b3c5"]': {
    fill: theme.palette.mode === 'dark' ? '#d0d0d0' : '#888'
  },
  '& path[fill="#d6d6e3"]': {
    fill: theme.palette.mode === 'dark' ? '#e8e8e8' : '#ccc'
  }
}))

const NotFound = ({ mode }) => {
  // Vars
  const { t } = useTranslation()

  // Hooks
  const theme = useTheme()

  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset] mbe-6'>
          <Typography fontFamily={"monospace"} className='font-medium text-8xl' color='text.primary'>
            404
          </Typography>
          <Typography variant='h4'>{t('notFound.title')}</Typography>
          <Typography>{t('notFound.description')}</Typography>
        </div>
        <Button href='/live' component={Link} variant='contained'>
          {t('notFound.backToHome')}
        </Button>
        <StyledSVG
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 799.031 618.112'
          className='mbs-1 md:mbs-2 lg:mbs-3'
        >
          <g transform='translate(-893 -197)'>
            <path
              d='M15.18,488.763c0,.872.478,1.573,1.073,1.573h535.1c.6,0,1.073-.7,1.073-1.573s-.478-1.573-1.073-1.573H16.253C15.658,487.191,15.18,487.891,15.18,488.763Z'
              transform='translate(1007.711 324.776)'
              fill='#ccc'
            />
            <rect width='19.105' height='3.371' transform='translate(1198.162 808.354)' fill='#b6b3c5' />
            <rect width='19.105' height='3.371' transform='translate(1367.295 808.917)' fill='#b6b3c5' />
            <path
              d='M352.955,370.945a27.529,27.529,0,0,1-54.321,0H229.146V521.536h193.3V370.945Z'
              transform='translate(966.721 287.378)'
              fill='#d6d6e3'
            />
            <rect width='193.296' height='5.242' transform='translate(1196.43 796.983)' fill='#090814' />
            <path
              d='M788.255,487.17H10.776A10.788,10.788,0,0,1,0,476.394V32.688A10.788,10.788,0,0,1,10.776,21.911H788.255a10.789,10.789,0,0,1,10.776,10.776V476.394a10.789,10.789,0,0,1-10.776,10.776Z'
              transform='translate(893 175.089)'
              fill='#090814'
            />
            <rect width='760.822' height='429.297' transform='translate(911.104 213.968)' fill='#fff' />
            <g transform='translate(20.477 16.308)'>
              <path
                d='M604.463,379.271H317.442a8.655,8.655,0,0,1-8.645-8.645V273.8a8.655,8.655,0,0,1,8.645-8.645H604.463a8.655,8.655,0,0,1,8.645,8.645v96.826a8.655,8.655,0,0,1-8.645,8.645Z'
                transform='translate(811.648 85.826)'
                fill='#6c63ff'
              />
              <rect width='76.078' height='8.645' rx='2' transform='translate(1165.4 380.374)' fill='#fff' />
              <ellipse
                cx='5.187'
                cy='5.187'
                rx='5.187'
                ry='5.187'
                transform='translate(1336.576 380.374)'
                fill='#090814'
              />
              <ellipse
                cx='5.187'
                cy='5.187'
                rx='5.187'
                ry='5.187'
                transform='translate(1353.865 380.374)'
                fill='#090814'
              />
              <ellipse
                cx='5.187'
                cy='5.187'
                rx='5.187'
                ry='5.187'
                transform='translate(1371.156 380.374)'
                fill='#090814'
              />
            </g>
            <ellipse
              cx='40.952'
              cy='40.952'
              rx='40.952'
              ry='40.952'
              transform='translate(1404.281 440.452)'
              fill='#090814'
            />
            <path
              d='M10.863-57.7l-.524-29.6h8.246l-.554,29.6Zm3.613,14.307a4.7,4.7,0,0,1-3.409-1.3,4.368,4.368,0,0,1-1.34-3.278,4.39,4.39,0,0,1,1.34-3.322,4.732,4.732,0,0,1,3.409-1.282,4.732,4.732,0,0,1,3.409,1.282,4.39,4.39,0,0,1,1.34,3.322,4.368,4.368,0,0,1-1.34,3.278A4.7,4.7,0,0,1,14.476-43.394Z'
              transform='translate(1430.76 546.754)'
              fill='#fff'
            />
          </g>
        </StyledSVG>
      </div>
    </div>
  )
}

export default NotFound
