import axiosInstance from '@/config/axios'
import type {
  EService,
  MainEservice,
  ProbingEservice,
  TelemetryData,
} from '@/api/monitoring/monitoring.models'
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

async function getEServiceMainData({ eserviceId }: { eserviceId: string }): Promise<MainEservice> {
  const response = await axiosInstance.get<MainEservice>(
    `${API_BASE_PATH}/eservices/mainData/${eserviceId}`
  )
  return response.data
}
async function getEserviceProbingData({
  eserviceId,
}: {
  eserviceId: string
}): Promise<ProbingEservice> {
  const response = await axiosInstance.get<ProbingEservice>(
    `${API_BASE_PATH}/eservices/probingData/${eserviceId}`
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
    `${API_BASE_PATH}/telemetryData/eservices/${eserviceId}`,
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
): Promise<TelemetryData> {
  const response = await axiosInstance.get<TelemetryData>(
    `${API_BASE_PATH}/telemetryData/eservices/filtered/${eserviceId}`,
    { params }
  )
  return response.data
}

const MonitoringServices = {
  getList,
  getProducersList,
  getTelemetryData,
  getEserviceProbingData,
  getEServiceMainData,
  getFilteredTelemetryData,
}

export default MonitoringServices
