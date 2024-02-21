import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import MonitoringServices from './monitoring.service'
import type { FilterOption } from '@pagopa/interop-fe-commons'
import type { EService } from '@/api/monitoring/monitoring.models'

function useGetList(params: { limit: number; offset: number }, config?: UseQueryOptions<EService>) {
  return useQuery({
    queryKey: ['GetList', params],
    queryFn: () => MonitoringServices.getList(params),
    ...config,
  })
}

function useGetProducersList(
  params: { limit: number; offset: number; producerName: string },
  config: UseQueryOptions<FilterOption[]>
) {
  return useQuery({
    queryKey: ['GetProducer', params], //todo enum for querykey
    queryFn: () => MonitoringServices.getProducersList(params),
    ...config,
  })
}

export const MonitoringQueries = {
  useGetList,
  useGetProducersList,
}
