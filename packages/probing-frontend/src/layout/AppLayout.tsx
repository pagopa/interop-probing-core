import React from 'react'
import { Box } from '@mui/material'
import type { SxProps } from '@mui/material'

type AppLayoutProps = {
  children: React.ReactNode
  hideSideNav?: boolean
  sx?: SxProps
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, sx }) => {
  return (
    <Box
      component="main"
      sx={{
        px: 3,
        py: 6,
        ...sx,
      }}
      bgcolor="#FAFAFA"
    >
      <Box sx={{ maxWidth: 1120, mx: 'auto', height: '100%' }}>{children}</Box>
    </Box>
  )
}
