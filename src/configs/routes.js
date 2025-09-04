// Base URLs and API Configuration
export let host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
export let port = typeof window !== 'undefined' ? window.location.port : '5555'
export let origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
export let protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'

// API URLs
export let frontUrl, backendUrl, backendImgUrl, backendImgUrl2

if (process.env.NEXT_PUBLIC_API_MODE === 'production') {
  // In production, use the device's IP address
  const deviceIP = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  frontUrl = `http://${deviceIP}`
  backendUrl = `http://${deviceIP}/api`
  backendImgUrl = `http://${deviceIP}`

  // For image assets served from device root (no trailing slash)
  backendImgUrl2 = `http://${deviceIP}`
} else if (process.env.NEXT_PUBLIC_API_MODE === 'remote') {
  // In remote mode, use the specified IP from environment variable
  const remoteIP = process.env.NEXT_PUBLIC_REMOTE_API_IP

  if (!remoteIP) {
    console.error('NEXT_PUBLIC_REMOTE_API_IP is not set in environment variables')
    frontUrl = 'http://localhost'
    backendUrl = 'http://localhost/api'
    backendImgUrl = 'http://localhost/'

    // Fallback to localhost root for image assets (no trailing slash)
    backendImgUrl2 = 'http://localhost'
  } else {
    // Use the full URL from the environment variable
    backendUrl = remoteIP

    // Remove trailing '/api' for non-API base URLs
    frontUrl = remoteIP.replace('/api', '')
    backendImgUrl = remoteIP.replace(':8585/api', '')

    // Image base should be the same host without '/api' and without trailing slash
    backendImgUrl2 = remoteIP.replace(':8585/api', '')
  }
} else {
  // Default to production mode if no mode is specified
  const deviceIP = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  frontUrl = `http://${deviceIP}`
  backendUrl = `http://${deviceIP}/api`
  backendImgUrl = `http://${deviceIP}`
}

// API Routes
export const API_ROUTES = {
  // Auth
  login: '/login',
  logout: '/logout',
  refreshToken: '/token/new-tokens',

  // Types
  types: {
    list: '/types',
    add: 'types/add'
  },

  // Persons
  persons: {
    list: '/persons',
    add: '/persons/add',
    update: '/persons/',
    delete: '/persons/',
    changeStatus: '/persons/change/status'
  },

  // Person Reports
  personReports: {
    list: '/Person-Reports',
    detail: '/Person-Reports/',
    update: '/Person-Reports/',
    delete: '/Person-Reports/',
    personReports: '/persons/Person-Reports'
  },

  // Users
  users: {
    list: '/users',
    create: '/users/add',
    update: '/users/',
    delete: '/users/'
  },
  groups: {
    list: '/groups',
    add: '/groups/add'
  },
  cameras: {
    list: '/cameras',
    detail: '/cameras/',
    add: '/cameras/add',
    update: '/cameras/',
    delete: '/cameras/',
    test: '/cameras/test'
  }
}

// Helper function to get full API URL
export const getApiUrl = route => {
  return `${backendUrl}${route}`
}

export const getBackendImgUrl = () => {
  return `${backendImgUrl}`
}

export const getBackendImgUrl2 = () => {
  // Always return a defined base without trailing slash
  if (backendImgUrl2) return `${backendImgUrl2}`

  if (typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'https:' : 'http:'
    const host = window.location.hostname

    return `${proto}//${host}`
  }

  return 'http://localhost'
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

export const { list: usersList, create: usersCreate, update: usersUpdate, delete: usersDelete } = API_ROUTES.users

export const { list: groupsList, add: groupsAdd } = API_ROUTES.groups

export const {
  list: camerasList,
  detail: camerasDetail,
  add: camerasAdd,
  update: camerasUpdate,
  delete: camerasDelete,
  test: camerasTest
} = API_ROUTES.cameras

export const { list: typesList, add: typesAdd } = API_ROUTES.types

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
