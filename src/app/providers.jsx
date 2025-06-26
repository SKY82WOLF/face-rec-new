'use client'

import { useState, useEffect } from 'react'

import { Provider as ReduxProvider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import storee from '@/store'

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime:30 * 10000,
            refetchOnWindowFocus: true
          }
        }
      })
  )

  // 👇 Ensure the Devtools mounts only after client render
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <ReduxProvider store={storee}>
      <QueryClientProvider client={queryClient}>
        {children}

        {/* ✅ Devtools must be outside layout containers to avoid positioning issues */}
        {process.env.NODE_ENV === 'development' && isClient && (
          <div
            id='__react-query-devtools__'
            style={{
              position: 'fixed',
              zIndex: 9999999,
              top: 0,
              right: 0,
              maxHeight: '100vh',
              maxWidth: '100vw',
              overflow: 'auto',
              pointerEvents: 'all'
            }}
          >
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition='bottom-right'
              position='top'
              panelProps={{
                style: {
                  zIndex: 9999999,
                  position: 'relative',
                  pointerEvents: 'all'
                }
              }}
              toggleButtonProps={{
                style: {
                  zIndex: 9999999,
                  position: 'relative'
                }
              }}
            />
          </div>
        )}
      </QueryClientProvider>
    </ReduxProvider>
  )
}
