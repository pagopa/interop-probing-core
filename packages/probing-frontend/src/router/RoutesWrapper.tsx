import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { Dialog } from '@/components/dialogs'
// import { ErrorBoundary } from '../../../components/shared/ErrorBoundary'
// import { ErrorPage } from '@/pages'
import { useLocation } from '@/router'
import { ErrorBoundary } from 'react-error-boundary'
import { AppLayout } from '@/layout/AppLayout'
import { Footer, Header } from '@/layout'
const Error = () => <>Error</>
const _RoutesWrapper: React.FC = () => {
  const { routeKey } = useLocation()
  return (
    <>
      <Header />
      <AppLayout>
        <ErrorBoundary key={routeKey} FallbackComponent={Error}>
          <React.Suspense fallback={<>laoding...</>}>
            <Outlet />
          </React.Suspense>
        </ErrorBoundary>
      </AppLayout>
      <Footer />
    </>
  )
}

const RoutesWrapper: React.FC = () => {
  return (
    <>
      <ErrorBoundary
        FallbackComponent={() => (
          <Box sx={{ p: 8 }}>
            <>Error</>
          </Box>
        )}
      >
        <_RoutesWrapper />
      </ErrorBoundary>
      <Dialog />
    </>
  )
}

export default RoutesWrapper
