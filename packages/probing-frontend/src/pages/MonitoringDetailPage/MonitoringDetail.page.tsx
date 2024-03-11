import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import { Link, useParams } from '@/router'
import { MonitoringEserviceTelemetry } from './components/MonitoringEserviceTelemetry'
import { MonitoringEserviceProbing } from './components/MonitoringEserviceProbing'
import { MonitoringEserviceDetail } from './components/MonitoringEserviceDetail'
import { Box, Stack } from '@mui/system'
import { useTranslation } from 'react-i18next'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Typography } from '@mui/material'
import { useLoadingOverlay } from '@/stores'
import { delayedPromise } from '@/utils/common.utils'
import { PageContainerSkeleton } from '@/components/layout/PageContainer'

export const MonitoringDetailPage: React.FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'detailsPage',
  })

  const { showOverlay, hideOverlay } = useLoadingOverlay()
  const { id: eserviceId } = useParams<'MONITORING_DETAIL'>()
  const { data: eservicesDetail, isInitialLoading: isInitialLoadingEservice } =
    MonitoringQueries.useGetEserviceData({
      eserviceId,
    })

  const {
    data: eservicesProbingDetail,
    isSuccess: isSuccessProbing,
    refetch,
    isInitialLoading: isInitialLoadingProbing,
  } = MonitoringQueries.useGetEserviceProbingData({ eserviceId })

  const hasValidData = isSuccessProbing && eservicesDetail

  const handleRefetch = async () => {
    showOverlay(t('loading'))
    // We want show the loading overlay for at least 1 second, to avoid flickering
    await delayedPromise(refetch(), 1000)
    hideOverlay()
  }

  if (isInitialLoadingEservice || isInitialLoadingProbing) return <PageContainerSkeleton />

  return (
    <>
      <Stack spacing={1} sx={{ mb: 6, maxWidth: 620, mx: 'auto' }}>
        <Typography variant="h4" component="h1">
          {eservicesDetail?.eserviceName}
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: '30px' }}>
          {t('subtitle')}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {eservicesDetail && <MonitoringEserviceDetail eservicesDetail={eservicesDetail} />}
        {eservicesProbingDetail && (
          <MonitoringEserviceProbing
            eservicesProbingDetail={eservicesProbingDetail}
            onRefetch={handleRefetch}
          />
        )}
      </Box>
      {hasValidData && (
        <MonitoringEserviceTelemetry
          eserviceId={eserviceId}
          pollingFrequency={eservicesDetail.pollingFrequency}
        />
      )}
      <Box sx={{ my: 4 }}>
        <Link
          to={'MONITORING_E_SERVICE_LIST'}
          as="button"
          variant="naked"
          startIcon={<ArrowBackIcon />}
        >
          {t('returnToList')}
        </Link>
      </Box>
    </>
  )
}
