import { addReport, setConnectionStatus, setError } from '../slices/websocketSlice'
import { getDataWebSocketUrl, getImgWebSocketUrl, getBackendImgUrl } from '@/configs/routes'
import { toastError, toastSuccess } from '@/utils/toast'

export const websocketMiddleware = store => {
  let socket = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  const imgSocket = getImgWebSocketUrl()
  const backendImgUrl = getBackendImgUrl()
  let isFirstConnection = true
  let hasShownInitialToast = false

  const connect = () => {
    // Use the main ws url (for report)
    const wsUrl = getDataWebSocketUrl('/ws')

    socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log('WebSocket Connected:', wsUrl)
      store.dispatch(setConnectionStatus(true))
      store.dispatch(setError(null))
      reconnectAttempts = 0

      // Show success toast only once: on the first successful connection
      if (isFirstConnection && !hasShownInitialToast) {
        toastSuccess('success')
        hasShownInitialToast = true
      }

      isFirstConnection = false

      const token = localStorage.getItem('refresh_token')

      socket.send(JSON.stringify({ action: 'report', token: token }))
    }

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data)

        if (data.status === 200 && data.result) {
          const transformedData = {
            first_name: data.result.first_name || '',
            last_name: data.result.last_name || '',
            national_code: data.result.national_code || '',
            access_id: data.result.access_id,
            camera_id: data.result.camera_id,
            gender_id: data.result.gender_id,
            person_image: data.result.person_image ? `${backendImgUrl}/${data.result.person_image}` : null,
            last_person_image: data.result.last_person_image ? `${imgSocket}${data.result.last_person_image}` : null,
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
      console.error('WebSocket error:', error)
      store.dispatch(setError('WebSocket connection error'))

      // Only show error toast if the very first connection attempt fails
      if (isFirstConnection && !hasShownInitialToast) {
        toastError('networkError')
        hasShownInitialToast = true
      }
    }

    socket.onclose = () => {
      console.log('WebSocket Disconnected')
      store.dispatch(setConnectionStatus(false))

      // Attempt silent reconnects without toasts
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(10000 * Math.pow(2, reconnectAttempts), 30000)

        reconnectAttempts++
        console.log(`Attempting to reconnect in ${delay}ms (Attempt ${reconnectAttempts})`)
        setTimeout(() => connect(), delay)
      } else {
        store.dispatch(setError('Max reconnection attempts reached'))

        // No toast here to avoid noise once initial toast has already been shown
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
