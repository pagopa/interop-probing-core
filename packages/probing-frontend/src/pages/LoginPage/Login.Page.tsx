import { Box } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from '@/router'
import { LoginForm } from './components/LoginForm'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { LoginLayout } from '@/layout/LoginLayout'

export const LoginPage = () => {
  const { t } = useTranslation('common')
  return (
    <>
      <LoginLayout title={t('loginForm.title')} description={t('loginForm.subtitle')}>
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
        <Link
          to={'MONITORING_E_SERVICE_LIST'}
          as="button"
          startIcon={<ArrowBackIcon />}
          variant="naked"
          sx={{ my: 4 }}
        >
          {t('returnToList')}
        </Link>
      </Box>
    </>
  )
}
