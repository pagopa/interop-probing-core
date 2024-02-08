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
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography component="h1" variant="h4" fontWeight={700}>
        {t('title')}
      </Typography>
      {t('subtitle') !== '' && (
        <Typography component="p" sx={{ mb: 3, mt: 2 }}>
          {t('subtitle')}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 480 }}>
        <Paper
          elevation={16}
          variant="elevation"
          sx={{
            borderRadius: 3,
            my: 4,
            p: 4,
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  )
}
