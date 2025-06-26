import axios from 'axios'

import { login as loginRoute, logout as logoutRoute, refreshToken, backendUrl } from '@/configs/routes'

// This axios has NO interceptors
const rawAxios = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const login = async (username, password) => {
  try {
    const response = await rawAxios.post(loginRoute, {
      username,
      password
    })

    return response.data
  } catch (error) {
    throw error
  }
}

export const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token')

  if (!refreshToken) return

  try {
    await rawAxios.post(logoutRoute, { refresh: refreshToken })
  } catch (err) {
    // You can ignore error or log it
    console.error('Logout error:', err)
  }
}

export const refreshTokens = async refreshTokenValue => {
  try {
    const response = await rawAxios.post(refreshToken, {
      refresh: refreshTokenValue
    })

    return response.data // Always access `.data` here
  } catch (error) {
    throw error
  }
}
