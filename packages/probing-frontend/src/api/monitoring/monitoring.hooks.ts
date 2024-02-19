import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import MonitoringServices from './monitoring.service'
import type { FilterOption } from '@pagopa/interop-fe-commons'
import type {
  EService,
  MainEservice,
  ProbingEservice,
  TelemetryData,
} from '@/api/monitoring/monitoring.models'

enum MonitoringQueryKeys {
  GetList = 'GetList',
  GetProducer = 'GetProducer',
}

function useGetList(params: { limit: number; offset: number }, config: UseQueryOptions<EService>) {
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

function useGetEserviceData(params: { eServiceId: string }, config: UseQueryOptions<MainEservice>) {
  return useQuery({
    queryKey: ['GetEserviceData', params],
    queryFn: () => MonitoringServices.getEserviceData<MainEservice>({ ...params, type: 'main' }),
    ...config,
  })
}

function useGetEserviceProbingData(
  params: { eServiceId: string },
  config: UseQueryOptions<ProbingEservice>
) {
  return useQuery({
    queryKey: ['GetEserviceProbingData', params],
    queryFn: () =>
      MonitoringServices.getEserviceData<ProbingEservice>({ ...params, type: 'probing' }),
    ...config,
  })
}

function useGetTelemetryData(
  params: { eServiceId: string; pollingFrequency: number },
  config: UseQueryOptions<TelemetryData>
) {
  return useQuery({
    queryKey: ['GetEserviceProbingData', params],
    queryFn: () => MonitoringServices.getTelemetryData(params),
    ...config,
  })
}

function useGetFilteredTelemetryData(
  params: { pollingFrequency: number; startDate: string; endDate: string },
  config: UseQueryOptions<unknown>,
  eServiceId: string
) {
  return useQuery({
    queryKey: ['GetEserviceProbingData', params],
    queryFn: () => MonitoringServices.getFilteredTelemetryData(params, eServiceId),
    ...config,
  })
}

export const MonitoringQueries = {
  useGetList,
  useGetProducersList,
}
