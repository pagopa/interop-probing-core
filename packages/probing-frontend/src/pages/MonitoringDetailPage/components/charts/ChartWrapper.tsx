import type { ServicePerformance, FailurePerformance } from '@/api/monitoring/monitoring.models'
import { Box, Stack } from '@mui/system'
import type { ScaleTime, ScaleLinear } from 'd3'
import { scaleTime, scaleLinear, max } from 'd3'
import { BarChart } from './BarChart'
import { FailuresChart } from './FailuresChart'
import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import LineChart from './LineChart'
import { Filters, useFilters } from '@pagopa/interop-fe-commons'
import { useJwt } from '@/hooks/useJwt'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@mui/material'

type ChartWrapperProps = {
  eserviceId: string
  pollingFrequency: number
}

const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1))

export const ChartWrapper: React.FC<ChartWrapperProps> = ({ eserviceId, pollingFrequency }) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage' })
  const jwt = useJwt()

  const { data: eservicesTelemetry, isInitialLoading } = MonitoringQueries.useGetTelemetryData({
    eserviceId,
    pollingFrequency,
  })

  const {
    filtersParams: { startDate, endDate },
    ...handlers
  } = useFilters<{ startDate: string; endDate: string }>([
    {
      name: 'startDate',
      type: 'datepicker',
      label: t('startDateTime'),
      maxDate: new Date(),
      minDate: lastYear,
    },
    {
      name: 'endDate',
      type: 'datepicker',
      label: t('endDateTime'),
      maxDate: new Date(),
      minDate: lastYear,
    },
  ])

  const { data: eservicesFilteredTelemetry, isInitialLoading: isLoadingFilteredData } =
    MonitoringQueries.useGetFilteredTelemetryData(
      { pollingFrequency, startDate, endDate },
      eserviceId
    )

  const responseTelemetry = eservicesFilteredTelemetry || eservicesTelemetry

  const firstPerformanceTime = new Date(
    getMinTime<ServicePerformance>(responseTelemetry?.performances)
  )

  const firstFailureTime = new Date(getMinTime<FailurePerformance>(responseTelemetry?.failures))

  const x: (time: Date) => ScaleTime<number, number, never> = (time) => {
    return scaleTime().range([0, 530]).domain([time, new Date()])
  }

  const y: ScaleLinear<number, number, never> = scaleLinear()
    .domain([
      0,
      max(responseTelemetry?.performances ?? [], (d: ServicePerformance) => {
        return d.responseTime + 10 || null
      }) || 10,
    ] as Array<number>)
    .range([300, 20])

  const isLoading = isInitialLoading || isLoadingFilteredData
  if (isLoading) return <ChartWrapperSkeleton />

  return (
    <>
      <Box sx={{ width: '100%' }}>{jwt && <Filters {...handlers} />}</Box>
      <Stack direction={{ md: 'row' }}>
        <Stack direction="column" flexGrow={2}>
          <LineChart
            data={responseTelemetry?.performances ?? []}
            xScale={x(firstPerformanceTime)}
            yScale={y}
          />
          <FailuresChart failures={responseTelemetry?.failures ?? []} x={x(firstFailureTime)} />
        </Stack>
        <Stack>
          <BarChart data={responseTelemetry?.percentages ?? []} />
        </Stack>
      </Stack>
    </>
  )
}

/**
 * Get the minimum time from an array of performance data.
 * @param data - An array of `FailurePerformance | ServicePerformance`
 * @returns The minimum time in milliseconds.
 */
const getMinTime: <T extends FailurePerformance | ServicePerformance>(
  data: Array<T> | undefined
) => number = (data) => {
  let timesInMilliseconds = [new Date().getTime()]
  let timeToSubtract = 0.5
  if (data && data.length > 0) {
    timeToSubtract = 0.05
    // Extract the times from the data and convert them to milliseconds
    timesInMilliseconds = data.map((performance) => new Date(performance.time).getTime())
  }

  // Find the minimum time in milliseconds
  const minTimeInMilliseconds = Math.min(...timesInMilliseconds)

  // Subtract 0.05 days from the minimum time (used as a left padding)
  const minTimeAdjusted = minTimeInMilliseconds - timeToSubtract * 24 * 60 * 60 * 1000

  // Create a new Date object using the adjusted time and set minutes to 0
  const minTimeDate = new Date(minTimeAdjusted)
  minTimeDate.setMinutes(0)

  return minTimeDate.getTime()
}

export const ChartWrapperSkeleton: React.FC = () => {
  return (
    <Stack spacing={1} sx={{ width: '100%', mx: 'auto', flexWrap: 'wrap' }}>
      <Stack direction="row" width={'100%'} flexWrap={'wrap'}>
        <Stack direction="column" flexGrow={2}>
          <Skeleton sx={{ mb: '40px', height: '40px', width: '160px' }} />
          <Skeleton variant="rectangular" sx={{ height: '337px', width: '590px' }} />
          <Skeleton variant="rectangular" sx={{ mt: '30px', height: '20px', width: '160px' }} />
          <Skeleton variant="rectangular" sx={{ mt: '20px', height: '10px', width: '600px' }} />
        </Stack>
        <Box display="flex" flexDirection="column">
          <Skeleton sx={{ height: '40px', width: '140px' }} />
          <Box alignSelf="flex-end">
            <Skeleton variant="rectangular" sx={{ mt: '130px', height: '180px', width: '370px' }} />
          </Box>
        </Box>
      </Stack>
    </Stack>
  )
}
