'use client'

import { HelmetProvider as ReactHelmetProvider } from 'react-helmet-async'

// Create a static helmetContext to ensure consistent updates
const helmetContext = {}

const HelmetProvider = ({ children }) => {
  return <ReactHelmetProvider context={helmetContext}>{children}</ReactHelmetProvider>
}

export default HelmetProvider
