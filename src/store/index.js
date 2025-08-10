import { configureStore } from '@reduxjs/toolkit'

import websocketReducer from './slices/websocketSlice'
import typesReducer from './slices/typesSlice'
import { websocketMiddleware } from './middleware/websocketMiddleware'

export const store = configureStore({
  reducer: {
    websocket: websocketReducer,
    types: typesReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(websocketMiddleware)
})

export default store
