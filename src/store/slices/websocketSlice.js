import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  reports: [],
  isConnected: false,
  error: null
}

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    addReport: (state, action) => {
      // Check for existing report by index to avoid duplicates
      const existingIndex = state.reports.findIndex(report => report.index === action.payload.index)

      if (existingIndex !== -1) {
        // Update existing report
        state.reports[existingIndex] = action.payload
      } else {
        // Add new report at the beginning
        state.reports.unshift(action.payload)

        // Enforce 40-report limit
        if (state.reports.length > 40) {
          state.reports = state.reports.slice(0, 40)
        }
      }
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearReports: state => {
      state.reports = []
    }
  }
})

export const { addReport, setConnectionStatus, setError, clearReports } = websocketSlice.actions
export default websocketSlice.reducer
