import axiosInstance from './axios'
import { camerasList, camerasDetail, camerasAdd, camerasUpdate, camerasDelete } from '@/configs/routes'

export const getCameras = async ({ page = 1, per_page = 10 } = {}) => {
  try {
    const response = await axiosInstance.get(camerasList, {
      params: { page, per_page }
    })

    return response
  } catch (error) {
    throw error.response || error.message
  }
}

export const getCamera = async id => {
  try {
    const response = await axiosInstance.get(`${camerasDetail}${id}`)

    return response
  } catch (error) {
    throw error.response || error.message
  }
}

export const createCamera = async data => {
  try {
    const response = await axiosInstance.post(camerasAdd, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error) {
    throw error.response?.results || error.message
  }
}

export const updateCamera = async ({ id, data }) => {
  try {
    const response = await axiosInstance.put(`${camerasUpdate}${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error) {
    throw error.response?.results || error.message
  }
}

export const deleteCamera = async id => {
  try {
    const response = await axiosInstance.delete(`${camerasDelete}${id}`)

    return response
  } catch (error) {
    throw error.response?.results || error.message
  }
}
