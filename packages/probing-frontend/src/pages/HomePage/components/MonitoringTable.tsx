import type { FilterFields, FilterOption } from '@pagopa/interop-fe-commons'
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
import { headLabels } from '@/config/constants'
import { MonitoringTableRow } from './MonitoringTableRow'
import { MonitoringQueries } from '@/api/monitoring/monitoring.hooks'
import { Skeleton } from '@mui/material'
import type { TFunction } from 'i18next'

export const MonitoringTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' })
  const { paginationParams, paginationProps, getTotalPageCount } = usePagination({ limit: 10 })
  const handleTextChange = (str: string) => setProducersAutocompleteTextInput(str)
  const [producersAutocompleteTextInput, setProducersAutocompleteTextInput] =
    useAutocompleteTextInput()
  const { data: producerOptions } = MonitoringQueries.useGetProducersList(
    { offset: 0, limit: 20, producerName: producersAutocompleteTextInput },
    { suspense: true }
  )
  const { filtersParams, ...handlers } = useFilters(
    getMonitoringFilters(t, handleTextChange, producerOptions)
  )

  const params = {
    ...paginationParams,
    ...filtersParams,
  }

  const { data: eservices, refetch, isFetching } = MonitoringQueries.useGetList(params, {})

  return (
    <>
      <Filters
        {...handlers}
        rightContent={
          <ButtonNaked
            color="primary"
            onClick={() => refetch()}
            size="small"
            startIcon={<RefreshIcon />}
          >
            {t('refresh')}
          </ButtonNaked>
        }
      />
      {isFetching || !eservices?.content ? (
        <TableSkeleton t={t} />
      ) : (
        <Table headLabels={headLabels(t)} isEmpty={!eservices || eservices?.content?.length === 0}>
          {eservices?.content?.map((eService) => (
            <MonitoringTableRow key={eService.eserviceRecordId} row={eService} />
          ))}
        </Table>
      )}
      <Pagination
        {...paginationProps}
        totalPages={getTotalPageCount(eservices?.totalElements) ?? 0}
      />
    </>
  )
}

const TableSkeleton = ({ t }: { t: TFunction<'common', 'table'> }) => {
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

const getMonitoringFilters = (
  t: TFunction<'common', 'table'>,
  onTextInputChange: (str: string) => void,
  producerOptions?: FilterOption[]
): FilterFields<string> => {
  return [
    {
      name: 'eserviceName',
      type: 'freetext',
      label: t('serviceNameFilter'),
    },
    {
      name: 'producerName',
      type: 'autocomplete-single',
      label: t('serviceProducerFilter'),
      onTextInputChange: onTextInputChange,
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
  ]
}
