import { configureStore } from '@reduxjs/toolkit'

import websocketReducer from './slices/websocketSlice'
import typesReducer from './slices/typesSlice'
import permissionsReducer from './slices/permissionsSlice'
import { websocketMiddleware } from './middleware/websocketMiddleware'

// Helper to extract codenames from nested sidebar/permissions structure
const extractCodenames = permissions => {
  const set = new Set()

  if (!Array.isArray(permissions)) return []

  permissions.forEach(category => {
    if (category && category.codename) set.add(category.codename)

    if (category && Array.isArray(category.permissions)) {
      category.permissions.forEach(p => {
        if (p && p.codename) set.add(p.codename)
      })
    }
  })

  return Array.from(set)
}

// Load permissions from localStorage when available (client-side only)
const loadPreloadedPermissionsState = () => {
  if (typeof window === 'undefined') return undefined

  try {
    const raw = localStorage.getItem('permissions')

    if (!raw) return undefined

    const sidebar = JSON.parse(raw)

    return {
      original: Array.isArray(sidebar) ? sidebar : [],
      codenames: extractCodenames(sidebar),
      loading: false
    }
  } catch (e) {
    return undefined
  }
}

const preloadedState = {
  permissions: loadPreloadedPermissionsState()
}

export const store = configureStore({
  reducer: {
    websocket: websocketReducer,
    types: typesReducer,
    permissions: permissionsReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(websocketMiddleware),
  preloadedState
})

// Persist permissions.original back to localStorage on changes (client-side only)
if (typeof window !== 'undefined') {
  let lastSerialized = null

  store.subscribe(() => {
    const state = store.getState()
    const current = state?.permissions?.original ?? []

    try {
      const serialized = JSON.stringify(current)

      if (serialized !== lastSerialized) {
        localStorage.setItem('permissions', serialized)
        lastSerialized = serialized
      }
    } catch (e) {
      // ignore persistence errors
    }
  })
}

export default store
