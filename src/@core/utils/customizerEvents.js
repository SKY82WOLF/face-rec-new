'use client'

// Simple event system to communicate between components
const createEventSystem = () => {
  let listeners = {}

  const dispatch = (eventName, data) => {
    if (!listeners[eventName]) return

    listeners[eventName].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error)
      }
    })
  }

  const subscribe = (eventName, callback) => {
    if (!listeners[eventName]) {
      listeners[eventName] = []
    }

    listeners[eventName].push(callback)

    // Return unsubscribe function
    return () => {
      listeners[eventName] = listeners[eventName].filter(cb => cb !== callback)

      if (listeners[eventName].length === 0) {
        delete listeners[eventName]
      }
    }
  }

  return {
    dispatch,
    subscribe
  }
}

// Create single instance of the event system
const customizerEvents = createEventSystem()

// Event name constants
export const CUSTOMIZER_EVENTS = {
  TOGGLE_CUSTOMIZER: 'toggle_customizer'
}

export default customizerEvents
