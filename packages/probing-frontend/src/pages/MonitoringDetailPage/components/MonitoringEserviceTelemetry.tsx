import { Stack } from '@mui/system'
import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ChartWrapper } from './charts/ChartWrapper'

export const MonitoringEserviceTelemetry = ({
  eserviceId,
  pollingFrequency,
}: {
  eserviceId: string
  pollingFrequency: number
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage' })

  return (
    <Stack spacing={1} sx={{ mt: 6, width: '100%', mx: 'auto' }}>
      <Typography component={'h1'} variant="h5" sx={{ pb: 8 }}>
        {t('historyTitle')}
      </Typography>
      <ChartWrapper eserviceId={eserviceId} pollingFrequency={pollingFrequency}></ChartWrapper>
    </Stack>
  )
}
