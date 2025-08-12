import { configureStore } from '@reduxjs/toolkit'

import websocketReducer from './slices/websocketSlice'
import typesReducer from './slices/typesSlice'
import permissionsReducer from './slices/permissionsSlice'
import { websocketMiddleware } from './middleware/websocketMiddleware'

export const store = configureStore({
  reducer: {
    websocket: websocketReducer,
    types: typesReducer,
    permissions: permissionsReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(websocketMiddleware)
})

export default store
