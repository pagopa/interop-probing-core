type StatusType = 'OK' | 'N/D' | 'KO' | 'OFFLINE'

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
  status: StatusType // Assuming the possible status are OK, N/D, KO, and OFFLINE
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
  state: StatusType // Assuming the possible states are OK, N/D, KO, and OFFLINE
  responseReceived: string | null
  eserviceActive: boolean
}

export type ServicePerformance = {
  responseTime: number
  status: StatusType
  time: string
}

export type FailurePerformance = {
  status: Exclude<StatusType, 'OFFLINE'>
  time: string
}

export const mockResponse: TelemetryData = {
  performances: [
    {
      responseTime: 40,
      status: 'OK' as const,
      time: '2024-02-27T15:17:01.579Z',
    },
    {
      responseTime: 70,
      status: 'OK' as const,
      time: '2024-02-27T19:33:07.271Z',
    },
    {
      responseTime: 38,
      status: 'OK' as const,
      time: '2024-02-27T20:53:07.271Z',
    },
    {
      responseTime: 58,
      status: 'OK' as const,
      time: '2024-02-27T23:03:07.271Z',
    },
    {
      responseTime: 61,
      status: 'OK' as const,
      time: '2024-02-27T10:39:01.371Z',
    },
  ].sort((a, b) => a.time.localeCompare(b.time)),
  failures: [
    {
      status: 'KO' as const,
      time: '2024-01-26T00:30:00Z',
    },
    {
      status: 'KO' as const,
      time: '2024-02-26T05:30:00Z',
    },
    {
      status: 'KO' as const,
      time: '2024-02-26T10:30:00Z',
    },
  ],
  percentages: [
    {
      value: 94.28572,
      status: 'OK' as const,
    },
    {
      value: 5.714286,
      status: 'KO' as const,
    },
  ],
}
