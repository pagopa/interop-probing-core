import React from 'react'
import { Box, Skeleton, Stack, Typography } from '@mui/material'

type PageContainerIntro = {
  title?: string
  description?: string
}

export const PageContainerIntro: React.FC<PageContainerIntro> = ({ title, description }) => {
  return (
    <Stack spacing={1} sx={{ mb: 6, maxWidth: 620, mx: 'auto' }}>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" component="p">
          {description}
        </Typography>
      )}
    </Stack>
  )
}

type PageContainerProps = {
  title?: string
  isLoading?: boolean
  description?: string
  children?: React.ReactNode
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  isLoading,
  ...introProps
}) => {
  return (
    <Box>
      {!isLoading && <PageContainerIntro {...introProps} />}
      {isLoading && <PageContainerIntroSkeleton />}
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
