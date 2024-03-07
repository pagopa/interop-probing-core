import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { Dialog } from '@/components/dialogs'
import { useLocation } from '@/router'
import { ErrorBoundary } from 'react-error-boundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { Footer, Header } from '@/components/layout'
import { ErrorPage } from '@/pages/ErrorPage'
import { PageContainerSkeleton } from '@/components/layout/PageContainer'
const _RoutesWrapper: React.FC = () => {
  const { routeKey } = useLocation()
  return (
    <>
      <Header />
      <AppLayout>
        <ErrorBoundary key={routeKey} FallbackComponent={ErrorPage}>
          <React.Suspense fallback={<PageContainerSkeleton />}>
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
        FallbackComponent={(props) => (
          <Box sx={{ p: 8 }}>
            <ErrorPage {...props} />
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
