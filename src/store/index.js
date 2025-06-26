import { configureStore } from '@reduxjs/toolkit'

import websocketReducer from './slices/websocketSlice'
import { websocketMiddleware } from './middleware/websocketMiddleware'

export const store = configureStore({
  reducer: {
    websocket: websocketReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(websocketMiddleware)
})

export default store
