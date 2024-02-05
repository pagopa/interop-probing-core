import { Box, Typography } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from '@/router'
import { LoginForm } from './components/LoginForm'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export const LoginPage = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'loginForm',
  })

  return (
    <>
      <Typography component="h1" variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Accedi
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LoginForm />
      </Box>
      <Trans components={{ 1: <Link to="RECOVER_PASSWORD" target="_blank" /> }}>
        {t('forgotPassword')}
      </Trans>
      <Box>
        <Link to={'HOME'} as="button" startIcon={<ArrowBackIcon />} variant="naked" sx={{ my: 4 }}>
          {t('returnToList')}
        </Link>
      </Box>
    </>
  )
}
