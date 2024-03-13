import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import { Link, useParams } from '@/router'
import { MonitoringEserviceTelemetry } from './components/MonitoringEserviceTelemetry'
import { MonitoringEserviceProbing } from './components/MonitoringEserviceProbing'
import { MonitoringEserviceDetail } from './components/MonitoringEserviceDetail'
import { Box, Stack } from '@mui/system'
import { useTranslation } from 'react-i18next'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useLoadingOverlay } from '@/stores'
import { delayedPromise } from '@/utils/common.utils'
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton } from '@mui/material'

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

  const isLoading = isInitialLoadingEservice || isInitialLoadingProbing

  if (isLoading) return <DetailPageSkeleton />

  return (
    <PageContainer title={eservicesDetail?.eserviceName} description={t('subtitle')}>
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
    </PageContainer>
  )
}

const DetailPageSkeleton = () => {
  return (
    <>
      <Stack spacing={1} sx={{ mb: 6, maxWidth: 620, mx: 'auto' }}>
        <Skeleton height="30px" />
        <Box>
          <Skeleton height="250px" />
        </Box>
        <Skeleton height="100px" />
        <Skeleton height="280px" />
      </Stack>
      <ChartWrapperSkeleton />
    </>
  )
}

export const ChartWrapperSkeleton = () => {
  return (
    <Stack direction="row" flexWrap={'wrap'} width={'100%'}>
      <Stack direction="column" flexGrow={2}>
        <Skeleton height="40px" />
        <Skeleton height="430px" />
        <Skeleton height="50px" />
      </Stack>
      <Stack flexGrow={1} ml={10}>
        <Skeleton height="40px" />
        <Skeleton height="430px" />
      </Stack>
    </Stack>
  )
}
