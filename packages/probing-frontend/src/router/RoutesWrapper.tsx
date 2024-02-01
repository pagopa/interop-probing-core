import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
// import { ErrorBoundary } from '../../../components/shared/ErrorBoundary'
// import { ErrorPage } from '@/pages'
import { useLocation } from '@/router'
import { ErrorBoundary } from 'react-error-boundary'
const Error = () => <>Error</>
const _RoutesWrapper: React.FC = () => {
  const { routeKey } = useLocation()
  return (
    <>
      <Box sx={{ flex: 1 }}>
        (
        <ErrorBoundary key={routeKey} FallbackComponent={Error}>
          <React.Suspense fallback={<>laoding...</>}>
            <Outlet />
          </React.Suspense>
        </ErrorBoundary>
        )
      </Box>
    </>
  )
}

const RoutesWrapper: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <Box sx={{ p: 8 }}>
          <>Error</>
        </Box>
      )}
    >
      <_RoutesWrapper />
    </ErrorBoundary>
  )
}

export default RoutesWrapper
