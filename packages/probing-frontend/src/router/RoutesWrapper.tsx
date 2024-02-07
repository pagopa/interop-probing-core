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
import { AuthHooks } from '@/hooks/auth.hooks'
const Error = () => <>Error</>
const _RoutesWrapper: React.FC = () => {
  const { jwt, refetch } = AuthHooks.useToken()
  const { routeKey } = useLocation()
  return (
    <>
      <Header jwt={jwt} refetch={refetch} />
      <AppLayout>
        <ErrorBoundary key={routeKey} FallbackComponent={Error}>
          <React.Suspense fallback={<>Loading...</>}>
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
