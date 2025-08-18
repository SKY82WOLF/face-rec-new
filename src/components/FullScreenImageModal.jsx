import React from 'react'

import { Modal, Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function FullScreenImageModal({ open, imageUrl, onClose }) {
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
          bgcolor: 'rgba(0,0,0,0.9)'
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
        <img
          src={imageUrl}
          alt='Full'
          style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }}
          onClick={e => e.stopPropagation()}
        />
      </Box>
    </Modal>
  )
}
