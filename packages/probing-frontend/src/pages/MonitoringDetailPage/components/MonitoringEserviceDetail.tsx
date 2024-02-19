import type { MainEservice } from '@/api/monitoring/monitoring.models'

export const MonitoringEserviceDetail = ({
  eservicesDetail,
}: {
  eservicesDetail: MainEservice | undefined
}) => {
  return (
    <div>
      <pre>{JSON.stringify(eservicesDetail)}</pre>
    </div>
  )
}
