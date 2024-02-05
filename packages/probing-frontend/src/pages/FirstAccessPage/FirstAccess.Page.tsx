import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { FirstAccessForm } from './components/FirstAccessForm'

export const FirstAccessPage = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'firstAccessForm',
  })

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography component="h1" variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        {t('title')}
      </Typography>
      <Typography component="p" sx={{ mb: 3 }}>
        {t('subtitle')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FirstAccessForm />
      </Box>
    </Box>
  )
}
