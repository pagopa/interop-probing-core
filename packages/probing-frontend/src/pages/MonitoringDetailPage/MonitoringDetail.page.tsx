import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import { Link, useParams } from '@/router'
import { MonitoringEserviceTelemetry } from './components/MonitoringEserviceTelemetry'
import { MonitoringEserviceProbing } from './components/MonitoringEserviceProbing'
import { MonitoringEserviceDetail } from './components/MonitoringEserviceDetail'
import { Box } from '@mui/system'
import { useTranslation } from 'react-i18next'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export const MonitoringDetailPage = () => {
  const { t } = useTranslation('common')
  const params = useParams()

  const { data: eservicesDetail } = MonitoringQueries.useGetEserviceData(
    { eServiceId: params?.id ?? '' },
    {}
  )
  const { data: eservicesProbingDetail, isSuccess: isSuccessProbing } =
    MonitoringQueries.useGetEserviceProbingData({ eServiceId: params?.id ?? '' }, {})

  const hasValidData = isSuccessProbing && eservicesDetail

  return (
    <>
      <MonitoringEserviceDetail eservicesDetail={eservicesDetail} />
      <hr />
      <MonitoringEserviceProbing eservicesProbingDetail={eservicesProbingDetail} />
      <hr />
      {hasValidData && (
        <MonitoringEserviceTelemetry
          params={params}
          pollingFrequency={eservicesDetail.pollingFrequency}
        />
      )}
      <Box sx={{ my: 4 }}>
        <Link to={'HOME'} as="button" startIcon={<ArrowBackIcon />} variant="naked">
          {t('loginForm.returnToList')}
        </Link>
      </Box>
    </>
  )
}
