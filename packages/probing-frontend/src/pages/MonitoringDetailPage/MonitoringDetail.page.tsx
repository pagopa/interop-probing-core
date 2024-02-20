import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import { Link, useParams } from '@/router'
import { MonitoringEserviceTelemetry } from './components/MonitoringEserviceTelemetry'
import { MonitoringEserviceProbing } from './components/MonitoringEserviceProbing'
import { MonitoringEserviceDetail } from './components/MonitoringEserviceDetail'
import { Box } from '@mui/system'
import { useTranslation } from 'react-i18next'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Typography } from '@mui/material'
import { useLoadingOverlay } from '@/stores'

export const MonitoringDetailPage = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'detailsPage',
  })

  const { showOverlay, hideOverlay } = useLoadingOverlay()
  const { id: eserviceId } = useParams<'MONITORING_DETAIL'>()
  const { data: eservicesDetail } = MonitoringQueries.useGetEserviceData({
    eserviceId,
  })

  const {
    data: eservicesProbingDetail,
    isSuccess: isSuccessProbing,
    refetch,
  } = MonitoringQueries.useGetEserviceProbingData({ eserviceId })

  const hasValidData = isSuccessProbing && eservicesDetail

  const handleRefetch = async () => {
    showOverlay(t('loading'))
    // We want show the loading overlay for at least 1 second, to avoid flickering
    await Promise.all([refetch(), new Promise((resolve) => setTimeout(resolve, 1000))])
    hideOverlay()
  }

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: '20px' }}>
        {eservicesDetail?.eserviceName}
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: '30px' }}>
        {t('subtitle')}
      </Typography>
      <Box sx={layoutBox}>
        <MonitoringEserviceDetail eservicesDetail={eservicesDetail} />
        <MonitoringEserviceProbing
          eservicesProbingDetail={eservicesProbingDetail}
          refetch={handleRefetch}
        />
      </Box>
      {hasValidData && (
        <MonitoringEserviceTelemetry
          eserviceId={eserviceId}
          pollingFrequency={eservicesDetail.pollingFrequency}
        />
      )}
      <Box sx={{ my: 4 }}>
        <Link to={'HOME'} as="button" startIcon={<ArrowBackIcon />} variant="naked">
          {t('returnToList')}
        </Link>
      </Box>
    </>
  )
}

const layoutBox = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}
