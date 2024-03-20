import React from 'react'
import { Box, Skeleton, Stack, Typography } from '@mui/material'

type PageContainerIntro = {
  title?: string
  description?: string
}

export const PageContainerIntro: React.FC<PageContainerIntro> = ({ title, description }) => {
  return (
    <Stack spacing={1} sx={{ mb: 6, maxWidth: 620, mx: 'auto', textAlign: 'center' }}>
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
    <Stack spacing={1} sx={{ mb: 6, maxWidth: 620, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" component="h1">
        <Skeleton />
      </Typography>
      <Typography variant="body1" component="p">
        <Stack component="span" alignItems={'center'}>
          <Skeleton width="100%" />
          <Skeleton width="60%" />
        </Stack>
      </Typography>
    </Stack>
  )
}
