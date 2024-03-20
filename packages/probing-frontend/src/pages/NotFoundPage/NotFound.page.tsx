import { Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation('error')

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Stack direction="row" alignItems="end" spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography component="h1" variant="h4">
            {t('notFound.title')}
          </Typography>
          <Typography component="p" variant="body1" sx={{ mt: 1, mb: 0 }}>
            {t('notFound.description')}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}

export default NotFoundPage
