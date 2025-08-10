import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  genderTypes: { data: [], total: 0, loading: true },
  accessTypes: { data: [], total: 0, loading: true }
}

const typesSlice = createSlice({
  name: 'types',
  initialState,
  reducers: {
    setGenderTypes(state, action) {
      state.genderTypes = { ...action.payload, loading: false }
    },
    setAccessTypes(state, action) {
      state.accessTypes = { ...action.payload, loading: false }
    },
    setGenderTypesLoading(state) {
      state.genderTypes.loading = true
    },
    setAccessTypesLoading(state) {
      state.accessTypes.loading = true
    }
  }
})

export const { setGenderTypes, setAccessTypes, setGenderTypesLoading, setAccessTypesLoading } = typesSlice.actions
export default typesSlice.reducer

export const selectGenderTypes = state => state.types.genderTypes
export const selectAccessTypes = state => state.types.accessTypes
