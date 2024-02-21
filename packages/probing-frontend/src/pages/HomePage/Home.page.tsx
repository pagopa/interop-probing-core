import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useTranslation } from 'react-i18next'
import { MonitoringTable } from './components/MonitoringTable'

export const HomePage: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'homePage' })

  return (
    <>
      <Box sx={{ marginBottom: 10 }}>
        <Typography component={'h1'} variant="h4">
          {t('title')}
        </Typography>
        <Typography component={'p'}>{t('subtitle')}</Typography>
      </Box>
      <MonitoringTable />
    </>
  )
}
