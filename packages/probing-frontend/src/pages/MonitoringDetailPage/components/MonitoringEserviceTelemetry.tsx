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
  console.log(eservicesTelemetry)
  return (
    <div>
      / / &nbsp;&nbsp;&nbsp;TO-DO TELEMETRY
      {/* {JSON.stringify(eservicesTelemetry)} */}
    </div>
  )
}
