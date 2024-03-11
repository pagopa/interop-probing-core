import {
  Filters,
  Pagination,
  useAutocompleteTextInput,
  useFilters,
  usePagination,
} from '@pagopa/interop-fe-commons'
import { Table, TableRow } from '@pagopa/interop-fe-commons'
import { ButtonNaked } from '@pagopa/mui-italia'
import { useTranslation } from 'react-i18next'
import RefreshIcon from '@mui/icons-material/Refresh'
import { MonitoringTableRow } from './MonitoringTableRow'
import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import { Skeleton } from '@mui/material'
import { useLoadingOverlay } from '@/stores'
import type { TFunction } from 'i18next'
import { delayedPromise } from '@/utils/common.utils'

const headLabels = (t: TFunction<'common', 'table'>): Array<string> => {
  return [
    t('eServiceName'),
    t('version'),
    t('producer'),
    t('eServiceStatus'),
    t('lastDetectionDate'),
    '',
  ]
}

export const MonitoringTable: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' })
  const { paginationParams, paginationProps, getTotalPageCount } = usePagination({ limit: 10 })
  const { showOverlay, hideOverlay } = useLoadingOverlay()

  const [producersAutocompleteTextInput, setProducersAutocompleteTextInput] =
    useAutocompleteTextInput()

  const { data: producerOptions } = MonitoringQueries.useGetProducersList({
    offset: 0,
    limit: 20,
    producerName: producersAutocompleteTextInput,
  })

  const { filtersParams, ...handlers } = useFilters([
    {
      name: 'eserviceName',
      type: 'freetext',
      label: t('serviceNameFilter'),
    },
    {
      name: 'producerName',
      type: 'autocomplete-single',
      label: t('serviceProducerFilter'),
      onTextInputChange: setProducersAutocompleteTextInput,
      options: producerOptions ?? [],
    },
    {
      name: 'versionNumber',
      type: 'numeric',
      label: t('serviceVersionFilter'),
    },
    {
      name: 'state',
      type: 'autocomplete-multiple',
      label: t('serviceStateFilter'),
      options: [
        { value: 'ONLINE', label: 'online' },
        { value: 'OFFLINE', label: 'offline' },
        { value: 'N_D', label: 'n/d' },
      ],
    },
  ])

  const params = {
    ...paginationParams,
    ...filtersParams,
  }

  const { data: eservices, refetch, isInitialLoading } = MonitoringQueries.useGetList(params)

  const handleRefetch = async () => {
    showOverlay(t('loading'))
    // We want show the loading overlay for at least 1 second, to avoid flickering
    await delayedPromise(refetch(), 1000)
    hideOverlay()
  }

  return (
    <>
      <Filters
        {...handlers}
        rightContent={
          <ButtonNaked
            color="primary"
            onClick={handleRefetch}
            size="small"
            startIcon={<RefreshIcon />}
          >
            {t('refresh')}
          </ButtonNaked>
        }
      />

      {isInitialLoading ? (
        <TableSkeleton />
      ) : (
        <Table
          headLabels={headLabels(t)}
          isEmpty={!eservices || eservices?.content?.length === 0}
          noDataLabel={t('noDataLabel')}
        >
          {eservices?.content?.map((eService) => (
            <MonitoringTableRow key={eService.eserviceRecordId} row={eService} />
          ))}
        </Table>
      )}

      <Pagination {...paginationProps} totalPages={getTotalPageCount(eservices?.totalElements)} />
    </>
  )
}

const TableSkeleton: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' })

  const generateSkeleton = () => {
    return headLabels(t).map((label) => <Skeleton key={label} />)
  }

  return (
    <Table headLabels={headLabels(t)}>
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
    </Table>
  )
}
