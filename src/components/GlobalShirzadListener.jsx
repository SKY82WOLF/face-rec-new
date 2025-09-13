'use client'

import { useEffect } from 'react'

import { playShirzadSound, playTalebiSound, playNokhostSound, playAtshiSound, playFatehiSound, playAmirSound, playMortezaSound, playsharifSound, playPezhmanSound, playSadriSound, playPayamaniSound, playKhanomSound } from '@/utils/sound'

// Listens globally for clicks on any element whose visible text includes "شیرزاد"
// Works for dynamically loaded content and API-rendered strings.
export default function GlobalShirzadListener() {
  useEffect(() => {
    // Only consider the element's own text nodes and ensure it's visible
    const getOwnVisibleText = el => {
      try {
        if (!el || el.nodeType !== 1) return ''

        const style = window.getComputedStyle(el)

        const isVisible =
          style &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          el.offsetParent !== null

        if (!isVisible) return ''

        const ownText = Array.from(el.childNodes)
          .filter(n => n.nodeType === 3)
          .map(n => String(n.nodeValue || ''))
          .join('')
          .trim()

        return ownText
      } catch {
        return ''
      }
    }

    const handleClick = event => {
      let current = event.target

      // Only trigger when the clicked element (or a very close ancestor)
      // has its OWN visible text containing the target word (Farsi or Latin)
      for (let i = 0; i < 4 && current; i += 1) {
        const ownText = getOwnVisibleText(current)

        if (ownText) {
          const lower = ownText.toLowerCase()

          if (ownText.includes('شیرزاد') || lower.includes('shirzad')) {
            playShirzadSound()
            break
          }

          // if (ownText.includes('طالبی') || lower.includes('talebi')) {
          //   playTalebiSound()
          //   break
          // }

          if (ownText.includes('نخست') || lower.includes('nokhost')) {
            playNokhostSound()
            break
          }

          if (
            ownText.includes('آتشی') ||
            lower.includes('atashi') ||
            ownText.includes('اتشی') ||
            lower.includes('atashi')
          ) {
            playAtshiSound()
            break
          }

          if (ownText.includes('فاتحی') || lower.includes('fatehi')) {
            playFatehiSound()
            break
          }

          if (ownText.includes('امیرحسین زارع') || lower.includes('zare')) {
            playAmirSound()
            break
          }

          if (ownText.includes('زارعی') || lower.includes('morteza zarei')) {
            playMortezaSound()
            break
          }

          if (ownText.includes('شریف زاده') || lower.includes('sharif')) {
            playsharifSound()
            break
          }

          if (ownText.includes('پژمان') || lower.includes('pezman')) {
            playPezhmanSound()
            break
          }

          if (ownText.includes('صدری') || lower.includes('sadri')) {
            playSadriSound()
            break
          }

          if (ownText.includes('پیامنی') || lower.includes('payamani')) {
            playPayamaniSound()
            break
          }

          if (ownText.includes('حسنی') || lower.includes('hasani') || ownText.includes('عطاران') || lower.includes('ataran')) {
            playKhanomSound()
            break
          }
        }

        current = current.parentElement
      }
    }

    window.addEventListener('click', handleClick, true)

    return () => {
      window.removeEventListener('click', handleClick, true)
    }
  }, [])

  return null
}
