import type { ProbingEservice } from '@/api/monitoring/monitoring.models'

export const MonitoringEserviceProbing = ({
  eservicesProbingDetail,
}: {
  eservicesProbingDetail: ProbingEservice | undefined
}) => {
  return (
    <div>
      <pre>{JSON.stringify(eservicesProbingDetail)}</pre>
    </div>
  )
}
