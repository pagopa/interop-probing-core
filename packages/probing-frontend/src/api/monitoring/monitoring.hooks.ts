import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import MonitoringServices from './monitoring.service'
import type { TelemetryData } from '@/api/monitoring/monitoring.models'

enum MonitoringQueryKeys {
  GetList = 'GetList',
  GetProducer = 'GetProducer',
  GetEserviceData = 'GetEserviceData',
  GetEserviceProbingData = 'GetEserviceProbingData',
  GetTelemetryData = 'GetTelemetryData',
  GetFilteredTelemetryData = 'GetFilteredTelemetryData',
}

function useGetList(params: { limit: number; offset: number }) {
  return useQuery({
    queryKey: [MonitoringQueryKeys.GetList, params],
    queryFn: () => MonitoringServices.getList(params),
  })
}

function useGetProducersList(params: { limit: number; offset: number; producerName: string }) {
  return useQuery({
    queryKey: [MonitoringQueryKeys.GetProducer, params],
    queryFn: () => MonitoringServices.getProducersList(params),
  })
}

function useGetEserviceData(params: { eserviceId: string }) {
  return useQuery({
    queryKey: [MonitoringQueryKeys.GetEserviceData, params],
    queryFn: () => MonitoringServices.getEServiceMainData({ ...params }),
  })
}

function useGetEserviceProbingData(params: { eserviceId: string }) {
  return useQuery({
    queryKey: [MonitoringQueryKeys.GetEserviceProbingData, params],
    queryFn: () => MonitoringServices.getEserviceProbingData({ ...params }),
  })
}

function useGetTelemetryData(params: { eserviceId: string; pollingFrequency: number }) {
  return useQuery({
    queryKey: [MonitoringQueryKeys.GetTelemetryData, params],
    queryFn: () => MonitoringServices.getTelemetryData(params),
  })
}

function useGetFilteredTelemetryData(
  params: { pollingFrequency: number; startDate: string; endDate: string },
  eserviceId: string,
  config: UseQueryOptions<TelemetryData>
) {
  return useQuery({
    queryKey: [MonitoringQueryKeys.GetFilteredTelemetryData, params],
    queryFn: () => MonitoringServices.getFilteredTelemetryData(params, eserviceId),
    enabled: !!(params.startDate || params.endDate),
    ...config,
  })
}

export const MonitoringQueries = {
  useGetList,
  useGetProducersList,
  useGetEserviceData,
  useGetEserviceProbingData,
  useGetTelemetryData,
  useGetFilteredTelemetryData,
}
