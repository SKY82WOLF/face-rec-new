import axiosInstance from './axios'

export const getPermissions = async () => {
  try {
    const response = await axiosInstance.get('/permissions')

    return response
  } catch (error) {
    throw error.response || error.message
  }
}
