import React from 'react'
import { Box } from '@mui/material'
import type { SxProps } from '@mui/material'

type AppLayoutProps = {
  children: React.ReactNode
  hideSideNav?: boolean
  sx?: SxProps
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        px: 3,
        py: 4,
        flexGrow: 1,
      }}
      bgcolor="#FAFAFA"
    >
      <Box sx={{ maxWidth: 1600, mx: 'auto', height: '100%' }}>{children}</Box>
    </Box>
  )
}
