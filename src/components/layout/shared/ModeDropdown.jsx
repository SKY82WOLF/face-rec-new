'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

import { useTranslation } from '@/translations/useTranslation'

const ModeDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const { settings, updateSettings } = useSettings()
  const { t } = useTranslation()

  // Only run client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClose = () => {
    setOpen(false)
    setTooltipOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleModeSwitch = mode => {
    handleClose()

    if (settings.mode !== mode) {
      updateSettings({ mode: mode })
    }
  }

  // Use consistent values for SSR
  const defaultIcon = 'tabler-device-laptop'
  const defaultText = t('settings.theme.system')

  // Only use dynamic values after component has mounted on client
  const getModeIcon = () => {
    if (!mounted) return defaultIcon

    if (settings.mode === 'system') {
      return 'tabler-device-laptop'
    } else if (settings.mode === 'dark') {
      return 'tabler-moon-stars'
    } else {
      return 'tabler-sun'
    }
  }

  const getModeText = () => {
    if (!mounted) return defaultText

    if (settings.mode === 'system') {
      return t('settings.theme.system')
    } else if (settings.mode === 'dark') {
      return t('settings.theme.dark')
    } else {
      return t('settings.theme.light')
    }
  }

  return (
    <>
      <Tooltip
        title={getModeText()}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
        open={open ? false : tooltipOpen ? true : false}
        slotProps={{ popper: { className: 'capitalize' } }}
      >
        <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
          <i className={getModeIcon()} />
        </IconButton>
      </Tooltip>
      {mounted && (
        <Popper
          open={open}
          transition
          disablePortal
          placement='bottom-start'
          anchorEl={anchorRef.current}
          className='min-is-[160px] !mbs-3 z-[1]'
        >
          {({ TransitionProps, placement }) => (
            <Fade
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top' }}
            >
              <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList onKeyDown={handleClose}>
                    <MenuItem
                      className='gap-3'
                      onClick={() => handleModeSwitch('light')}
                      selected={settings.mode === 'light'}
                    >
                      <i className='tabler-sun' />
                      {t('settings.theme.light')}
                    </MenuItem>
                    <MenuItem
                      className='gap-3'
                      onClick={() => handleModeSwitch('dark')}
                      selected={settings.mode === 'dark'}
                    >
                      <i className='tabler-moon-stars' />
                      {t('settings.theme.dark')}
                    </MenuItem>
                    <MenuItem
                      className='gap-3'
                      onClick={() => handleModeSwitch('system')}
                      selected={settings.mode === 'system'}
                    >
                      <i className='tabler-device-laptop' />
                      {t('settings.theme.system')}
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      )}
    </>
  )
}

export default ModeDropdown
