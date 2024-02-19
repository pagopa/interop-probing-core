import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'

export const MonitoringEserviceTelemetry = ({
  params,
  pollingFrequency,
}: {
  params: { id: string } | undefined
  pollingFrequency: number
}) => {
  const { data: eservicesTelemetry } = MonitoringQueries.useGetTelemetryData(
    {
      eServiceId: params?.id ?? '',
      pollingFrequency: pollingFrequency,
    },
    {}
  )
  return <div>{JSON.stringify(eservicesTelemetry)}</div>
}
