import { addReport, setConnectionStatus, setError } from '../slices/websocketSlice'

const socketUrl = '://192.168.11.39:4002'
const picUrl = '://192.168.11.39/'

export const websocketMiddleware = store => {
  let socket = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5

  const connect = () => {
    socket = new WebSocket(`ws${socketUrl}`)

    socket.onopen = () => {
      console.log('WebSocket Connected')
      store.dispatch(setConnectionStatus(true))
      store.dispatch(setError(null))
      reconnectAttempts = 0

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
            name: data.result.first_name || '',
            last_name: data.result.last_name || '',
            national_code: data.result.national_code || '',
            access: data.result.access === 'allowed',
            gender: data.result.gender,
            profile_image: null,
            last_image: data.result.api_image ? `http${picUrl}${data.result.api_image}` : null,
            id: data.result.tmp_id || '', // Keep id for display
            index: data.result.index || `index_${Date.now()}_${Math.random()}` // Use index for uniqueness, fallback if missing
          }

          // console.log('Transformed data:', transformedData)
          store.dispatch(addReport(transformedData))
          
          // console.log('Redux state after addReport:', store.getState().websocket.reports)
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error)
        store.dispatch(setError('Error parsing WebSocket data'))
      }
    }

    socket.onerror = error => {
      console.error('WebSocket error:', error)
      store.dispatch(setError('WebSocket connection error'))
    }

    socket.onclose = () => {
      console.log('WebSocket Disconnected')
      store.dispatch(setConnectionStatus(false))

      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)

        reconnectAttempts++
        console.log(`Attempting to reconnect in ${delay}ms (Attempt ${reconnectAttempts})`)
        setTimeout(() => connect(), delay)
      } else {
        store.dispatch(setError('Max reconnection attempts reached'))
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
