import { useTranslation } from 'react-i18next'
import { RecoverPasswordForm } from './components/RecoverPasswordForm'
import { LoginLayout } from '@/layout/LoginLayout'

export const RecoverPasswordPage = () => {
  const { t } = useTranslation('common')
  return (
    <LoginLayout
      title={t('recoverPasswordForm.title')}
      description={t('recoverPasswordForm.subtitle')}
    >
      <RecoverPasswordForm />
    </LoginLayout>
  )
}
