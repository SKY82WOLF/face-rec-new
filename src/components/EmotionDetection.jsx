'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material'
import * as faceapi from 'face-api.js'

import { useTranslation } from '@/translations/useTranslation'

export default function EmotionDetection({ imageUrl }) {
  const { t } = useTranslation()
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [detection, setDetection] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const imgRef = useRef()

  // Effect for loading the models once
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
        ])
        setModelsLoaded(true)
      } catch (err) {
        console.error('Failed to load models:', err)
        setError('Failed to load models')
      }
    }

    loadModels()
  }, [])

  // The main detection logic
  const detectFace = useCallback(async () => {
    if (modelsLoaded && imgRef.current && imgRef.current.complete) {
      setLoading(true)
      setError(null)
      setDetection(null)

      const htmlImageElement = imgRef.current

      try {
        // ✨ TWEAK HERE: Setting inputSize and a very low scoreThreshold
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 512, // Must be a multiple of 32, e.g., 128, 160, 224, 320, 416, 512, 608
          scoreThreshold: 0.5 // Lowered even further
        })

        const result = await faceapi
          .detectSingleFace(htmlImageElement, options)
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender()

        if (result) {
          setDetection(result)
        } else {
          setError('تشخیص چهره در تصویر موفقیت آمیز نبود.')
        }
      } catch (err) {
        console.error('Face detection process failed:', err)
        setError('تشخیص چهره در تصویر موفقیت آمیز نبود.')
      } finally {
        setLoading(false)
      }
    }
  }, [modelsLoaded])

  // Effect to run detection when the image URL changes or models finish loading
  useEffect(() => {
    if (imageUrl && modelsLoaded) {
      if (imgRef.current) {
        const handleLoad = () => {
          detectFace()
        }

        const currentImgRef = imgRef.current

        // Add event listener before setting src to handle cached images
        currentImgRef.addEventListener('load', handleLoad)
        currentImgRef.src = imageUrl

        // If the image is already complete (from cache), trigger detection manually
        if (currentImgRef.complete) {
          handleLoad()
        }

        return () => {
          currentImgRef.removeEventListener('load', handleLoad)
        }
      }
    }
  }, [imageUrl, modelsLoaded, detectFace])

  const getEmotionColor = score => {
    if (score > 0.8) return 'success.main'
    if (score > 0.5) return 'warning.main'
    if (score > 0.3) return 'info.main'

    return 'text.secondary'
  }

  const renderExpressions = () => {
    if (!detection || !detection.expressions) return null
    const expressions = Object.entries(detection.expressions)
    const [primaryEmotion] = expressions.reduce((a, b) => (a[1] > b[1] ? a : b))

    return (
      <Box>
        <Typography variant='body1' sx={{ mb: 2 }}>
          {t('reportCard.primaryEmotion')}:{' '}
          <strong>{t(`reportCard.emotionLabels.${primaryEmotion?.toLowerCase()}`) || primaryEmotion}</strong>
        </Typography>
        {expressions.map(([emotion, score]) => (
          <Box key={emotion} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2'>
                {t(`reportCard.emotionLabels.${emotion.toLowerCase()}`) || emotion}
              </Typography>
              <Typography variant='body2' fontWeight={600} color={getEmotionColor(score)}>
                {Math.round(score * 100)}%
              </Typography>
            </Box>
            <Box sx={{ width: '100%', backgroundColor: 'background.paper', borderRadius: 1, height: 8 }}>
              <Box
                sx={{
                  height: '100%',
                  borderRadius: 1,
                  width: `${score * 100}%`,
                  bgcolor: getEmotionColor(score)
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          {t('reportCard.emotionAnalysis')}
        </Typography>
        <img ref={imgRef} alt='face for analysis' style={{ display: 'none' }} crossOrigin='anonymous' />
        {!imageUrl ? (
          <Box sx={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' color='textSecondary'>
              {t('reportCard.noImageProvided')}
            </Typography>
          </Box>
        ) : loading ? (
          <Box sx={{ minHeight: 40, display: 'flex', alignItems: 'center', width: '100%' }}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        ) : error ? (
          <Box sx={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' color='error'>
              {error}
            </Typography>
          </Box>
        ) : detection ? (
          <Box sx={{ width: '100%' }}>
            <Typography>{t('reportCard.age')}: {Math.round(detection.age)}</Typography>
            <Typography>{t('reportCard.gender')}: {detection.gender === 'male' ? t('reportCard.male') : t('reportCard.female')}</Typography>
            {renderExpressions()}
          </Box>
        ) : (
          !loading &&
          modelsLoaded && (
            <Box sx={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
              <Typography variant='body2' color='textSecondary'>
                {t('reportCard.noEmotionsDetected')}
              </Typography>
            </Box>
          )
        )}
      </CardContent>
    </Card>
  )
}
