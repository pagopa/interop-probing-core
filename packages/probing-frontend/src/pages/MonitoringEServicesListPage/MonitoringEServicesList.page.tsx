import { useTranslation } from 'react-i18next'
import { MonitoringTable } from './components/MonitoringTable'
import { PageContainer } from '@/components/layout/PageContainer'

export const MonitoringEServicesList: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'homePage' })

  return (
    <PageContainer title={t('title')} description={t('subtitle')}>
      <MonitoringTable />
    </PageContainer>
  )
}
