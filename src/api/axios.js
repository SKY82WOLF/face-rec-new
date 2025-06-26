import axios from 'axios'

import { backendUrl } from '@/configs/routes'
import { refreshTokens } from './auth'

const axiosInstance = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
})

let isRefreshing = false
let failedQueue = []

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

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')

  if (token) {
    config.headers.Authorization = `${token}`
  }

  return config
})

// Intercept 401s and refresh token once
axiosInstance.interceptors.response.use(
  response => response.data,
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

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }

)

export default axiosInstance
