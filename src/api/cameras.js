import axiosInstance from './axios'
import { camerasList, camerasDetail, camerasAdd, camerasUpdate, camerasDelete, camerasTest } from '@/configs/routes'

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
    // Only send required fields
    const payload = {
      cam_url: data.cam_url,
      name: data.name,
      area: data.area
    }

    const response = await axiosInstance.post(camerasAdd, payload, {
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
    // Only send required fields
    const payload = {
      cam_url: data.cam_url,
      name: data.name,
      area: data.area
    }

    const response = await axiosInstance.put(`${camerasUpdate}${id}`, payload, {
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

export const testCamera = async ({ camera_url }) => {
  try {
    const response = await axiosInstance.post(
      camerasTest,
      { camera_url },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return response
  } catch (error) {
    throw error.response?.data || error.message
  }
}
