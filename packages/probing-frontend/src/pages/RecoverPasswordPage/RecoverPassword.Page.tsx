import { RecoverPasswordForm } from './components/RecoverPasswordForm'
import { LoginLayout } from '@/layout/LoginLayout'

export const RecoverPasswordPage = () => {
  return (
    <LoginLayout i18nContext="recoverPasswordForm">
      <RecoverPasswordForm />
    </LoginLayout>
  )
}
