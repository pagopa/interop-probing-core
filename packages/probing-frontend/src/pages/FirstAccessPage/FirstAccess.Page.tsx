import { FirstAccessForm } from './components/FirstAccessForm'
import { LoginLayout } from '@/layout/LoginLayout'

export const FirstAccessPage = () => {
  return (
    <LoginLayout i18nContext="firstAccessForm">
      <FirstAccessForm />
    </LoginLayout>
  )
}
