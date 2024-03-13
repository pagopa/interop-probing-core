import { useTranslation } from 'react-i18next'
import { FirstAccessForm } from './components/FirstAccessForm'
import { LoginLayout } from '@/components/layout/LoginLayout'

type FirstAccessPageProps = { isRecover?: boolean }

export const FirstAccessPage: React.FC<FirstAccessPageProps> = ({ isRecover = false }) => {
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
