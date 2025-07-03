import { usersCreate, usersList } from '@/configs/routes'
import axiosInstance from './axios'

export const getUsers = async (offset = 0, limit = 10) => {
  try {
    const response = await axiosInstance.get(usersList, {
      params: { offset, limit }
    })

    return {
      results: response.results.results || [], // Array of users
      total: response.results.total || 0 // Total count
    }
  } catch (error) {
    throw error.response?.results || error.message
  }
}

export const createUser = async data => {
  try {
    const response = await axiosInstance.post(usersCreate, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error) {
    throw error.response?.results || error.message
  }
}
