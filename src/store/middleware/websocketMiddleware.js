import { addReport, setConnectionStatus, setError } from '../slices/websocketSlice'
import { getDataWebSocketUrl, getImgWebSocketUrl } from '@/configs/routes'
import { toastError, toastSuccess } from '@/utils/toast'

export const websocketMiddleware = store => {
  let socket = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  const imgSocket = getImgWebSocketUrl()
  let isFirstConnection = true
  let hasShownConnectionToast = false

  const connect = () => {
    // Use the main ws url (for report)
    const wsUrl = getDataWebSocketUrl('/ws')

    socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log('WebSocket Connected:', wsUrl)
      store.dispatch(setConnectionStatus(true))
      store.dispatch(setError(null))
      reconnectAttempts = 0

      // Only show success toast on very first connection, not on reconnections
      if (isFirstConnection && !hasShownConnectionToast) {
        toastSuccess('success')
        hasShownConnectionToast = true
      }

      isFirstConnection = false

      socket.send(JSON.stringify({ action: 'report', token: 'diana' }))
    }

    socket.onmessage = event => {
      // console.log('WebSocket message received:', event.data)

      try {
        const data = JSON.parse(event.data)

        // console.log('Parsed WebSocket data:', data)
        // console.log('Result data:', data.result)
        // console.log('Report index:', data.result?.index)

        if (data.status === 200 && data.result) {
          const transformedData = {
            first_name: data.result.first_name || '',
            last_name: data.result.last_name || '',
            national_code: data.result.national_code || '',
            access: data.result.access === 'allowed',
            gender: data.result.gender,
            profile_image: data.result.profile_image ? `${imgSocket}${data.result.profile_image}` : null,
            last_image: data.result.last_image ? `${imgSocket}${data.result.last_image}` : null,
            id: data.result.id || '',
            index: data.result.index || `index_${Date.now()}_${Math.random()}`,
            feature_vector: data.result.feature_vector,
            report_id: data.result.report_id,
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

      // Only show error toast on first connection attempt
      if (isFirstConnection) {
        toastError('networkError')
      }
    }

    socket.onclose = () => {
      console.log('WebSocket Disconnected')
      store.dispatch(setConnectionStatus(false))

      // Don't show error toast on reconnection attempts
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(10000 * Math.pow(2, reconnectAttempts), 30000)

        reconnectAttempts++
        console.log(`Attempting to reconnect in ${delay}ms (Attempt ${reconnectAttempts})`)
        setTimeout(() => connect(), delay)
      } else {
        store.dispatch(setError('Max reconnection attempts reached'))

        // Only show final error toast if we haven't shown connection toast yet
        if (!hasShownConnectionToast) {
          toastError('networkError')
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
