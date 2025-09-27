'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

import { Modal, Box } from '@mui/material'

import { gsap } from 'gsap'

// AnimatedModal wraps MUI Modal and adds smooth open/close animations (overlay + content)
// Usage: <AnimatedModal open={open} onClose={handleClose}>{...existing modal content...}</AnimatedModal>
// It keeps the portal mounted during the close animation for a seamless exit.
const AnimatedModal = ({ open, onClose, children, ariaLabelledby, ariaDescribedby }) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const closingRef = useRef(false)
  const enterTlRef = useRef(null)
  const exitTlRef = useRef(null)
  const [entered, setEntered] = useState(false)

  const playEnter = useCallback(() => {
    // If an exit timeline is running, kill it so enter doesn't stutter
    if (exitTlRef.current) {
      exitTlRef.current.kill()
      exitTlRef.current = null
      closingRef.current = false
    }

    if (enterTlRef.current) {
      enterTlRef.current.kill()
      enterTlRef.current = null
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    const overlay = overlayRef.current
    const content = contentRef.current

    if (!overlay || !content) return

    gsap.set([overlay, content], { willChange: 'opacity, transform, filter' })
    gsap.set(overlay, { opacity: 0 })
    gsap.set(content, { opacity: 0, y: 18, scale: 0.96, filter: 'blur(6px)' })

    tl.to(overlay, { opacity: 1, duration: 0.28 })
    tl.to(content, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.42 }, '-=0.12')

    tl.eventCallback('onComplete', () => {
      gsap.set([overlay, content], { clearProps: 'willChange' })
      enterTlRef.current = null
      setEntered(true)
    })
    enterTlRef.current = tl
  }, [])

  const playExit = useCallback(done => {
    // Prevent double-triggering while exit animation is running
    if (closingRef.current) return

    // If an enter timeline is running, kill it to avoid conflicts
    if (enterTlRef.current) {
      enterTlRef.current.kill()
      enterTlRef.current = null
    }

    const overlay = overlayRef.current
    const content = contentRef.current

    // If DOM nodes are missing, just call done immediately
    if (!overlay || !content) {
      done?.()

      return
    }

    // Mark as closing *after* we've validated nodes so we don't get stuck
    closingRef.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    exitTlRef.current = tl

    // Only optimize will-change for animation; avoid clearing unrelated props
    gsap.set([overlay, content], { willChange: 'opacity, transform, filter' })

    tl.to(content, { opacity: 0, y: 10, scale: 0.985, filter: 'blur(4px)', duration: 0.25 })
    tl.to(overlay, { opacity: 0, duration: 0.22 }, '-=0.14')

    tl.eventCallback('onComplete', () => {
      // Clear only the willChange optimization so other inline styles remain intact
      gsap.set([overlay, content], { clearProps: 'willChange' })
      closingRef.current = false
      exitTlRef.current = null
      setEntered(false)
      done?.()
    })
  }, [])

  // Sync with external open prop
  useEffect(() => {
    if (open) {
      setShouldRender(true)

      // delay setting internalOpen to ensure portal mounts first
      requestAnimationFrame(() => {
        setInternalOpen(true)
        setEntered(false)

        // small timeout to ensure DOM nodes exist
        setTimeout(playEnter, 0)
      })
    } else if (shouldRender) {
      // run exit animation and then unmount
      playExit(() => {
        setInternalOpen(false)
        setShouldRender(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleBackdropClick = useCallback(() => {
    // play exit animation then notify parent to flip state
    playExit(() => {
      setInternalOpen(false)
      setShouldRender(false)
      onClose && onClose()
    })
  }, [onClose, playExit])

  if (!shouldRender && !internalOpen) return null

  return (
    <Modal
      open={internalOpen}
      onClose={handleBackdropClick}
      hideBackdrop
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
    >
      <Box
        ref={overlayRef}
        onClick={handleBackdropClick}
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(10, 10, 12, 0.55)',
          backdropFilter: 'blur(4px) saturate(120%)',
          WebkitBackdropFilter: 'blur(4px) saturate(120%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box
          ref={contentRef}
          onClick={e => e.stopPropagation()}
          sx={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            pointerEvents: 'auto',
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Modal>
  )
}

export default AnimatedModal
