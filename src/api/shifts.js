// API functions for shifts management
import {
  getApiUrl,
  shiftsAdd,
  shiftsDelete,
  shiftsDetail,
  shiftsList,
  shiftsPersons,
  shiftsUpdate
} from '@/configs/routes'
import axiosInstance from './axios'

/**
 * Get all shifts with optional pagination and sorting
 * @param {Object} options - Request options
 * @param {number} options.page - Page number
 * @param {number} options.per_page - Items per page
 * @param {string} options.order_by - Field to sort by with optional prefix (- for desc)
 * @returns {Promise<Object>} - Response with shifts data
 */
export const getShifts = async ({ page = 1, per_page = 10, order_by = 'id' } = {}) => {
  try {
    const response = await axiosInstance.get(shiftsList, {
      params: {
        page,
        per_page,
        order_by
      }
    })

    return response
  } catch (error) {
    console.error('Error fetching shifts:', error)
    throw error.response || error
  }
}

/**
 * Get shift details by ID
 * @param {number} id - Shift ID
 * @returns {Promise<Object>} - Shift details
 */
export const getShiftDetail = async id => {
  try {
    const response = await axiosInstance.get(`${shiftsDetail}${id}`)

    return response
  } catch (error) {
    console.error(`Error fetching shift with ID ${id}:`, error)
    throw error.response || error
  }
}

/**
 * Get persons assigned to a shift
 * @param {number} shiftId - Shift ID
 * @returns {Promise<Object>} - Response with persons data
 */
export const getShiftPersons = async shiftId => {
  try {
    const url = shiftsPersons.replace(':id', shiftId)
    const response = await axiosInstance.get(url)

    return response
  } catch (error) {
    console.error(`Error fetching persons for shift ID ${shiftId}:`, error)
    throw error.response || error
  }
}

/**
 * Create a new shift
 * @param {Object} shiftData - Shift data to create
 * @returns {Promise<Object>} - Created shift
 */
export const createShift = async shiftData => {
  try {
    const response = await axiosInstance.post(shiftsAdd, shiftData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error) {
    console.error('Error creating shift:', error)
    throw error.response || error
  }
}

/**
 * Update an existing shift
 * @param {Object} params - Update parameters
 * @param {number} params.id - Shift ID to update
 * @param {Object} params.data - Updated shift data
 * @returns {Promise<Object>} - Updated shift
 */
export const updateShift = async ({ id, data }) => {
  try {
    const response = await axiosInstance.put(`${shiftsUpdate}${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error) {
    console.error(`Error updating shift with ID ${id}:`, error)
    throw error.response || error
  }
}

/**
 * Delete a shift
 * @param {number} id - Shift ID to delete
 * @returns {Promise<Object>} - API response
 */
export const deleteShift = async id => {
  try {
    const response = await axiosInstance.delete(`${shiftsDelete}${id}`)

    return response
  } catch (error) {
    console.error(`Error deleting shift with ID ${id}:`, error)
    throw error.response || error
  }
}

/**
 * Assign persons to a shift
 * @param {number} shiftId - Shift ID
 * @param {Array<number>} personIds - Array of person IDs to assign
 * @returns {Promise<Object>} - API response
 */
export const assignPersonsToShift = async (shiftId, personIds) => {
  try {
    const url = shiftsPersons.replace(':id', shiftId)

    const response = await axiosInstance.post(
      url,
      { persons: personIds },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return response
  } catch (error) {
    console.error(`Error assigning persons to shift ID ${shiftId}:`, error)
    throw error.response || error
  }
}
