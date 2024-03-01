import axiosInstance from '@/config/axios'
import type { EService } from '@/api/monitoring/monitoring.models'
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

const MonitoringServices = {
  getList,
  getProducersList,
}

export default MonitoringServices
