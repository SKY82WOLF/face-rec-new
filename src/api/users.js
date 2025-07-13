import { usersCreate, usersList } from '@/configs/routes'
import axiosInstance from './axios'

export const getUsers = async ({ page = 1, per_page = 10 }) => {
  try {
    const response = await axiosInstance.get(usersList, {
      params: { page, per_page }
    })

    return response
  } catch (error) {
    throw error.response || error.message
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
