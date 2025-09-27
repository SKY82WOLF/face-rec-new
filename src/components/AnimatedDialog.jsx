'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

import { Dialog } from '@mui/material'

import { gsap } from 'gsap'

// AnimatedDialog mirrors AnimatedModal animations while remaining API-compatible with MUI Dialog.
// It animates the native Backdrop and Paper, so default Dialog styling/backgrounds remain intact.
const AnimatedDialog = ({ open, onClose, children, ariaLabelledby, ariaDescribedby, ...dialogProps }) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const overlayRef = useRef(null) // Backdrop element
  const contentRef = useRef(null) // Paper element
  const closingRef = useRef(false)
  const enterTlRef = useRef(null)
  const exitTlRef = useRef(null)
  const [entered, setEntered] = useState(false)

  const playEnter = useCallback(() => {
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
    if (closingRef.current) return

    if (enterTlRef.current) {
      enterTlRef.current.kill()
      enterTlRef.current = null
    }

    const overlay = overlayRef.current
    const content = contentRef.current

    if (!overlay || !content) {
      done?.()

      return
    }

    closingRef.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    exitTlRef.current = tl

    gsap.set([overlay, content], { willChange: 'opacity, transform, filter' })

    tl.to(content, { opacity: 0, y: 10, scale: 0.985, filter: 'blur(4px)', duration: 0.25 })
    tl.to(overlay, { opacity: 0, duration: 0.22 }, '-=0.14')

    tl.eventCallback('onComplete', () => {
      gsap.set([overlay, content], { clearProps: 'willChange' })
      closingRef.current = false
      exitTlRef.current = null
      setEntered(false)
      done?.()
    })
  }, [])

  useEffect(() => {
    if (open) {
      setShouldRender(true)

      requestAnimationFrame(() => {
        setInternalOpen(true)
        setEntered(false)

        setTimeout(playEnter, 0)
      })
    } else if (shouldRender) {
      playExit(() => {
        setInternalOpen(false)
        setShouldRender(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleClose = useCallback(() => {
    playExit(() => {
      setInternalOpen(false)
      setShouldRender(false)
      onClose && onClose()
    })
  }, [onClose, playExit])

  if (!shouldRender && !internalOpen) return null

  // Merge user-provided PaperProps/BackdropProps to preserve styling and capture refs for animation
  const userPaperProps = dialogProps.PaperProps || {}

  const mergedPaperProps = {
    ...userPaperProps,
    ref: contentRef,
    sx: {
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      opacity: entered ? 1 : 0,
      ...userPaperProps.sx
    }
  }

  const userBackdropProps = dialogProps.BackdropProps || {}

  const mergedBackdropProps = {
    ...userBackdropProps,
    ref: overlayRef,
    sx: {
      bgcolor: 'rgba(10, 10, 12, 0.55)',
      backdropFilter: 'blur(4px) saturate(120%)',
      WebkitBackdropFilter: 'blur(4px) saturate(120%)',
      opacity: entered ? 1 : 0,
      ...userBackdropProps.sx
    }
  }

  return (
    <Dialog
      open={internalOpen}
      onClose={handleClose}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      PaperProps={mergedPaperProps}
      BackdropProps={mergedBackdropProps}
      {...dialogProps}
    >
      {children}
    </Dialog>
  )
}

export default AnimatedDialog
