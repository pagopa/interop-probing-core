import type { MainEservice } from '@/api/monitoring/monitoring.models'
import { Skeleton, Stack } from '@mui/material'
import { CopyToClipboardButton } from '@pagopa/mui-italia'
import { useTranslation } from 'react-i18next'
import { InformationContainer } from '@pagopa/interop-fe-commons'

type MonitoringEserviceDetailProps = {
  eservicesDetail: MainEservice
}

export const MonitoringEserviceDetail: React.FC<MonitoringEserviceDetailProps> = ({
  eservicesDetail,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'detailsPage',
  })

  return (
    <Stack spacing={3} sx={{ width: '100%', minWidth: '400px', maxWidth: '600px' }}>
      <InformationContainer label={t('producerName')} content={eservicesDetail.producerName} />
      <InformationContainer
        label={t('version')}
        content={eservicesDetail.versionNumber.toString()}
      />
      <InformationContainer
        label={t('eserviceID')}
        sx={{alignItems: 'center'}}
        content={
          <>
            {eservicesDetail.eserviceId}
            <CopyToClipboardButton
              size='small'
              color="primary"
              value={eservicesDetail.eserviceId}
              tooltipTitle={t('copySuccessFeedbackText')}
            />
          </>
        }
      />
    </Stack>
  )
}

export const MonitoringEserviceDetailSkeleton: React.FC = () => {
  return (
    <Skeleton
      variant="rectangular"
      sx={{ width: '100%', minWidth: '400px', maxWidth: '600px', height: 115 }}
    />
  )
}
