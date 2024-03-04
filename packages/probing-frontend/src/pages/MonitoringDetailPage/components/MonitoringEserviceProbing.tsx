import type { ProbingEservice, ProbingStatusType } from '@/api/monitoring/monitoring.models'
import { Alert, Box, Chip, Grid, Typography } from '@mui/material'
import { ButtonNaked } from '@pagopa/mui-italia'
import { useTranslation } from 'react-i18next'
import RefreshIcon from '@mui/icons-material/Refresh'
import { formatDateString } from '@/utils/date.utils'
import type { TranslationKeys } from './MonitoringInformationContainer'
import { MonitoringInformationContainer } from './MonitoringInformationContainer'

export const MonitoringEserviceProbing = ({
  eservicesProbingDetail,
  refetch,
}: {
  eservicesProbingDetail: ProbingEservice
  refetch: () => Promise<void>
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'detailsPage',
  })

  const getProbingStateChipColor = (value: ProbingStatusType) => {
    switch (value) {
      case 'ONLINE':
        return 'success'
      case 'OFFLINE':
        return 'error'
      case 'N/D':
        return 'warning'
    }
  }

  return (
    <Box sx={{ mt: '40px', width: '100%', maxWidth: '600px' }}>
      <Typography variant="h5">{t('realTimeTitle')}</Typography>
      <Grid container sx={{ p: 2, my: 2, backgroundColor: '#F2F2F2', justifyContent: 'end' }}>
        <ButtonNaked
          color="primary"
          onClick={() => refetch()}
          size="small"
          startIcon={<RefreshIcon />}
        >
          {t('refresh')}
        </ButtonNaked>
      </Grid>
      <MonitoringInformationContainer
        label="monitoringState"
        content={
          <Chip
            size={'small'}
            label={t(eservicesProbingDetail?.probingEnabled ? 'active' : 'suspended')}
            color={eservicesProbingDetail.probingEnabled ? 'success' : 'error'}
          />
        }
      />
      <MonitoringInformationContainer
        label="eserviceState"
        content={
          <Chip
            size={'small'}
            label={eservicesProbingDetail.state.toLowerCase() as keyof TranslationKeys}
            color={getProbingStateChipColor(eservicesProbingDetail.state ?? 'N/D')}
          />
        }
      />
      <MonitoringInformationContainer
        label="lastRelevationDate"
        content={
          eservicesProbingDetail.responseReceived
            ? formatDateString(eservicesProbingDetail.responseReceived)
            : 'N/D'
        }
      />
      <ProbingDataAlert eservicesProbingDetail={eservicesProbingDetail} />
    </Box>
  )
}

const ProbingDataAlert = ({
  eservicesProbingDetail,
}: {
  eservicesProbingDetail: ProbingEservice
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage.alerts' })

  let message: keyof TranslationKeys['alerts'] = 'genericAlert'

  const isMonitoringSuspended =
    eservicesProbingDetail.probingEnabled === false && eservicesProbingDetail.state === 'N/D'
  const isVersionSuspended =
    eservicesProbingDetail.state === 'OFFLINE' && !eservicesProbingDetail.eserviceActive
  const isEserviceNotAnswering =
    eservicesProbingDetail.state === 'OFFLINE' && eservicesProbingDetail.eserviceActive

  if (isMonitoringSuspended) {
    message = 'monitoringSystemSuspendedMessage'
  } else if (isVersionSuspended) {
    message = 'versionSuspendedMessage'
  } else if (isEserviceNotAnswering) {
    message = 'eserviceNotAnswerMessage'
  }

  return (
    <Alert sx={{ width: '100%' }} severity="warning">
      {t(message)}
    </Alert>
  )
}