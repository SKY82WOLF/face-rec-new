import axiosInstance from './axios'
import { API_ROUTES } from '@/configs/routes'

const { personReports } = API_ROUTES

export const getPersonReports = async ({
  page = 1,
  per_page = 10,
  gender_id = null,
  camera_id = null,
  person_id = null
} = {}) => {
  try {
    const params = { page, per_page }

    // Add optional filters
    if (gender_id) params.gender_id = gender_id
    if (camera_id) params.camera_id = camera_id
    if (person_id) params.person_id = person_id

    const response = await axiosInstance.get(personReports.list, { params })

    return response
  } catch (error) {
    throw error
  }
}

export const getPersonReport = async id => {
  try {
    const response = await axiosInstance.get(`${personReports.detail}${id}`)

    return response
  } catch (error) {
    throw error
  }
}

export const updatePersonReport = async ({ id, data }) => {
  try {
    const response = await axiosInstance.put(`${personReports.update}${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error) {
    throw error
  }
}

export const deletePersonReport = async id => {
  try {
    const response = await axiosInstance.delete(`${personReports.delete}${id}`)

    return response
  } catch (error) {
    throw error
  }
}

export const getPersonPersonReports = async (personId, { page = 1, per_page = 10 } = {}) => {
  try {
    const response = await axiosInstance.get(
      `${personReports.personReports.replace('persons', `persons/${personId}`)}`,
      {
        params: { page, per_page }
      }
    )

    return response
  } catch (error) {
    throw error
  }
}
