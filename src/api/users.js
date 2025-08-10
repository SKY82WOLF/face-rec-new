import { usersCreate, usersList, usersUpdate, usersDelete } from '@/configs/routes'
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

export const getUser = async id => {
  try {
    const response = await axiosInstance.get(`${usersList}/${id}`)

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
    throw error.response?.data || error.message
  }
}

export const updateUser = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${usersUpdate}${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const deleteUser = async id => {
  try {
    const response = await axiosInstance.delete(`${usersDelete}${id}`)

    return response
  } catch (error) {
    throw error.response?.data || error.message
  }
}
