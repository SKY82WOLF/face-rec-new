import axios from './axios'

const BASE_URL = 'persons'

export const getPersons = async ({ offset = 0, limit = 10 } = {}) => {
  return await axios.get(`${BASE_URL}?offset=${offset}&limit=${limit}`)
}

export const addPerson = async personData => {
  // Ensure access is included in the request
  const data = {
    ...personData,
    last_name: personData.lastname,
    access: personData.access || false
  }

  delete data.lastname

  return await axios.post(`${BASE_URL}/add`, data)
}

// TODO: Implement when API is available
// export const updatePerson = async ({ id, data }) => {
//   return await axios.patch(`${BASE_URL}/${id}`, data)
// }

// TODO: Implement when API is available
// export const deletePerson = async id => {
//   return await axios.delete(`${BASE_URL}/${id}`)
// }
