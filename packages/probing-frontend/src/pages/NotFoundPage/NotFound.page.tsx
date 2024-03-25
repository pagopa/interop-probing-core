import { Typography } from '@mui/material'
import { Stack } from '@mui/system'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation('error')

  return (
    <Stack justifyContent="center" alignItems="center" sx={{ width: '100%', height: '100%' }}>
      <Typography component="h1" variant="h4">
        {t('notFound.title')}
      </Typography>
      <Typography component="p" variant="body1" sx={{ mt: 1, mb: 0 }}>
        {t('notFound.description')}
      </Typography>
    </Stack>
  )
}

export default NotFoundPage
