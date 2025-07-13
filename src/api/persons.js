import axiosInstance from './axios'
import { personsList, personsAdd, personsDelete } from '@/configs/routes'

export const getPersons = async ({ page = 1, per_page = 10 }) => {
  try {
    const response = await axiosInstance.get(personsList, {
      params: { page, per_page }
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const addPerson = async personData => {
  // Create FormData
  const formData = new FormData()

  // Add all fields to FormData
  formData.append('first_name', personData.first_name)
  formData.append('last_name', personData.last_name)
  formData.append('national_code', personData.national_code)
  formData.append('access', personData.access ? 'allowed' : 'not_allowed')
  formData.append('gender', personData.gender)
  formData.append('profile_image', personData.profile_image || '')

  if (personData.report_id) {
    formData.append('report_id', personData.report_id)
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

// TODO: Implement when API is available
// export const updatePerson = async ({ id, data }) => {
//   return await axios.patch(`${personsUpdate}/${id}`, data)
// }

export const deletePerson = async id => {
  try {
    const response = await axiosInstance.delete(`${personsDelete}${id}`)

    return response.data
  } catch (error) {
    throw error
  }
}
