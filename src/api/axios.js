import axios from 'axios'

import { backendUrl } from '@/configs/routes'
import { refreshTokens } from './auth'
import { toastError, toastSuccess } from '@/utils/toast'

const axiosInstance = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
})

let isRefreshing = false
let failedQueue = []
let toastShownForRequest = new Set()
let lastToastTime = 0

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

const getRequestKey = config => {
  // Create a more specific key that includes the full URL and method
  const url = config.url || ''
  const method = config.method || 'GET'
  const params = config.params ? JSON.stringify(config.params) : ''
  const data = config.data ? JSON.stringify(config.data) : ''

  return `${method}-${url}-${params}-${data}`
}

const shouldShowToast = (requestKey, config, isError = false) => {
  const now = Date.now()
  const timeSinceLastToast = now - lastToastTime

  // Don't show toast if:
  // 1. We've shown a toast for this exact request recently
  // 2. We've shown any toast in the last 3 seconds (to prevent spam)

  if (toastShownForRequest.has(requestKey) || timeSinceLastToast < 3000) {
    return false
  }

  // Check if this looks like a prefetch request
  const isPrefetch = () => {
    // TanStack Query often sends requests with specific patterns
    // Check for common prefetch indicators
    const hasPrefetchHeader = config.headers?.['x-prefetch']
    const hasPrefetchUrl = config.url?.includes('prefetch')
    const hasPrefetchMetadata = config.metadata?.isPrefetch
    const isBackgroundRequest = config.signal?.aborted === false && config.signal?.reason === 'prefetch'

    return hasPrefetchHeader || hasPrefetchUrl || hasPrefetchMetadata || isBackgroundRequest
  }

  if (isPrefetch()) {
    return false
  }

  return true
}

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')

  if (token) {
    config.headers.Authorization = `${token}`
  }

  return config
})

// Intercept 401s and refresh token once
axiosInstance.interceptors.response.use(
  response => {
    // Only show success toast for actual API calls, not for token refresh
    if (response.config && !response.config._isRetry) {
      const requestKey = getRequestKey(response.config)

      if (shouldShowToast(requestKey, response.config)) {
        toastSuccess('success')
        toastShownForRequest.add(requestKey)
        lastToastTime = Date.now()

        // Remove from set after 5 seconds to allow future toasts for same endpoint
        setTimeout(() => {
          toastShownForRequest.delete(requestKey)
        }, 5000)
      }
    }

    return response.data
  },
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: token => {
              originalRequest.headers.Authorization = `${token}`
              resolve(axiosInstance(originalRequest))
            },
            reject: err => reject(err)
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh_token = localStorage.getItem('refresh_token')

        if (!refresh_token) throw new Error('No refresh token')

        const response = await refreshTokens(refresh_token)
        const tokens = response?.results?.tokens || response?.tokens || response

        localStorage.setItem('access_token', tokens.access_token)
        localStorage.setItem('refresh_token', tokens.refresh_token)

        axiosInstance.defaults.headers.common.Authorization = `${tokens.access_token}`

        processQueue(null, tokens.access_token)

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'

        toastError(refreshError.response?.data?.message || 'error')

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Only show error toast for actual API calls, not for token refresh
    if (error.config && !error.config._isRetry) {
      const requestKey = getRequestKey(error.config)

      if (shouldShowToast(requestKey, error.config, true)) {
        toastError(error.response?.data?.message || 'error')
        toastShownForRequest.add(requestKey)
        lastToastTime = Date.now()

        // Remove from set after 5 seconds to allow future error toasts for same endpoint
        setTimeout(() => {
          toastShownForRequest.delete(requestKey)
        }, 5000)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
