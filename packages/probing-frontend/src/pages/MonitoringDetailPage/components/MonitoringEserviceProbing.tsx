import type {
  ProbingEServiceMonitorState,
  ProbingEservice,
} from '@/api/monitoring/monitoring.models'
import { Alert, Box, Chip, Grid, Typography } from '@mui/material'
import { ButtonNaked } from '@pagopa/mui-italia'
import { useTranslation } from 'react-i18next'
import RefreshIcon from '@mui/icons-material/Refresh'
import { formatDateString } from '@/utils/date.utils'
import { MonitoringInformationContainer } from './MonitoringInformationContainer'

type MonitoringEserviceProbingProps = {
  eservicesProbingDetail: ProbingEservice
  onRefetch: () => Promise<void>
}

export const MonitoringEserviceProbing: React.FC<MonitoringEserviceProbingProps> = ({
  eservicesProbingDetail,
  onRefetch,
}: {
  eservicesProbingDetail: ProbingEservice
  onRefetch: () => Promise<void>
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'detailsPage',
  })

  const getProbingStateChipColor = (value: ProbingEServiceMonitorState) => {
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
        <ButtonNaked color="primary" onClick={onRefetch} size="small" startIcon={<RefreshIcon />}>
          {t('refresh')}
        </ButtonNaked>
      </Grid>
      <MonitoringInformationContainer
        label={t('monitoringState')}
        content={
          <Chip
            size={'small'}
            label={t(eservicesProbingDetail?.probingEnabled ? 'active' : 'suspended')}
            color={eservicesProbingDetail.probingEnabled ? 'success' : 'error'}
          />
        }
      />
      <MonitoringInformationContainer
        label={t('eserviceState')}
        content={
          <Chip
            size={'small'}
            label={eservicesProbingDetail.state.toLowerCase()}
            color={getProbingStateChipColor(eservicesProbingDetail.state)}
          />
        }
      />
      <MonitoringInformationContainer
        label={t('lastRelevationDate')}
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

type ProbingDataAlertProps = {
  eservicesProbingDetail: ProbingEservice
}

const ProbingDataAlert: React.FC<ProbingDataAlertProps> = ({ eservicesProbingDetail }) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage.alerts' })
  const { probingEnabled, state, eserviceActive } = eservicesProbingDetail

  const isMonitoringSuspended = state === 'N/D' && !probingEnabled
  const isVersionSuspended = state === 'OFFLINE' && !eserviceActive
  const isEserviceNotAnswering = state === 'OFFLINE' && eserviceActive

  let message = ''

  if (isMonitoringSuspended) {
    message = t('monitoringSystemSuspendedMessage')
  } else if (isVersionSuspended) {
    message = t('versionSuspendedMessage')
  } else if (isEserviceNotAnswering) {
    message = t('eserviceNotAnswerMessage')
  }

  if (!message) return null

  return (
    <Alert sx={{ width: '100%' }} severity="warning">
      {message}
    </Alert>
  )
}
