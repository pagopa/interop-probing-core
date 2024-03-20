import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import { Link, useParams } from '@/router'
import { MonitoringEserviceTelemetry } from './components/MonitoringEserviceTelemetry'
import { MonitoringEserviceProbing } from './components/MonitoringEserviceProbing'
import { MonitoringEserviceDetail } from './components/MonitoringEserviceDetail'
import { Box, Stack } from '@mui/system'
import { useTranslation } from 'react-i18next'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton } from '@mui/material'
import { useHandleRefetch } from '@/hooks/useRefetch'
import type { ProbingEservice } from '@/api/monitoring/monitoring.models'

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

  const _isLoading = isInitialLoadingEservice || isInitialLoadingProbing
  if (_isLoading) return <DetailPageSkeleton />

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
      <Box>
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

const DetailPageSkeleton: React.FC = () => {
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
      <Stack alignItems={'center'} gap={4}>
        <Skeleton
          height="50px"
          width={'100%'}
          sx={{ maxWidth: 620, display: 'flex', justifySelf: 'center' }}
        />
        <ChartWrapperSkeleton />
      </Stack>
    </>
  )
}

export const ChartWrapperSkeleton: React.FC = () => {
  return (
    <Stack direction="row" flexWrap={'wrap'} width={'100%'}>
      <Stack direction="column" flexGrow={2} gap={4}>
        <Skeleton height="40px" />
        <Skeleton height="250px" sx={{ transform: 'scale(1, 1)' }} />
        <Skeleton height="50px" />
      </Stack>
      <Stack flexGrow={1} ml={10} gap={4}>
        <Skeleton height="40px" />
        <Skeleton height="250px" sx={{ transform: 'scale(1, 1)' }} />
      </Stack>
    </Stack>
  )
}
