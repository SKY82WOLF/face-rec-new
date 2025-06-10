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
  backendUrl = `http://${deviceIP}/api`
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
  backendUrl = `http://${deviceIP}/api`
}

// API Routes
export const API_ROUTES = {
  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  refreshToken: '/auth/refresh',

  // Persons
  persons: {
    list: '/persons',
    add: '/persons/add',
    update: '/persons/update',
    delete: '/persons/delete',
    changeStatus: '/persons/change/status'
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
