import { addReport, setConnectionStatus, setError } from '../slices/websocketSlice'
import { getDataWebSocketUrl, getBackendImgUrl2, getBackendImgUrl } from '@/configs/routes'
import { toastError, toastSuccess } from '@/utils/toast'
import { logout as apiLogout } from '@/api/auth'

export const websocketMiddleware = store => {
  let socket = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  const imageBaseUrl = getBackendImgUrl2()
  const imageBaseUrl2 = getBackendImgUrl()
  let isFirstConnection = true
  let hasShownInitialToast = false

  // Prevent reconnects after an intentional disconnect
  let shouldReconnect = true

  // Track connection instances to ignore stale event handlers
  let currentConnectionId = 0

  const connect = () => {
    const wsUrl = getDataWebSocketUrl('/ws')

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connecting or open, skipping new connect')

      return
    }

    shouldReconnect = true
    currentConnectionId += 1
    const connectionId = currentConnectionId

    socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      if (connectionId !== currentConnectionId) return

      console.log('WebSocket Connected:', wsUrl)
      store.dispatch(setConnectionStatus(true))
      store.dispatch(setError(null))
      reconnectAttempts = 0

      if (isFirstConnection && !hasShownInitialToast) {
        toastSuccess('success')
        hasShownInitialToast = true
      }

      isFirstConnection = false

      const token = localStorage.getItem('refresh_token')

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: 'report', token: token }))
      }
    }

    socket.onmessage = event => {
      if (connectionId !== currentConnectionId) return

      try {
        const data = JSON.parse(event.data)

        if (data.status === 401 || data.message === 'Authentication failed' || data.message === 'Invalid token') {
          console.warn('WebSocket authentication failed, logging out')
          shouldReconnect = false

          try {
            apiLogout()
          } catch (e) {
            console.error('Failed to call API logout:', e)
          }

          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          localStorage.removeItem('permissions')
          localStorage.removeItem('sidebar_nav')

          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }

          return
        }

        if (data.status === 200 && data.result) {
          const joinUrl = path => {
            if (!path) return null
            if (typeof path === 'string' && path.startsWith('http')) return path

            if (typeof path === 'string') {
              if (path.includes('/assets')) {
                return `${imageBaseUrl}${path}`
              } else if (path.includes('/uploads')) {
                return `${imageBaseUrl2}${path}`
              }
            }

            return null
          }

          const transformedData = {
            first_name: data.result.first_name || '',
            last_name: data.result.last_name || '',
            national_code: data.result.national_code || '',
            access_id: data.result.access_id,
            camera_id: data.result.camera_id,
            gender_id: data.result.gender_id,
            person_image: joinUrl(data.result.person_image),
            last_person_image: joinUrl(data.result.last_person_image),
            person_id: data.result.person_id || '',
            index: data.result.index || `index_${Date.now()}_${Math.random()}`,
            feature_vector: data.result.feature_vector,
            last_person_report_id: data.result.last_person_report_id,
            image_quality: data.result.image_quality,
            date: data.result.created_at
          }

          store.dispatch(addReport(transformedData))
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error)
        store.dispatch(setError('Error parsing WebSocket data'))
        toastError('error')
      }
    }

    socket.onerror = error => {
      if (connectionId !== currentConnectionId) return

      console.error('WebSocket error:', error)
      store.dispatch(setError('WebSocket connection error'))

      if (isFirstConnection && !hasShownInitialToast) {
        toastError('networkError')
        hasShownInitialToast = true
      }
    }

    socket.onclose = () => {
      if (connectionId !== currentConnectionId) return

      console.log('WebSocket Disconnected')
      store.dispatch(setConnectionStatus(false))

      if (shouldReconnect) {
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(10000 * Math.pow(2, reconnectAttempts), 30000)

          reconnectAttempts++
          console.log(`Attempting to reconnect in ${delay}ms (Attempt ${reconnectAttempts})`)
          setTimeout(() => connect(), delay)
        } else {
          store.dispatch(setError('Max reconnection attempts reached'))
        }
      }
    }
  }

  return next => action => {
    switch (action.type) {
      case 'websocket/connect':
        if (!socket || socket.readyState === WebSocket.CLOSED) {
          connect()
        }

        break
      case 'websocket/disconnect':
        if (socket) {
          socket.close()
          socket = null
        }

        break
      default:
        return next(action)
    }
  }
}
