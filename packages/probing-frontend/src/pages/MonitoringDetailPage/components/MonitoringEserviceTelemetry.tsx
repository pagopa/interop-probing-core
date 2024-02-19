import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'

export const MonitoringEserviceTelemetry = ({
  eserviceId,
  pollingFrequency,
}: {
  eserviceId: string
  pollingFrequency: number
}) => {
  const { data: eservicesTelemetry } = MonitoringQueries.useGetTelemetryData({
    eserviceId,
    pollingFrequency,
  })
  return <div>{JSON.stringify(eservicesTelemetry)}</div>
}
