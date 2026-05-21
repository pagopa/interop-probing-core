export const eserviceStateConfig = {
    ONLINE: {
        labelKey: 'state.available.label',
        tooltipKey: 'state.available.tooltip',
        color: 'success',
    },
    OFFLINE: {
        labelKey: 'state.unavailable.label',
        tooltipKey: 'state.unavailable.tooltip',
        color: 'error',
    },
    N_D: {
        labelKey: 'state.unverified.label',
        tooltipKey: 'state.unverified.tooltip',
        color: 'warning',
    },
} as const
  
export type EserviceState = keyof typeof eserviceStateConfig