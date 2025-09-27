import React, { forwardRef } from 'react'

import { Box } from '@mui/material'

import { gsap } from 'gsap'

import { useGSAP, useHoverMotion } from '@/hooks/useGSAP'

// MotionContainer provides mount animation and exposes refs for children
export const MotionContainer = forwardRef(({ children, index = 0, sx = {}, ...props }, ref) => {
  // useGSAP will animate the supplied ref
  useGSAP(ref, () => {
    const el = ref.current

    if (!el) return

    // If caller didn't pass an explicit index, compute visual index among siblings
    let idx = typeof index === 'number' ? index : -1

    if (idx === -1) {
      const siblings = el.parentElement?.querySelectorAll('[data-motion-item]') || []

      idx = Array.prototype.indexOf.call(siblings, el)
    }

    const baseDelay = Math.min(Math.max(idx * 0.08, 0), 1.5)

    // mark in-progress to coordinate with hover logic
    el.dataset.motionDone = '0'

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: baseDelay })

    // fromTo ensures consistent start regardless of inherited styles; transforms don't affect layout
    tl.fromTo(el, { opacity: 0, y: 18, scale: 0.995 }, { opacity: 1, y: 0, scale: 1, duration: 0.5 })

    const img = el.querySelector('[data-gsap-image]')
    const details = el.querySelector('[data-gsap-details]')

    if (img)
      tl.fromTo(
        img,
        { scale: 1.04, filter: 'blur(6px)', opacity: 0.92 },
        { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.7 },
        '-=0.36'
      )
    if (details) tl.fromTo(details, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.45')

    tl.eventCallback('onComplete', () => {
      el.dataset.motionDone = '1'
    })
  }, [index])

  return (
    <Box ref={ref} data-motion-item sx={{ opacity: 0, transform: 'translateY(18px) scale(0.995)', ...sx }} {...props}>
      {children}
    </Box>
  )
})

// HoverWrapper gives easy props to attach hover animations
export const HoverWrapper = forwardRef(({ children, cardRef, imageRef, detailsRef, sx = {}, ...props }, ref) => {
  const { hoverIn, hoverOut } = useHoverMotion({ cardRef, imageRef, detailsRef })

  return (
    <Box
      ref={ref}
      onMouseEnter={hoverIn}
      onMouseLeave={hoverOut}
      sx={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', ...sx }}
      {...props}
    >
      {children}
    </Box>
  )
})

export default MotionContainer
