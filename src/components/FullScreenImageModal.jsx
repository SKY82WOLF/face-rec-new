import React, { useEffect, useState } from 'react'

import { Modal, Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap'

export default function FullScreenImageModal({ open, imageUrl, onClose }) {
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    if (!open) return

    const handleKey = e => {
      if (e.key === 'Escape') onClose && onClose()
      if (e.key === 'f') setIsZoomed(prev => !prev)
    }

    window.addEventListener('keydown', handleKey)

    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <Modal open={!!open} onClose={onClose}>
      <Box
        onClick={onClose}
        onContextMenu={e => {
          e.preventDefault()
          onClose && onClose()
        }}
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.9)',
          p: 2
        }}
      >
        <IconButton
          onClick={e => {
            e.stopPropagation()
            onClose && onClose()
          }}
          sx={{ position: 'fixed', top: 16, right: 16, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>

        <IconButton
          onClick={e => {
            e.stopPropagation()
            setIsZoomed(prev => !prev)
          }}
          sx={{ position: 'fixed', top: 16, right: 64, color: 'white' }}
        >
          {isZoomed ? <ZoomOutMapIcon /> : <ZoomInMapIcon />}
        </IconButton>

        <Box
          onClick={e => e.stopPropagation()}
          sx={{
            width: isZoomed ? '100%' : 'auto',
            height: isZoomed ? '100%' : 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={imageUrl}
            alt='Full'
            style={{
              maxWidth: isZoomed ? '100%' : '95%',
              maxHeight: isZoomed ? '100%' : '95%',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Box>
    </Modal>
  )
}
