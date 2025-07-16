'use client'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Components
import { Provider } from 'react-redux'

import PrimaryColorInitializer from '@core/components/PrimaryColorInitializer'
import HelmetProvider from '@/components/HelmetProvider'
import Providers from './providers'
import storee from '@/store'

const RootLayout = props => {
  const { children } = props

  // Vars
  const direction = 'rtl'
  const systemMode = 'light' // Default value, will be overridden by InitColorSchemeScript

  return (
    <html id='__next' lang='fa' dir={direction} suppressHydrationWarning>
      <body
        className='flex is-full min-bs-full flex-auto flex-col'
        suppressHydrationWarning
        style={{ backgroundColor: 'var(--background-color)' }}
      >
        <Provider store={storee}>
          <Providers>
            <HelmetProvider>
              <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
              <PrimaryColorInitializer />
              <ToastContainer
                position='top-left'
                rtl
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='colored'
                toastClassName={() => 'custom-toast'}
                bodyClassName={() => 'custom-toast-body'}
              />
              {children}
            </HelmetProvider>
          </Providers>
        </Provider>
      </body>
    </html>
  )
}

export default RootLayout
