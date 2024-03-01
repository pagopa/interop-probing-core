import { useTranslation } from 'react-i18next'
import { FirstAccessForm } from './components/FirstAccessForm'
import { LoginLayout } from '@/layout/LoginLayout'

export const FirstAccessPage = ({ isRecover = false }: { isRecover?: boolean }) => {
  const { t } = useTranslation('common')
  return (
    <LoginLayout
      title={isRecover ? t('restoreForm.title') : t('firstAccessForm.title')}
      description={isRecover ? t('restoreForm.subtitle') : t('firstAccessForm.subtitle')}
    >
      <FirstAccessForm />
    </LoginLayout>
  )
}
