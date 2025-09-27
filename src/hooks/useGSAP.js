import { useEffect } from 'react'

import { gsap } from 'gsap'

// General purpose hook to run a gsap animation inside a ref-scoped context
export function useGSAP(scopeRef, animationFactory, deps = []) {
  useEffect(() => {
    if (!scopeRef || !scopeRef.current) return undefined

    const ctx = gsap.context(() => {
      animationFactory(gsap)
    }, scopeRef.current)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// Small helper to create hover in/out animations tied to a set of refs
export function useHoverMotion({ cardRef, imageRef, detailsRef } = {}) {
  const hoverIn = () => {
    const el = cardRef?.current
    const img = imageRef?.current
    const details = detailsRef?.current

    // If mount animation still running, finish it first to avoid half states
    if (el && el.dataset && el.dataset.motionDone === '0') {
      gsap.killTweensOf(el)
      gsap.set(el, { opacity: 1, y: 0, scale: 1 })

      if (img) {
        gsap.killTweensOf(img)
        gsap.set(img, { scale: 1, filter: 'blur(0px)', opacity: 1 })
      }

      if (details) {
        gsap.killTweensOf(details)
        gsap.set(details, { y: 0, opacity: 1 })
      }

      el.dataset.motionDone = '1'
    }

    if (el) {
      gsap.killTweensOf(el)
      gsap.to(el, { y: -6, duration: 0.16, ease: 'power3.out', overwrite: true })
    }

    if (img) {
      gsap.killTweensOf(img)
      gsap.to(img, { scale: 1.03, duration: 0.18, ease: 'power3.out', overwrite: true })
    }

    if (details) {
      gsap.killTweensOf(details)
      gsap.to(details, { y: -6, duration: 0.14, ease: 'power3.out', overwrite: true })
    }
  }

  const hoverOut = () => {
    const el = cardRef?.current
    const img = imageRef?.current
    const details = detailsRef?.current

    if (el && el.dataset && el.dataset.motionDone === '0') {
      // ensure mount animation is completed on early hover leave
      gsap.killTweensOf(el)
      gsap.set(el, { opacity: 1, y: 0, scale: 1 })

      if (img) {
        gsap.killTweensOf(img)
        gsap.set(img, { scale: 1, filter: 'blur(0px)', opacity: 1 })
      }

      if (details) {
        gsap.killTweensOf(details)
        gsap.set(details, { y: 0, opacity: 1 })
      }

      el.dataset.motionDone = '1'
    }

    if (el) gsap.to(el, { y: 0, duration: 0.18, ease: 'power3.out', overwrite: true })
    if (img) gsap.to(img, { scale: 1, duration: 0.18, ease: 'power3.out', overwrite: true })
    if (details) gsap.to(details, { y: 0, duration: 0.14, ease: 'power3.out', overwrite: true })
  }

  return { hoverIn, hoverOut }
}

export default useGSAP
