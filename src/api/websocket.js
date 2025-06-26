import { backendUrl } from '@/configs/routes'

const socketUrl = "://192.168.11.39:4002"

class WebSocketService {
  constructor() {
    this.ws = null
    this.subscribers = new Set()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect() {
    this.ws = new WebSocket(`ws${socketUrl}`)

    this.ws.onopen = () => {
      console.log('WebSocket Connected')

      // Send authentication message
      this.ws.send(
        JSON.stringify({
          action: 'report',
          token: 'diana'
        })
      )

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data)

        if (data.status === 200 && data.result) {
          // Transform the data to match the ReportCard component's expected format
          const transformedData = {
            name: data.result.first_name || '',
            last_name: data.result.last_name || '',
            national_code: data.result.national_code || '',
            access: data.result.access === 'allowed',
            gender: data.result.gender,
            user_image: null,
            api_image: data.result.api_image ? `http${socketUrl}${data.result.api_image}` : null,
            tmp_id: data.result.tmp_id
          }

          // Notify all subscribers
          this.subscribers.forEach(callback => callback(transformedData))
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error)
      }
    }

    this.ws.onerror = error => {
      console.error('WebSocket error:', error)
    }

    this.ws.onclose = () => {
      console.log('WebSocket Disconnected')

      // Implement exponential backoff for reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

        this.reconnectAttempts++

        console.log(`Attempting to reconnect in ${delay}ms (Attempt ${this.reconnectAttempts})`)
        setTimeout(() => this.connect(), delay)
      } else {
        console.error('Max reconnection attempts reached')
      }
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback)

    return () => this.subscribers.delete(callback)
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

export default WebSocketService
