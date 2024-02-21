import axiosInstance from '@/config/axios'
import type { EService } from '@/api/monitoring/monitoring.models'
import type { FilterOption } from '@pagopa/interop-fe-commons'

async function getList(params?: { limit: number; offset: number }): Promise<EService> {
  const response = await axiosInstance.get<EService>(
    `${import.meta.env.VITE_BASE_PATH}/eservices`,
    {
      params,
    }
  )
  return response.data
}

async function getProducersList(params: { producerName: string }): Promise<FilterOption[]> {
  const response = await axiosInstance.get<FilterOption[]>(
    `${import.meta.env.VITE_BASE_PATH}/producers`,
    {
      params,
    }
  )
  return response.data
}

const MonitoringServices = {
  getList,
  getProducersList,
}

export default MonitoringServices
