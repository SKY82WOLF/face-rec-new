// MenuItemWithHover.js
'use client'

import { styled } from '@mui/material/styles'

import MenuItem from './MenuItem'

// Style wrapper for MenuItem; background pattern is rendered via an inner element
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  transition: 'all 0.3s ease',

  '& .menu-pattern': {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0,
    transition: 'none',
    color: theme.palette.primary.contrastText,
    zIndex: 0
  },

  '& .menu-pattern i': {
    position: 'absolute',
    fontSize: '0.85rem',
    lineHeight: 1,
    opacity: 0.8
  },

  '&:hover, &.active': {
    // NEW: More vibrant and visible diagonal gradient
    background: `linear-gradient(110deg, ${theme.palette.primary.main} 15%, ${theme.palette.primary.light} 120%)`,
    color: theme.palette.primary.contrastText,

    '& .menu-pattern': {
      opacity: 0.3,
      transition: 'opacity 0.3s ease-in'
    }
  },

  // Ensure icon and text are above the background element
  '& > *': {
    position: 'relative',
    zIndex: 1
  }
}))

// NEW: Pattern starts near the center and spreads towards the left
const SCATTER_POSITIONS = [
  { left: '55%', top: '55%', rotate: 15 },
  { left: '48%', top: '30%', rotate: -5 },
  { left: '45%', top: '75%', rotate: -10 },
  { left: '35%', top: '35%', rotate: 25 },
  { left: '28%', top: '75%', rotate: -20 },
  { left: '18%', top: '25%', rotate: -15 },
  { left: '15%', top: '65%', rotate: 5 },
  { left: '5%', top: '40%', rotate: 10 }
]

const PatternedMenuItem = ({ pattern, children, icon, ...rest }) => {
  return (
    <StyledMenuItem {...rest} icon={icon}>
      {/* background icons that match the sidebar icon class */}
      {pattern ? (
        <span className='menu-pattern'>
          {SCATTER_POSITIONS.map((pos, idx) => (
            <i
              key={idx}
              className={pattern}
              style={{ left: pos.left, top: pos.top, transform: `rotate(${pos.rotate}deg)` }}
            />
          ))}
        </span>
      ) : null}
      {children}
    </StyledMenuItem>
  )
}

export default PatternedMenuItem
