import axiosInstance from './axios'
import { typesList } from '@/configs/routes'

export const getTypes = async ({ page = 1, per_page = 100, category_id_name = null } = {}) => {
  try {
    const params = { page, per_page }

    if (category_id_name) {
      params.category_id_name = category_id_name
    }

    const response = await axiosInstance.get(typesList, { params })

    return response
  } catch (error) {
    throw error
  }
}

export const getTypesByCategory = async categoryName => {
  try {
    const response = await getTypes({ category_id_name: categoryName })

    return response
  } catch (error) {
    throw error
  }
}

export const updateType = async ({ id, data }) => {
  try {
    const response = await axiosInstance.put(`${typesList}/${id}`, data)

    return response
  } catch (error) {
    throw error
  }
}

export const deleteType = async id => {
  try {
    const response = await axiosInstance.delete(`${typesList}/${id}`)

    return response
  } catch (error) {
    throw error
  }
}
