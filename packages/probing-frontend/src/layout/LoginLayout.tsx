import { Paper, Typography } from '@mui/material'
import { Box } from '@mui/system'
import type { KeyPrefix } from 'i18next'
import { useTranslation } from 'react-i18next'

export const LoginLayout = ({
  children,
  i18nContext,
}: {
  children: React.ReactNode
  i18nContext: KeyPrefix<'common'>
}) => {
  const { t } = useTranslation('common', { keyPrefix: i18nContext })
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography component="h1" variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        {t('title')}
      </Typography>
      <Typography component="p" sx={{ mb: 3 }}>
        {t('subtitle')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper
          elevation={16}
          variant="elevation"
          sx={{
            maxWidth: 480,
            borderRadius: 3,
            my: 2,
            p: 4,
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  )
}
