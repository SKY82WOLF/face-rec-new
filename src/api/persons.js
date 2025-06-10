import axios from './axios'
import { personsList, personsAdd } from '@/configs/routes'

export const getPersons = async ({ offset = 0, limit = 10 } = {}) => {
  return await axios.get(`${personsList}?offset=${offset}&limit=${limit}`)
}

export const addPerson = async personData => {
  // Ensure access is included in the request
  const data = {
    ...personData,
    last_name: personData.lastname,
    access: personData.access || false
  }

  delete data.lastname

  return await axios.post(personsAdd, data)
}

// TODO: Implement when API is available
// export const updatePerson = async ({ id, data }) => {
//   return await axios.patch(`${personsUpdate}/${id}`, data)
// }

// TODO: Implement when API is available
// export const deletePerson = async id => {
//   return await axios.delete(`${personsDelete}/${id}`)
// }
