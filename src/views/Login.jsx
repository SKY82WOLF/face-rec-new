'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'
import Lottie from 'lottie-react'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { useTranslation } from '@/translations/useTranslation'
import { useAuth } from '@/hooks/useAuth'

// Animation Import
import animationData from '../../public/images/illustrations/auth/Animation - 1749537263516.json'

// Styled Custom Components
const LoginIllustration = styled('div')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(4),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LoginV2 = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const { t } = useTranslation()
  const { handleLogin, loading, error } = useAuth()

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleInputChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      await handleLogin(formData.username, formData.password)
    } catch (err) {
      // Error is handled in the useAuth hook
      console.error(err)
    }
  }

  return (
    <div className='flex bs-full justify-center flex-col md:flex-row-reverse'>
      <div
        className={classnames('flex bs-full items-center justify-center flex-1 relative p-4', {
          'border-ie': settings.skin === 'bordered'
        })}
      >
        <LoginIllustration>
          <Lottie animationData={animationData} loop={true} style={{ width: '100%', maxWidth: 600, height: 'auto' }} />
        </LoginIllustration>
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper p-6 md:p-8 w-full md:w-[480px] lg:w-[600px]'>
        <Link className='absolute block-start-5 sm:block-start-[33px] inline-end-6 sm:inline-end-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 w-full'>
          <div className='flex flex-col gap-1 text-right w-full'>
            <Typography variant='h4'>{`به ${themeConfig.templateName} خوش آمدید ! 👋🏻`}</Typography>
            <Typography>{t('auth.pleaseSignIn')}</Typography>
          </div>
          {error && (
            <Alert severity='error' className='w-full'>
              {error}
            </Alert>
          )}
          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5 w-full'>
            <CustomTextField
              autoFocus
              fullWidth
              name='username'
              value={formData.username}
              onChange={handleInputChange}
              label={t('auth.username')}
              placeholder={t('auth.username')}
              dir='rtl'
              className='w-full'
            />
            <CustomTextField
              fullWidth
              name='password'
              value={formData.password}
              onChange={handleInputChange}
              label={t('auth.password')}
              placeholder='············'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              dir='rtl'
              className='w-full'
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='start'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel control={<Checkbox />} label={t('auth.rememberMe')} />
              <Typography className='text-end' color='primary.main' component={Link}>
                {t('auth.forgotPassword')}
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
