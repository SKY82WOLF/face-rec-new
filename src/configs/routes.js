// Base URLs and API Configuration
export let host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
export let port = typeof window !== 'undefined' ? window.location.port : '5555'
export let origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
export let protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'

// API URLs
export let frontUrl, backendUrl

if (process.env.NEXT_PUBLIC_API_MODE === 'production') {
  // In production, use the device's IP address
  const deviceIP = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  frontUrl = `http://${deviceIP}`
  backendUrl = `http://${deviceIP}:8585/api`
} else if (process.env.NEXT_PUBLIC_API_MODE === 'remote') {
  // In remote mode, use the specified IP from environment variable
  const remoteIP = process.env.NEXT_PUBLIC_REMOTE_API_IP

  if (!remoteIP) {
    console.error('NEXT_PUBLIC_REMOTE_API_IP is not set in environment variables')
    frontUrl = 'http://localhost'
    backendUrl = 'http://localhost/api'
  } else {
    // Use the full URL from the environment variable
    backendUrl = remoteIP

    // Remove /api from the end to get the frontend URL
    frontUrl = remoteIP.replace('/api', '')
  }
} else {
  // Default to production mode if no mode is specified
  const deviceIP = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  frontUrl = `http://${deviceIP}`
  backendUrl = `http://${deviceIP}:8585/api`
}

// API Routes
export const API_ROUTES = {
  // Auth
  login: '/login',
  logout: '/logout',
  refreshToken: '/token/new-tokens',

  // Persons
  persons: {
    list: '/persons',
    add: '/persons/add',
    update: '/persons/',
    delete: '/persons/',
    changeStatus: '/persons/change/status'
  },

  // Users
  users: {
    list: '/users',
    create: '/users/create'
  },
  groups: {
    list: '/groups'
  }
}

// Helper function to get full API URL
export const getApiUrl = route => {
  return `${backendUrl}${route}`
}

// Helper function to get full frontend URL
export const getFrontendUrl = route => {
  return `${frontUrl}${route}`
}

// Export all routes as constants
export const { login, logout, refreshToken } = API_ROUTES

export const {
  list: personsList,
  add: personsAdd,
  update: personsUpdate,
  delete: personsDelete,
  changeStatus: personsChangeStatus
} = API_ROUTES.persons

export const { list: usersList, create: usersCreate } = API_ROUTES.users

export const { list: groupsList } = API_ROUTES.groups

// WebSocket URL helpers for data and live
export function getDataWebSocketUrl() {
  let wsProtocol = 'ws:'
  let wsHost = 'localhost'
  let wsPath = '/ws/'

  if (typeof window !== 'undefined') {
    wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    wsHost = window.location.hostname
  }

  if (process.env.NEXT_PUBLIC_API_MODE === 'production') {
    wsHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

    return `${wsProtocol}//${wsHost}${wsPath}`
  } else if (process.env.NEXT_PUBLIC_API_MODE === 'remote') {
    const remoteDataWs = process.env.NEXT_PUBLIC_REMOTE_DATA_WS

    if (remoteDataWs) {
      return remoteDataWs
    }

    return `${wsProtocol}//localhost${wsPath}`
  } else {
    wsHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

    return `${wsProtocol}//${wsHost}${wsPath}`
  }
}

export function getLiveWebSocketUrl() {
  let httpProtocol = 'http:'
  let host = 'localhost'
  let path = '/live/'

  if (typeof window !== 'undefined') {
    httpProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
    host = window.location.hostname
  }

  if (process.env.NEXT_PUBLIC_API_MODE === 'production') {
    host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

    return `${httpProtocol}//${host}${path}`
  } else if (process.env.NEXT_PUBLIC_API_MODE === 'remote') {
    const remoteLiveImg = process.env.NEXT_PUBLIC_REMOTE_LIVE_WS

    if (remoteLiveImg) {
      return remoteLiveImg
    }

    return `${httpProtocol}//localhost${path}`
  } else {
    host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

    return `${httpProtocol}//${host}${path}`
  }
}

export function getImgWebSocketUrl() {
  let wsProtocol = 'http:'
  let wsHost = 'localhost'
  let wsPath = '/'

  if (typeof window !== 'undefined') {
    wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    wsHost = window.location.hostname
  }

  if (process.env.NEXT_PUBLIC_API_MODE === 'production') {
    wsHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

    return `${wsProtocol}//${wsHost}${wsPath}`
  } else if (process.env.NEXT_PUBLIC_API_MODE === 'remote') {
    const remoteDataWs = process.env.NEXT_PUBLIC_REMOTE_IMG_WS

    if (remoteDataWs) {
      return remoteDataWs
    }

    return `${wsProtocol}//localhost${wsPath}`
  } else {
    wsHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

    return `${wsProtocol}//${wsHost}${wsPath}`
  }
}
