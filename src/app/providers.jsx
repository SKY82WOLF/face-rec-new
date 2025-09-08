'use client'

import { useState, useEffect } from 'react'

import { Provider as ReduxProvider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import storee from '@/store'
import { useTypesReduxSync } from '@/hooks/useTypes'
import GlobalShirzadListener from '@/components/GlobalShirzadListener'

// 1. Create a new component that will be rendered *inside* the QueryClientProvider
function SyncAndRenderChildren({ children }) {
  // Now, this hook is called in a component that is a child of QueryClientProvider,
  // so it has access to the client context.
  useTypesReduxSync()

  return <>{children}</>
}

export default function Providers({ children }) {
  // This part remains the same. We are just creating the client instance.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 30 * 10000,
            refetchOnWindowFocus: true
          }
        }
      })
  )

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <ReduxProvider store={storee}>
      <QueryClientProvider client={queryClient}>
        {/* 2. Use the new component here */}
        <SyncAndRenderChildren>
          <GlobalShirzadListener />
          {children}
        </SyncAndRenderChildren>

        {/* Devtools can stay here */}
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
