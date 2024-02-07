import { FirstAccessForm } from './components/FirstAccessForm'
import { LoginLayout } from '@/layout/LoginLayout'

export const FirstAccessPage = ({ isRecover = false }: { isRecover?: boolean }) => {
  return (
    <LoginLayout i18nContext={isRecover ? 'restoreForm' : 'firstAccessForm'}>
      <FirstAccessForm />
    </LoginLayout>
  )
}
