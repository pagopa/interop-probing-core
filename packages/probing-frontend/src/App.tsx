import '@/App.css'
import { RouterProvider } from '@/router'
import { ToastNotification } from '@/layout/ToastNotification'
import { LoadingOverlay } from '@/layout/LoadingOverlay'
import { theme } from '@pagopa/interop-fe-commons'
import { ThemeProvider } from '@mui/material'

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <LoadingOverlay />
        <ToastNotification />
        <RouterProvider />
      </ThemeProvider>
    </>
  )
}

export default App
