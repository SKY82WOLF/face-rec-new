import axios from 'axios'

const getBaseURL = () => {
  const mode = process.env.NEXT_PUBLIC_API_MODE || 'production'

  if (mode === 'remote') {
    return process.env.NEXT_PUBLIC_REMOTE_API_URL
  }

  // Default to production mode
  const hostname = window.location.hostname

  return `http://${hostname}:5555/api`
}

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  response => response.data,
  error => {
    return Promise.reject(error)
  }
)

export default axiosInstance
