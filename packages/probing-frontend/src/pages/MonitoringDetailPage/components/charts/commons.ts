import type { ProbingResponseStatus } from '@/api/monitoring/monitoring.models'

export const CHART_COLORS = {
  OK: '#17324D',
  KO: '#FE6666',
  N_D: '#A2ADB8',
} as const satisfies Record<ProbingResponseStatus, string>
