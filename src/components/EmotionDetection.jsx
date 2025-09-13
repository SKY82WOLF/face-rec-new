
'use client'

import { useState, useEffect, useRef } from 'react'

import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material'

import { useTranslation } from '@/translations/useTranslation'

// ✨ 1. Switched back to the public, non-gated model
const MODEL_NAME = 'Xenova/facial_emotions_image_detection'

export default function EmotionDetection({ imageUrl }) {
  const { t } = useTranslation()
  const [emotion, setEmotion] = useState(null)
  const [emotions, setEmotions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const classifier = useRef(null)

  useEffect(() => {
    if (!imageUrl) {
      setEmotion(null)
      setEmotions([])
      setLoading(false)
      setError(null)

      return
    }

    const detectEmotion = async () => {
      setLoading(true)
      setEmotion(null)
      setEmotions([])
      setError(null)

      try {
        const { pipeline, env } = await import('@xenova/transformers')

        // Ensure the library fetches models from the internet
        env.allowLocalModels = false

        if (!classifier.current) {
          classifier.current = await pipeline('image-classification', MODEL_NAME)
        }

        // This model returns the top result by default
        const result = await classifier.current(imageUrl)

        if (result && result.length > 0) {
          // Since this model only returns one result, we can just use it directly
          setEmotions(result)
          setEmotion(result[0].label)
        } else {
          setError('Could not detect emotions')
        }
      } catch (err) {
        console.error('Emotion detection failed:', err)
        setError(err.message || 'Detection failed')
      } finally {
        setLoading(false)
      }
    }

    detectEmotion()
  }, [imageUrl])

  // Helper function to get color based on score
  const getEmotionColor = score => {
    if (score > 0.8) return 'success.main'
    if (score > 0.5) return 'warning.main'
    if (score > 0.3) return 'info.main'

    return 'text.secondary'
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          {t('reportCard.emotionAnalysis')}
        </Typography>

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
        ) : emotions.length > 0 ? (
          <Box sx={{ width: '100%' }}>
            <Typography variant='body1' sx={{ mb: 2 }}>
              {t('reportCard.primaryEmotion')}:{' '}
              <strong>{t(`reportCard.emotionLabels.${emotion?.toLowerCase()}`) || emotion}</strong>
            </Typography>

            {/* This will now only show the single detected emotion, but the UI is ready if you ever find a multi-score public model */}
            {emotions.map((item, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant='body2'>
                    {t(`reportCard.emotionLabels.${item.label.toLowerCase()}`) || item.label}
                  </Typography>
                  <Typography variant='body2' fontWeight={600} color={getEmotionColor(item.score)}>
                    {Math.round(item.score * 100)}%
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', backgroundColor: 'background.paper', borderRadius: 1, height: 8 }}>
                  <Box
                    sx={{
                      height: 'auto',
                      borderRadius: 1,
                      width: `${item.score * 100}%`,
                      bgcolor: getEmotionColor(item.score)
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' color='textSecondary'>
              {t('reportCard.noEmotionsDetected')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
