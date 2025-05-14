'use client'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@views/NotFound'

// Util Imports
// import { getServerMode, getSystemMode } from '@core/utils/serverHelpers'

const NotFoundPage = () => {
  // Vars
  const direction = 'ltr'

  // For client components, we can't use async/await directly in the component
  // Instead, we'd typically use React hooks like useState and useEffect
  // For now, setting default values
  const mode = 'light' // Default value, replace with actual client-side logic if needed
  const systemMode = 'light' // Default value, replace with actual client-side logic if needed

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <NotFound mode={mode} />
      </BlankLayout>
    </Providers>
  )
}

export default NotFoundPage
