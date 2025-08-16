import axiosInstance from './axios'
import { personsList, personsAdd, personsDelete, personsUpdate } from '@/configs/routes'

export const getPersons = async ({ page = 1, per_page = 10, filters = {} } = {}) => {
  try {
    // Build params merging page/per_page with filters.
    const params = { page, per_page }

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return

      // If value is an array, join with commas for API multi-value support
      if (Array.isArray(value)) {
        if (value.length > 0) params[key] = value.join(',')
      } else if (String(value).trim() !== '') {
        params[key] = value
      }
    })

    const response = await axiosInstance.get(personsList, {
      params
    })

    return response
  } catch (error) {
    throw error
  }
}

export const addPerson = async personData => {
  // Create FormData
  const formData = new FormData()

  // Add all fields to FormData
  formData.append('first_name', personData.first_name)
  formData.append('last_name', personData.last_name)
  formData.append('national_code', personData.national_code)
  formData.append('access_id', personData.access_id || 7) // Default to unknown
  formData.append('gender_id', personData.gender_id || '')
  formData.append('person_image', personData.person_image || '')

  if (personData.last_person_report_id) {
    formData.append('last_person_report_id', personData.last_person_report_id)
  }

  if (personData.person_id) {
    formData.append('person_id', personData.person_id)
  }

  if (personData.feature_vector) {
    formData.append('feature_vector', personData.feature_vector)
  }

  if (personData.image_quality) {
    formData.append('image_quality', personData.image_quality)
  }

  return await axiosInstance.post(personsAdd, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const updatePerson = async ({ id, data }) => {
  // Create FormData
  const formData = new FormData()

  // Add all fields to FormData
  formData.append('first_name', data.first_name)
  formData.append('last_name', data.last_name)
  formData.append('national_code', data.national_code)
  formData.append('access_id', data.access_id || 7) // Default to unknown
  formData.append('gender_id', data.gender_id || '')

  // Only append person_image if it's provided and is a File
  if (data.person_image instanceof File) {
    formData.append('person_image', data.person_image)
  }

  if (data.last_person_report_id) {
    formData.append('last_person_report_id', data.last_person_report_id)
  }

  // if (data.person_id) {
  //   formData.append('person_id', data.person_id)
  // }

  if (data.feature_vector) {
    formData.append('feature_vector', data.feature_vector)
  }

  if (data.image_quality) {
    formData.append('image_quality', data.image_quality)
  }

  return await axiosInstance.put(`${personsUpdate}${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const deletePerson = async id => {
  try {
    const response = await axiosInstance.delete(`${personsDelete}${id}`)

    return response.data
  } catch (error) {
    throw error
  }
}
