import { Box, Stack } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from '@/router'
import { LoginForm } from './components/LoginForm'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { LoginLayout } from '@/components/layout/LoginLayout'

export const LoginPage: React.FC = () => {
  const { t } = useTranslation('common')
  return (
    <Stack sx={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <LoginLayout title={t('loginForm.title')} description={t('loginForm.subtitle')}>
        <LoginForm />
      </LoginLayout>
      <FooterLogin />
    </Stack>
  )
}

const FooterLogin: React.FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'loginForm',
  })
  return (
    <>
      <Stack alignItems="center">
        <Box>
          <Trans components={{ 1: <Link to="RECOVER_PASSWORD" target="_blank" /> }}>
            {t('forgotPassword')}
          </Trans>
        </Box>
        <Link
          to={'MONITORING_E_SERVICE_LIST'}
          as="button"
          variant="naked"
          startIcon={<ArrowBackIcon />}
          sx={{ my: 4 }}
        >
          {t('returnToList')}
        </Link>
      </Stack>
    </>
  )
}
