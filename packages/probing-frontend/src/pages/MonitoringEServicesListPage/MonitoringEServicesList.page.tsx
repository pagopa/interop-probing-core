import { Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useTranslation } from 'react-i18next'
import { MonitoringTable } from './components/MonitoringTable'

export const MonitoringEServicesList: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'homePage' })

  return (
    <>
      <Stack spacing={1} sx={{ mb: 6, maxWidth: 620, mx: 'auto' }}>
        <Typography component={'h1'} variant="h4">
          {t('title')}
        </Typography>
        <Typography component={'p'}>{t('subtitle')}</Typography>
      </Stack>
      <MonitoringTable />
    </>
  )
}
