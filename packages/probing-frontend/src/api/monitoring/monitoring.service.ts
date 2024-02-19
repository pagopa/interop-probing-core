import axiosInstance from '@/config/axios'
import type { EService, TelemetryData } from '@/api/monitoring/monitoring.models'
import type { FilterOption } from '@pagopa/interop-fe-commons'
import { API_BASE_PATH } from '@/config/constants'

async function getList(params?: { limit: number; offset: number }): Promise<EService> {
  const response = await axiosInstance.get<EService>(`${API_BASE_PATH}/eservices`, {
    params,
  })
  return response.data
}

async function getProducersList(params: { producerName: string }): Promise<FilterOption[]> {
  const response = await axiosInstance.get<FilterOption[]>(`${API_BASE_PATH}/producers`, {
    params,
  })
  return response.data
}

async function getEserviceData<EserviceResponse>({
  eserviceId,
  type,
}: {
  eserviceId: string
  type: 'main' | 'probing'
}): Promise<EserviceResponse> {
  const response = await axiosInstance.get<EserviceResponse>(
    `${import.meta.env.VITE_BASE_PATH}/eservices/${type}Data/${eserviceId}`
  )
  return response.data
}

async function getTelemetryData({
  eserviceId,
  pollingFrequency,
}: {
  eserviceId: string
  pollingFrequency: number
}): Promise<TelemetryData> {
  const response = await axiosInstance.get<TelemetryData>(
    `${import.meta.env.VITE_BASE_PATH}/telemetryData/eservices/${eserviceId}`,
    { params: { pollingFrequency } }
  )
  return response.data
}

async function getFilteredTelemetryData(
  params: {
    pollingFrequency: number
    startDate: string
    endDate: string
  },
  eserviceId: string
): Promise<unknown> {
  // TODO: type data
  const response = await axiosInstance.get<unknown>(
    `${import.meta.env.VITE_BASE_PATH}/telemetryData/eservices/filtered/${eserviceId}`,
    { params }
  )
  return response.data
}

const MonitoringServices = {
  getList,
  getProducersList,
  getEserviceData,
  getTelemetryData,
  getFilteredTelemetryData,
}

export default MonitoringServices
