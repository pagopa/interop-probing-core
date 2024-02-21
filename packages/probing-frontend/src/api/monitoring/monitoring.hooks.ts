import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import MonitoringServices from './monitoring.service'
import type { FilterOption } from '@pagopa/interop-fe-commons'
import type { EService } from '@/api/monitoring/monitoring.models'

enum MonitoringQueryKeys {
  GetList = 'GetList',
  GetProducer = 'GetProducer',
}

function useGetList(params: { limit: number; offset: number }, config?: UseQueryOptions<EService>) {
  return useQuery({
    queryKey: [MonitoringQueryKeys.GetList, params],
    queryFn: () => MonitoringServices.getList(params),
    ...config,
  })
}

function useGetProducersList(
  params: { limit: number; offset: number; producerName: string },
  config: UseQueryOptions<FilterOption[]>
) {
  return useQuery({
    queryKey: [MonitoringQueryKeys.GetProducer, params],
    queryFn: () => MonitoringServices.getProducersList(params),
    ...config,
  })
}

export const MonitoringQueries = {
  useGetList,
  useGetProducersList,
}
