import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import { Link, useParams } from '@/router'
import { MonitoringEserviceTelemetry } from './components/MonitoringEserviceTelemetry'
import {
  MonitoringEserviceProbing,
  MonitoringEserviceProbingSkeleton,
} from './components/MonitoringEserviceProbing'
import {
  MonitoringEserviceDetail,
  MonitoringEserviceDetailSkeleton,
} from './components/MonitoringEserviceDetail'
import { Box, Stack } from '@mui/system'
import { useTranslation } from 'react-i18next'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton } from '@mui/material'
import { useHandleRefetch } from '@/hooks/useRefetch'
import type { ProbingEservice } from '@/api/monitoring/monitoring.models'
import { ChartWrapperSkeleton } from './components/charts/ChartWrapper'

export const MonitoringDetailPage: React.FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'detailsPage',
  })

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
  const handleRefetch = useHandleRefetch<ProbingEservice>(refetch)

  const isLoading = isInitialLoadingEservice || isInitialLoadingProbing
  if (isLoading) return <DetailPageSkeleton />

  return (
    <PageContainer title={eservicesDetail?.eserviceName} description={t('subtitle')}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
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
        <Stack alignItems="center" sx={{ mt: 8 }}>
          <Link
            to={'MONITORING_E_SERVICE_LIST'}
            as="button"
            variant="naked"
            startIcon={<ArrowBackIcon />}
          >
            {t('returnToList')}
          </Link>
        </Stack>
      </Box>
    </PageContainer>
  )
}

const DetailPageSkeleton: React.FC = () => {
  return (
    <>
      <PageContainer isLoading>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MonitoringEserviceDetailSkeleton />
        </Box>
        <Box
          sx={{
            mt: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Skeleton width={'300px'} height={40} sx={{ mb: 2 }} />
          <MonitoringEserviceProbingSkeleton />
        </Box>
        <Stack sx={{ mt: 30, pb: 4, textAlign: 'center', alignItems: 'center' }}>
          <Skeleton sx={{ height: '60px', width: '400px' }} />
        </Stack>
        <ChartWrapperSkeleton />
        <Stack alignItems="center" sx={{ mt: 10 }}>
          <Skeleton sx={{ height: '30px', width: '200px' }} />
        </Stack>
      </PageContainer>
    </>
  )
}
