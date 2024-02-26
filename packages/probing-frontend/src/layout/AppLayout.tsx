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
        height: '100%',
        py: 2,
        ...sx,
      }}
      bgcolor="#FAFAFA"
    >
      <Box sx={{ maxWidth: 920, mx: 'auto', height: '100%' }}>{children}</Box>
    </Box>
  )
}
