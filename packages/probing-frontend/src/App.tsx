import { RouterProvider } from '@/router'
import { ToastNotification } from '@/components/layout/ToastNotification'
import { LoadingOverlay } from '@/components/layout/LoadingOverlay'
import { theme } from '@pagopa/interop-fe-commons'
import { ThemeProvider } from '@mui/material'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/config/query-client'

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <LoadingOverlay />
          <ToastNotification />
          <RouterProvider />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </>
  )
}

export default App
