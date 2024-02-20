import { Typography } from '@mui/material'
import { InformationContainer } from '@pagopa/interop-fe-commons'
import { useTranslation } from 'react-i18next'
export type TranslationKeys = {
  subtitle: string
  producerName: string
  version: string
  eServiceTab: string
  viewInCatalog: string
  returnToList: string
  realTimeTitle: string
  refresh: string
  monitoringState: string
  eserviceState: string
  lastRelevationDate: string
  success: string
  error: string
  warning: string
  active: string
  suspended: string
  alerts: {
    monitoringSuspended: string
    monitoringSystemSuspendedMessage: string
    versionSuspendedMessage: string
    eserviceNotAnswerMessage: string
    genericAlert: string
  }
}

export const MonitoringInformationContainer = ({
  label,
  content,
}: {
  label: keyof Omit<TranslationKeys, 'alerts'>
  content: JSX.Element | string | number
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'detailsPage',
  })
  return (
    <InformationContainer
      sx={{ minWidth: '500px', mb: '20px', textAlign: 'left' }}
      label={t(label)}
      content={
        <Typography component="h3" variant="caption-semibold">
          {content}
        </Typography>
      }
    />
  )
}
