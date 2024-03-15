export type ProbingResponseStatus = 'OK' | 'KO' | 'N/D'
export type ProbingEServiceMonitorState = 'N/D' | 'OFFLINE' | 'ONLINE'

export type EserviceContent = {
  eserviceRecordId: number
  eserviceName: string
  producerName: string
  responseReceived: string | null
  state: string
  versionNumber: number
}

export type EService = {
  content: Array<EserviceContent>
  totalElements: number
  limit: number
  offset: number
}

export type Percentage = {
  value: number
  status: ProbingResponseStatus
}

export type TelemetryData = {
  performances: ServicePerformance[]
  failures: FailurePerformance[]
  percentages: Percentage[]
}

export type MainEservice = {
  eserviceName: string
  versionNumber: number
  producerName: string
  pollingFrequency: number
  versionId: string
  eserviceId: string
}

export type ProbingEservice = {
  probingEnabled: boolean
  state: ProbingEServiceMonitorState
  responseReceived: string | null
  eserviceActive: boolean
}

export type ServicePerformance = {
  responseTime: number
  status: ProbingResponseStatus
  time: string
}

export type FailurePerformance = {
  status: ProbingResponseStatus
  time: string
}
