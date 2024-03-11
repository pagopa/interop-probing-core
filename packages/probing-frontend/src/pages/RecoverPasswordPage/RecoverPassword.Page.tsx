import { useTranslation } from 'react-i18next'
import { RecoverPasswordForm } from './components/RecoverPasswordForm'
import { LoginLayout } from '@/components/layout/LoginLayout'

export const RecoverPasswordPage: React.FC = () => {
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
