import React from 'react'
import { FormControl, FormHelperText } from '@mui/material'
import type { Theme, SxProps } from '@mui/material'

type InputWrapperProps = {
  error?: { message: string }
  sx?: SxProps<Theme>
  children: React.ReactNode
  errorId?: string
  component?: React.ElementType
}

export const InputWrapper: React.FC<InputWrapperProps> = ({
  errorId,
  error,
  sx,
  children,
  component = 'div',
}) => {
  return (
    <FormControl fullWidth component={component} error={!!error} sx={{ mb: '24px', ...sx }}>
      {children}
      {error && (
        <FormHelperText
          component="span"
          id={errorId}
          sx={{
            fontWeight: 400,
            color: 'text.secondary',
            ml: 0,
            mt: 0,
            display: 'block',
            fontSize: '0.9rem',
          }}
        >
          {error.message}
        </FormHelperText>
      )}
    </FormControl>
  )
}
