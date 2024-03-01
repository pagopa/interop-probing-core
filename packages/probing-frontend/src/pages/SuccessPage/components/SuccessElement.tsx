import { Typography, Button } from '@mui/material'
import React from 'react'
import type { SuccessElementProps } from '../Success.Page'

export const SuccessElement: React.FC<SuccessElementProps> = ({ icon, title, subtitle, cta }) => {
  return (
    <>
      {icon}
      <Typography variant="h3" component="h1" align={'center'}>
        {title}
      </Typography>
      <Typography variant="body1" align={'center'}>
        {subtitle}
      </Typography>
      <Button variant="contained" onClick={cta.action}>
        {cta.title}
      </Button>
    </>
  )
}
