import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  original: [],
  codenames: [],
  loading: false
}

const extractCodenames = permissions => {
  const set = new Set()

  if (!Array.isArray(permissions)) return []

  permissions.forEach(category => {
    if (category && category.codename) set.add(category.codename)

    if (category && Array.isArray(category.permissions)) {
      category.permissions.forEach(p => {
        if (p && p.codename) set.add(p.codename)
      })
    }
  })

  return Array.from(set)
}

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setPermissions(state, action) {
      state.original = action.payload || []
      state.codenames = extractCodenames(state.original)
      state.loading = false
    },
    setPermissionsLoading(state) {
      state.loading = true
    },
    clearPermissions(state) {
      state.original = []
      state.codenames = []
      state.loading = false
    }
  }
})

export const { setPermissions, setPermissionsLoading, clearPermissions } = permissionsSlice.actions
export default permissionsSlice.reducer

export const selectPermissionsOriginal = state => state.permissions.original
export const selectPermissionsCodenames = state => state.permissions.codenames
export const selectPermissionsLoading = state => state.permissions.loading
export const selectSidebar = state => state.permissions.original
