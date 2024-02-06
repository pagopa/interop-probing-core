import { Box } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from '@/router'
import { LoginForm } from './components/LoginForm'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { LoginLayout } from '@/layout/LoginLayout'

export const LoginPage = () => {
  return (
    <>
      <LoginLayout i18nContext={'loginForm'}>
        <LoginForm />
      </LoginLayout>
      <FooterLogin />
    </>
  )
}

const FooterLogin = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'loginForm',
  })
  return (
    <>
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
