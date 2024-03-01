import { Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'
import React from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { useDialog } from '@/stores'

export const DialogError: React.FC<FallbackProps> = () => {
  const ariaLabelId = React.useId()
  const ariaDescriptionId = React.useId()

  const { closeDialog } = useDialog()

  return (
    <Dialog
      aria-labelledby={ariaLabelId}
      aria-describedby={ariaDescriptionId}
      open
      onClose={closeDialog}
      fullWidth
    >
      <DialogTitle id={ariaLabelId}>{'Errore'}</DialogTitle>
      <DialogContent>
        <Typography id={ariaDescriptionId} sx={{ mb: 2 }}>
          {'Errore generico'}
        </Typography>
        <Button onClick={() => closeDialog}>Ok</Button>
      </DialogContent>
    </Dialog>
  )
}
