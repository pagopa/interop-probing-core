import React from 'react'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { type RouteKey } from '@/router'

export type PageBackToAction = {
  label: string
  to: RouteKey
  params?: Record<string, string>
  urlParams?: Record<string, string>
}

type PageContainerSkeletonProps = {
  children?: React.ReactNode
  backToAction?: PageBackToAction
}

export const PageContainerSkeleton: React.FC<PageContainerSkeletonProps> = ({ children }) => {
  return (
    <Box>
      <PageContainerIntroSkeleton />
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Box>
  )
}

export const PageContainerIntroSkeleton: React.FC = () => {
  return (
    <Stack direction="row" alignItems="end" spacing={2}>
      <Box sx={{ flex: 1 }}>
        <Typography component="h1" variant="h4">
          <Skeleton />
        </Typography>
        <Typography component="p" variant="body1" sx={{ mt: 1, mb: 0 }}>
          <Skeleton />
        </Typography>
      </Box>
    </Stack>
  )
}
