import type { MainEservice } from '@/api/monitoring/monitoring.models'
import { Box } from '@mui/material'
import { ButtonNaked } from '@pagopa/mui-italia'
import { useTranslation } from 'react-i18next'
import LaunchIcon from '@mui/icons-material/Launch'
import LockIcon from '@mui/icons-material/Lock'
import { Link } from 'react-router-dom'
import { MonitoringInformationContainer } from './MonitoringInformationContainer'
import { CATALOGUE_BASE_PATH } from '@/config/constants'

export const MonitoringEserviceDetail = ({
  eservicesDetail,
}: {
  eservicesDetail: MainEservice | undefined
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'detailsPage',
  })

  const getUrl = () => {
    return `${CATALOGUE_BASE_PATH}ui/it/fruizione/catalogo-e-service/${eservicesDetail?.eserviceId}/${eservicesDetail?.versionId}`
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '600px' }}>
      <MonitoringInformationContainer
        label="producerName"
        content={eservicesDetail?.producerName || ''}
      />
      <MonitoringInformationContainer
        label="version"
        content={eservicesDetail?.versionNumber || ''}
      />
      <MonitoringInformationContainer
        label="eServiceTab"
        content={
          <ButtonNaked
            color="primary"
            size="small"
            startIcon={<LockIcon />}
            endIcon={<LaunchIcon />}
            component={Link}
            target="_blank"
            to={getUrl()}
          >
            {t('viewInCatalog')}
          </ButtonNaked>
        }
      />
    </Box>
  )
}
