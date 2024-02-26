import type { TelemetryData, ServicePerformance } from '@/api/monitoring/monitoring.models'
import { Stack } from '@mui/system'
import type { ScaleTime, ScaleLinear } from 'd3'
import { scaleTime, scaleLinear, max } from 'd3'
import { BarChart } from './BarChart'
import { FailuresChart } from './FailuresChart'
import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import LineChart from './LineChart'

export const ChartWrapper = ({
  eserviceId,
  pollingFrequency,
}: {
  eserviceId: string
  pollingFrequency: number
}) => {
  const { data: eservicesTelemetry } = MonitoringQueries.useGetTelemetryData(
    {
      eserviceId,
      pollingFrequency,
    },
    { suspense: false }
  )

  console.log(eservicesTelemetry)
  const mockResponse: TelemetryData = {
    performances: [
      {
        responseTime: 40,
        status: 'OK' as const,
        time: '2024-02-25T15:17:01.579Z',
      },
      {
        responseTime: 70,
        status: 'OK' as const,
        time: '2024-02-25T19:33:07.271Z',
      },
      {
        responseTime: 38,
        status: 'OK' as const,
        time: '2024-02-25T20:53:07.271Z',
      },
      {
        responseTime: 58,
        status: 'OK' as const,
        time: '2024-02-26T05:03:07.271Z',
      },
      {
        responseTime: 61,
        status: 'OK' as const,
        time: '2024-02-26T10:39:01.371Z',
      },
    ],
    failures: [
      {
        status: 'KO' as const,
        time: '2024-02-26T00:30:00Z',
      },
      {
        status: 'KO' as const,
        time: '2024-02-26T05:30:00Z',
      },
      {
        status: 'KO' as const,
        time: '2024-02-26T10:30:00Z',
      },
    ],
    percentages: [
      {
        value: 94.28572,
        status: 'OK' as const,
      },
      {
        value: 5.714286,
        status: 'KO' as const,
      },
    ],
  }

  const minTime = new Date(new Date().getTime() - 1.1 * 24 * 60 * 60 * 1000).setMinutes(0)
  const maxTime = new Date()
  //x scale
  const x: ScaleTime<number, number, never> = scaleTime().range([0, 600]).domain([minTime, maxTime])

  //y scale
  const y: ScaleLinear<number, number, never> = scaleLinear()
    .domain([
      0,
      max(mockResponse.performances, (d: ServicePerformance) => {
        return d.responseTime + 10 || null
      }) || 10,
    ] as Array<number>)
    .range([300, 0])

  return (
    <Stack direction={'row'} sx={{ flexWrap: 'wrap' }}>
      <Stack direction="column" spacing={4}>
        <LineChart data={mockResponse.performances} xScale={x} yScale={y}></LineChart>
        <FailuresChart failures={mockResponse.failures} x={x}></FailuresChart>
      </Stack>
      <BarChart data={mockResponse.percentages}></BarChart>
    </Stack>
  )
}
