import { groupsList } from '@/configs/routes'
import axiosInstance from './axios'

export const getGroups = async ({ page = 1, per_page = 10 }) => {
  try {
    const response = await axiosInstance.get(groupsList, {
      params: {
        page,
        per_page
      }
    })

    return response
  } catch (error) {
    throw error.response || error.message
  }
}

export const createGroup = async data => {
  try {
    const response = await axiosInstance.post(groupsList, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error) {
    throw error.response?.results || error.message
  }
}

export const updateGroup = async ({ id, data }) => {
  try {
    const response = await axiosInstance.put(`${groupsList}/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error) {
    throw error.response?.results || error.message
  }
}

export const deleteGroup = async id => {
  try {
    const response = await axiosInstance.delete(`${groupsList}/${id}`)

    return response
  } catch (error) {
    throw error.response?.results || error.message
  }
}
