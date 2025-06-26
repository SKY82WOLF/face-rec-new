// 📁 api/users.js
import { usersCreate, usersList } from '@/configs/routes'
import axiosInstance from './axios'

export const getUsers = async (offset = 0, limit = 10) => {
  try {
    const response = await axiosInstance.get(usersList, {
      params: { offset, limit }
    })

    return response.results || []
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const createUser = async data => {
  try {
    const response = await axiosInstance.post(usersCreate, data)

    return response
  } catch (error) {
    throw error.response?.data || error.message
  }
}
