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
  status: 'OK' | 'N/D' | 'KO' // Assuming the possible status are OK, N/D, and KO
}

export type TelemetryData = {
  performances: unknown[] // TODO: type data
  failures: unknown[] // TODO: type data
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
  state: 'OK' | 'N/D' | 'KO' // Assuming the possible states are OK, N/D, and KO
  responseReceived: string | null
  eserviceActive: boolean
}
