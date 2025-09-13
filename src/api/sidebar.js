import axiosInstance from './axios'

// Fetch sidebar configuration from backend
export const getSidebar = async () => {
  try {
    const response = await axiosInstance.get('/sidebar')

    return response
  } catch (error) {
    throw error.response || error.message
  }
}

export default getSidebar
