import axiosInstance from './axios'
import { personsList, personsAdd } from '@/configs/routes'

export const getPersons = async ({ offset = 0, limit = 10 }) => {
  try {
    const response = await axiosInstance.get(personsList, {
      params: { offset, limit }
    })

    return response.results || []
  } catch (error) {
    throw error
  }
}

export const addPerson = async personData => {
  // Create FormData
  const formData = new FormData()

  // Add all fields to FormData
  formData.append('name', personData.name)
  formData.append('last_name', personData.lastname)
  formData.append('national_code', personData.national_code)
  formData.append('access', personData.access || false)
  formData.append('gender', personData.gender)

  formData.append('profile_image', personData.profile_image || '')

  // Add the image file if it exists
  // if (personData.userImage instanceof File) {
  // }

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

// TODO: Implement when API is available
// export const deletePerson = async id => {
//   return await axios.delete(`${personsDelete}/${id}`)
// }
