'use client'

import React, { useState, useEffect } from 'react'

// Mock data for shifts
const mockShifts = [
  {
    id: 1,
    name: 'شیفت صبح',
    start_time: '08:00',
    end_time: '16:00',
    description: 'شیفت کاری صبحگاهی',
    is_active: true,
    created_at: '20250112 08:30:15',
    updated_at: '20250112 08:30:15',
    users: [
      { id: 1, username: 'احمد محمدی', email: 'ahmad@example.com' },
      { id: 2, username: 'فاطمه احمدی', email: 'fatemeh@example.com' }
    ]
  },
  {
    id: 2,
    name: 'شیفت عصر',
    start_time: '16:00',
    end_time: '00:00',
    description: 'شیفت کاری عصرگاهی',
    is_active: true,
    created_at: '20250112 09:15:22',
    updated_at: '20250112 09:15:22',
    users: [
      { id: 3, username: 'علی رضایی', email: 'ali@example.com' },
      { id: 4, username: 'مریم حسینی', email: 'maryam@example.com' }
    ]
  },
  {
    id: 3,
    name: 'شیفت شب',
    start_time: '00:00',
    end_time: '08:00',
    description: 'شیفت کاری شبانه',
    is_active: false,
    created_at: '20250112 10:45:33',
    updated_at: '20250112 10:45:33',
    users: [{ id: 5, username: 'حسن کریمی', email: 'hasan@example.com' }]
  },
  {
    id: 4,
    name: 'شیفت تعطیلات',
    start_time: '09:00',
    end_time: '17:00',
    description: 'شیفت کاری روزهای تعطیل',
    is_active: true,
    created_at: '20250112 11:20:44',
    updated_at: '20250112 11:20:44',
    users: []
  },
  {
    id: 5,
    name: 'شیفت نیمه وقت',
    start_time: '10:00',
    end_time: '14:00',
    description: 'شیفت کاری نیمه وقت',
    is_active: true,
    created_at: '20250112 12:10:55',
    updated_at: '20250112 12:10:55',
    users: [{ id: 6, username: 'زهرا نوری', email: 'zahra@example.com' }]
  }
]

const useShifts = ({ page = 1, per_page = 10, sort_by = 'id', sort_order = 'asc' } = {}) => {
  const [shifts, setShifts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)

  // Simulate API call
  const fetchShifts = async () => {
    setIsLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Sort the data
    const sortedShifts = [...mockShifts].sort((a, b) => {
      let aValue = a[sort_by]
      let bValue = b[sort_by]

      if (sort_by === 'created_at' || sort_by === 'updated_at') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sort_order === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Paginate the data
    const startIndex = (page - 1) * per_page
    const endIndex = startIndex + per_page
    const paginatedShifts = sortedShifts.slice(startIndex, endIndex)

    setShifts(paginatedShifts)
    setTotal(mockShifts.length)
    setIsLoading(false)
  }

  const addShift = async shiftData => {
    setIsLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const newShift = {
      id: Math.max(...mockShifts.map(s => s.id)) + 1,
      ...shiftData,
      created_at: new Date().toISOString().replace(/[-:]/g, '').replace('T', ' ').split('.')[0],
      updated_at: new Date().toISOString().replace(/[-:]/g, '').replace('T', ' ').split('.')[0],
      users: []
    }

    mockShifts.unshift(newShift)
    await fetchShifts()
    setIsLoading(false)
  }

  const updateShift = async ({ id, data }) => {
    setIsLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const shiftIndex = mockShifts.findIndex(s => s.id === id)

    if (shiftIndex !== -1) {
      mockShifts[shiftIndex] = {
        ...mockShifts[shiftIndex],
        ...data,
        updated_at: new Date().toISOString().replace(/[-:]/g, '').replace('T', ' ').split('.')[0]
      }
    }

    await fetchShifts()
    setIsLoading(false)
  }

  const deleteShift = async id => {
    setIsLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600))

    const shiftIndex = mockShifts.findIndex(s => s.id === id)

    if (shiftIndex !== -1) {
      mockShifts.splice(shiftIndex, 1)
    }

    await fetchShifts()
    setIsLoading(false)
  }

  const getShiftDetail = React.useCallback(async id => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const shift = mockShifts.find(s => s.id === id)

    return shift
  }, [])

  useEffect(() => {
    fetchShifts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, per_page, sort_by, sort_order])

  return {
    shifts,
    total,
    isLoading,
    addShift,
    updateShift,
    deleteShift,
    getShiftDetail
  }
}

export default useShifts
