import '@/App.css'
import { RouterProvider } from '@/router'
import { ToastNotification } from '@/layout/ToastNotification'
import { LoadingOverlay } from '@/layout/LoadingOverlay'

function App() {
  return (
    <>
      <LoadingOverlay />
      <ToastNotification />
      <RouterProvider />
    </>
  )
}

export default App
