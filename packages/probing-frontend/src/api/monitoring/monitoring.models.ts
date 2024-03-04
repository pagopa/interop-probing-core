export type ProbingStatusType = 'OK' | 'N/D' | 'KO' | 'OFFLINE' | 'ONLINE'

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
  status: ProbingStatusType // Assuming the possible status are OK, N/D, KO, and OFFLINE
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
  state: ProbingStatusType // Assuming the possible states are OK, N/D, KO, and OFFLINE
  responseReceived: string | null
  eserviceActive: boolean
}

export type ServicePerformance = {
  responseTime: number
  status: ProbingStatusType
  time: string
}

export type FailurePerformance = {
  status: Exclude<ProbingStatusType, 'OFFLINE' | 'ONLINE'>
  time: string
}
