import { useTranslation } from 'react-i18next'
import { RecoverPasswordForm } from './components/RecoverPasswordForm'
import { LoginLayout } from '@/components/layout/LoginLayout'
import { Stack } from '@mui/system'

export const RecoverPasswordPage: React.FC = () => {
  const { t } = useTranslation('common')
  return (
    <Stack sx={{ height: '100%', justifyContent: 'center' }}>
      <LoginLayout
        title={t('recoverPasswordForm.title')}
        description={t('recoverPasswordForm.subtitle')}
      >
        <RecoverPasswordForm />
      </LoginLayout>
    </Stack>
  )
}
