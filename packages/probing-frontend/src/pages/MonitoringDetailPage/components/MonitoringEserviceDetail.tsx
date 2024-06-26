import type { MainEservice } from '@/api/monitoring/monitoring.models'
import { Skeleton, Stack } from '@mui/material'
import { ButtonNaked } from '@pagopa/mui-italia'
import { useTranslation } from 'react-i18next'
import LaunchIcon from '@mui/icons-material/Launch'
import LockIcon from '@mui/icons-material/Lock'
import { Link } from 'react-router-dom'
import { CATALOGUE_BASE_PATH } from '@/config/constants'
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

  const getExternalCatalogUrl = () => {
    return `${CATALOGUE_BASE_PATH}/ui/it/fruizione/catalogo-e-service/${eservicesDetail.eserviceId}/${eservicesDetail.versionId}`
  }

  return (
    <Stack spacing={3} sx={{ width: '100%', minWidth: '400px', maxWidth: '600px' }}>
      <InformationContainer label={t('producerName')} content={eservicesDetail.producerName} />
      <InformationContainer
        label={t('version')}
        content={eservicesDetail.versionNumber.toString()}
      />
      <InformationContainer
        label={t('eServiceTab')}
        content={
          <ButtonNaked
            color="primary"
            size="small"
            startIcon={<LockIcon />}
            endIcon={<LaunchIcon />}
            component={Link}
            target="_blank"
            to={getExternalCatalogUrl()}
          >
            {t('viewInCatalog')}
          </ButtonNaked>
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
