'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// Next Imports
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import { useTheme } from '@mui/material/styles'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Switch from '@mui/material/Switch'

// Third-party Imports
import classnames from 'classnames'
import { useDebounce, useMedia } from 'react-use'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Icon Imports
import SkinDefault from '@core/svg/SkinDefault'
import SkinBordered from '@core/svg/SkinBordered'
import LayoutVertical from '@core/svg/LayoutVertical'
import LayoutCollapsed from '@core/svg/LayoutCollapsed'
import LayoutHorizontal from '@core/svg/LayoutHorizontal'
import ContentCompact from '@core/svg/ContentCompact'
import ContentWide from '@core/svg/ContentWide'
import DirectionLtr from '@core/svg/DirectionLtr'
import DirectionRtl from '@core/svg/DirectionRtl'

// Config Imports
import primaryColorConfig from '@configs/primaryColorConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { usePrimaryColor } from '@core/hooks/usePrimaryColor'
import { useTranslation } from '@/translations/useTranslation'

// Event Imports
import customizerEvents, { CUSTOMIZER_EVENTS } from '@core/utils/customizerEvents'

// Style Imports
import styles from './styles.module.css'

const getLocalePath = (pathName, locale) => {
  if (!pathName) return '/'
  const segments = pathName.split('/')

  segments[1] = locale

  return segments.join('/')
}

const DebouncedColorPicker = props => {
  // Props
  const { currentColor, isColorFromPrimaryConfig, handleChange } = props

  // States
  const [debouncedColor, setDebouncedColor] = useState(currentColor || primaryColorConfig[0].main)

  // Hooks
  useDebounce(() => handleChange('primaryColor', debouncedColor), 200, [debouncedColor])

  const { t } = useTranslation()

  return (
    <>
      <HexColorPicker
        color={!isColorFromPrimaryConfig ? currentColor || primaryColorConfig[0].main : '#eee'}
        onChange={setDebouncedColor}
      />
      <HexColorInput
        className={styles.colorInput}
        color={!isColorFromPrimaryConfig ? currentColor || primaryColorConfig[0].main : '#eee'}
        onChange={setDebouncedColor}
        prefixed
        placeholder={t('settings.theme.typeColor')}
      />
    </>
  )
}

const Customizer = ({ breakpoint = 'lg', dir = 'ltr', disableDirection = false }) => {
  // States
  const [isOpen, setIsOpen] = useState(false)
  const [direction, setDirection] = useState(dir)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Primary color hook
  const [primaryColor, updatePrimaryColor] = usePrimaryColor()

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const theme = useTheme()
  const pathName = usePathname()
  const { settings, updateSettings, resetSettings, isSettingsChanged } = useSettings()
  const isSystemDark = useMedia('(prefers-color-scheme: dark)', false)
  const { t } = useTranslation()

  // Effect to handle client-side rendering and event subscription
  useEffect(() => {
    setIsMounted(true)

    // Subscribe to the toggle event
    const unsubscribe = customizerEvents.subscribe(CUSTOMIZER_EVENTS.TOGGLE_CUSTOMIZER, () => {
      setIsOpen(prevState => !prevState)
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  // Vars
  let breakpointValue

  switch (breakpoint) {
    case 'xxl':
      breakpointValue = '1920px'
      break
    case 'xl':
      breakpointValue = `${theme.breakpoints.values.xl}px`
      break
    case 'lg':
      breakpointValue = `${theme.breakpoints.values.lg}px`
      break
    case 'md':
      breakpointValue = `${theme.breakpoints.values.md}px`
      break
    case 'sm':
      breakpointValue = `${theme.breakpoints.values.sm}px`
      break
    case 'xs':
      breakpointValue = `${theme.breakpoints.values.xs}px`
      break
    default:
      breakpointValue = breakpoint
  }

  const breakpointReached = useMedia(`(max-width: ${breakpointValue})`, false)
  const isMobileScreen = useMedia('(max-width: 600px)', false)
  const isBelowLgScreen = useMedia('(max-width: 1200px)', false)
  const isColorFromPrimaryConfig = primaryColor ? primaryColorConfig.find(item => item.main === primaryColor) : false
  const ScrollWrapper = isBelowLgScreen ? 'div' : PerfectScrollbar

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  // Update Settings
  const handleChange = (field, value) => {
    // Update direction state
    if (field === 'direction') {
      setDirection(value)
    } else if (field === 'primaryColor') {
      // Handle primary color change with our custom function
      updatePrimaryColor(value)

      // Also update settings context for other components
      updateSettings({ [field]: value })
    } else {
      // Update settings in cookie
      updateSettings({ [field]: value })
    }
  }

  const handleMenuClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }

    setIsMenuOpen(false)
  }

  // Return null during SSR or early client-side render
  if (!isMounted) return null

  return (
    <div
      className={classnames('customizer', styles.customizer, {
        [styles.show]: isOpen,
        [styles.smallScreen]: isMobileScreen
      })}
    >
      {/* <div className={styles.toggler} onClick={handleToggle}>
        <i className='tabler-settings text-[22px]' />
      </div> */}
      <div className={styles.header}>
        <div className='flex flex-col'>
          <h4 className={styles.customizerTitle}>شخصی سازی تم</h4>
          <p className={styles.customizerSubtitle}>پیشنمایش و شخصی سازی تم در لحظه</p>
        </div>
        <div className='flex gap-4'>
          <div onClick={resetSettings} className='relative flex cursor-pointer'>
            <i className='tabler-refresh text-textPrimary' />
            <div className={classnames(styles.dotStyles, { [styles.show]: isSettingsChanged })} />
          </div>
          <i className='tabler-x text-textPrimary cursor-pointer' onClick={handleToggle} />
        </div>
      </div>
      <ScrollWrapper
        {...(isBelowLgScreen
          ? { className: 'bs-full overflow-y-auto overflow-x-hidden' }
          : { options: { wheelPropagation: false, suppressScrollX: true } })}
      >
        <div className={styles.customizerBody}>
          <div className='flex flex-col gap-6'>
            <Chip
              label={t('settings.theme.theming')}
              size='small'
              color='primary'
              variant='tonal'
              className='self-start rounded-sm'
            />
            <div className='flex flex-col gap-2'>
              <p className='font-medium'>{t('settings.theme.mainColor')}</p>
              <div className='flex items-center justify-between'>
                {primaryColorConfig.map(item => (
                  <div
                    key={item.main}
                    className={classnames(styles.primaryColorWrapper, {
                      [styles.active]: primaryColor === item.main
                    })}
                    onClick={() => handleChange('primaryColor', item.main)}
                  >
                    <div className={styles.primaryColor} style={{ backgroundColor: item.main }} />
                  </div>
                ))}
                <div
                  ref={anchorRef}
                  className={classnames(styles.primaryColorWrapper, {
                    [styles.active]: !isColorFromPrimaryConfig
                  })}
                  onClick={() => setIsMenuOpen(prev => !prev)}
                >
                  <div
                    className={classnames(styles.primaryColor, 'flex items-center justify-center')}
                    style={{
                      backgroundColor: !isColorFromPrimaryConfig ? primaryColor : 'var(--mui-palette-action-selected)',
                      color: isColorFromPrimaryConfig
                        ? 'var(--mui-palette-text-primary)'
                        : 'var(--mui-palette-primary-contrastText)'
                    }}
                  >
                    <i className='tabler-color-picker text-xl' />
                  </div>
                </div>
                <Popper
                  transition
                  open={isMenuOpen}
                  disablePortal
                  anchorEl={anchorRef.current}
                  placement='bottom-end'
                  className='z-[1]'
                >
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} style={{ transformOrigin: 'right top' }}>
                      <Paper elevation={6} className={styles.colorPopup}>
                        <ClickAwayListener onClickAway={handleMenuClose}>
                          <div>
                            <DebouncedColorPicker
                              currentColor={primaryColor}
                              isColorFromPrimaryConfig={isColorFromPrimaryConfig}
                              handleChange={handleChange}
                            />
                          </div>
                        </ClickAwayListener>
                      </Paper>
                    </Fade>
                  )}
                </Popper>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='font-medium'>{t('settings.theme.theme')}</p>
              <div className='flex items-center justify-between'>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, styles.modeWrapper, {
                      [styles.active]: settings?.mode === 'light'
                    })}
                    onClick={() => handleChange('mode', 'light')}
                  >
                    <i className='tabler-sun text-[30px]' />
                  </div>
                  <p className={styles.itemLabel} onClick={() => handleChange('mode', 'light')}>
                    {t('settings.theme.light')}
                  </p>
                </div>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, styles.modeWrapper, {
                      [styles.active]: settings?.mode === 'dark'
                    })}
                    onClick={() => handleChange('mode', 'dark')}
                  >
                    <i className='tabler-moon-stars text-[30px]' />
                  </div>
                  <p className={styles.itemLabel} onClick={() => handleChange('mode', 'dark')}>
                    {t('settings.theme.dark')}
                  </p>
                </div>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, styles.modeWrapper, {
                      [styles.active]: settings?.mode === 'system'
                    })}
                    onClick={() => handleChange('mode', 'system')}
                  >
                    <i className='tabler-device-laptop text-[30px]' />
                  </div>
                  <p className={styles.itemLabel} onClick={() => handleChange('mode', 'system')}>
                    {t('settings.theme.system')}
                  </p>
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='font-medium'>{t('settings.theme.skin')}</p>
              <div className='flex items-center gap-4'>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, { [styles.active]: settings?.skin === 'default' })}
                    onClick={() => handleChange('skin', 'default')}
                  >
                    <SkinDefault />
                  </div>
                  <p className={styles.itemLabel} onClick={() => handleChange('skin', 'default')}>
                    {t('settings.theme.default')}
                  </p>
                </div>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, { [styles.active]: settings?.skin === 'bordered' })}
                    onClick={() => handleChange('skin', 'bordered')}
                  >
                    <SkinBordered />
                  </div>
                  <p className={styles.itemLabel} onClick={() => handleChange('skin', 'bordered')}>
                    {t('settings.theme.bordered')}
                  </p>
                </div>
              </div>
            </div>
            {/* {settings?.mode === 'dark' ||
            (settings?.mode === 'system' && isSystemDark) ||
            settings?.layout === 'horizontal' ? null : (
              <div className='flex items-center justify-between'>
                <label className='font-medium cursor-pointer' htmlFor='customizer-semi-dark'>
                  Semi Dark
                </label>
                <Switch
                  id='customizer-semi-dark'
                  checked={settings?.semiDark === true}
                  onChange={() => handleChange('semiDark', !settings?.semiDark)}
                />
              </div>
            )} */}
          </div>
          <hr className={styles.hr} />
          <div className='flex flex-col gap-6'>
            <Chip
              label={t('settings.theme.layout')}
              variant='tonal'
              size='small'
              color='primary'
              className='self-start rounded-sm'
            />
            <div className='flex flex-col gap-2'>
              <p className='font-medium'>{t('settings.theme.layouts')}</p>
              <div className='flex items-center gap-4'>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, { [styles.active]: settings?.layout === 'vertical' })}
                    onClick={() => handleChange('layout', 'vertical')}
                  >
                    <LayoutVertical />
                  </div>
                  <p className={styles.itemLabel} onClick={() => handleChange('layout', 'vertical')}>
                    {t('settings.theme.layoutTypes.vertical')}
                  </p>
                </div>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, { [styles.active]: settings?.layout === 'collapsed' })}
                    onClick={() => handleChange('layout', 'collapsed')}
                  >
                    <LayoutCollapsed />
                  </div>
                  <p className={styles.itemLabel} onClick={() => handleChange('layout', 'collapsed')}>
                    {t('settings.theme.layoutTypes.collapsed')}
                  </p>
                </div>
                {/* <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, { [styles.active]: settings?.layout === 'horizontal' })}
                    onClick={() => handleChange('layout', 'horizontal')}
                  >
                    <LayoutHorizontal />
                  </div>
                  <p className={styles.itemLabel} onClick={() => handleChange('layout', 'horizontal')}>
                    Horizontal
                  </p>
                </div> */}
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='font-medium'>{t('settings.theme.content')}</p>
              <div className='flex items-center gap-4'>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, {
                      [styles.active]: settings?.contentWidth === 'compact'
                    })}
                    onClick={() =>
                      updateSettings({
                        navbarContentWidth: 'compact',
                        contentWidth: 'compact',
                        footerContentWidth: 'compact'
                      })
                    }
                  >
                    <ContentCompact />
                  </div>
                  <p
                    className={styles.itemLabel}
                    onClick={() =>
                      updateSettings({
                        navbarContentWidth: 'compact',
                        contentWidth: 'compact',
                        footerContentWidth: 'compact'
                      })
                    }
                  >
                    {t('settings.theme.layoutTypes.contents.compact')}
                  </p>
                </div>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, { [styles.active]: settings?.contentWidth === 'wide' })}
                    onClick={() =>
                      updateSettings({ navbarContentWidth: 'wide', contentWidth: 'wide', footerContentWidth: 'wide' })
                    }
                  >
                    <ContentWide />
                  </div>
                  <p
                    className={styles.itemLabel}
                    onClick={() =>
                      updateSettings({ navbarContentWidth: 'wide', contentWidth: 'wide', footerContentWidth: 'wide' })
                    }
                  >
                    {t('settings.theme.layoutTypes.contents.wide')}
                  </p>
                </div>
              </div>
            </div>
            {/* {!disableDirection && (
              <div className='flex flex-col gap-2'>
                <p className='font-medium'>Direction</p>
                <div className='flex items-center gap-4'>
                  <Link href={getLocalePath(pathName, 'en')}>
                    <div className='flex flex-col items-start gap-0.5'>
                      <div
                        className={classnames(styles.itemWrapper, {
                          [styles.active]: direction === 'ltr'
                        })}
                      >
                        <DirectionLtr />
                      </div>
                      <p className={styles.itemLabel}>
                        Left to Right <br />
                        (English)
                      </p>
                    </div>
                  </Link>
                  <Link href={getLocalePath(pathName, 'ar')}>
                    <div className='flex flex-col items-start gap-0.5'>
                      <div
                        className={classnames(styles.itemWrapper, {
                          [styles.active]: direction === 'rtl'
                        })}
                      >
                        <DirectionRtl />
                      </div>
                      <p className={styles.itemLabel}>
                        Right to Left <br />
                        (Arabic)
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </ScrollWrapper>
    </div>
  )
}

export default Customizer
