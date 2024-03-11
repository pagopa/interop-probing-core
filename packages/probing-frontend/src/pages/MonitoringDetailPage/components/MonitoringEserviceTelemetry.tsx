import { Stack } from '@mui/system'
import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ChartWrapper } from './charts/ChartWrapper'
import React from 'react'

type MonitoringEserviceTelemetryProps = {
  eserviceId: string
  pollingFrequency: number
}

export const MonitoringEserviceTelemetry: React.FC<MonitoringEserviceTelemetryProps> = ({
  eserviceId,
  pollingFrequency,
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage' })

  return (
    <Stack spacing={1} sx={{ mt: 20, width: '100%', mx: 'auto' }}>
      <Typography component={'h1'} variant="h5" sx={{ pb: 8 }}>
        {t('historyTitle')}
      </Typography>
      <ChartWrapper eserviceId={eserviceId} pollingFrequency={pollingFrequency}></ChartWrapper>
    </Stack>
  )
}
