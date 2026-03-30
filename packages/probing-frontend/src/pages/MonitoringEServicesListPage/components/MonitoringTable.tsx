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
import { Box, Skeleton } from '@mui/material'
import type { TFunction } from 'i18next'
import React from 'react'
import type { EService } from '@/api/monitoring/monitoring.models'
import { useHandleRefetch } from '@/hooks/useRefetch'
import { eserviceStateConfig } from '@/types/eservice-state.types'

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
  const { t: tCommon } = useTranslation('common')
  const [totalEServices, setTotalEServices] = React.useState<number | undefined>()
  const { paginationParams, paginationProps, getTotalPageCount } = usePagination({ limit: 10 })
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
      min: 1,
    },
    {
      name: 'state',
      type: 'autocomplete-multiple',
      label: t('serviceStateFilter'),
      options: [
        { value: 'ONLINE', label: tCommon(eserviceStateConfig.ONLINE.labelKey) },
        { value: 'OFFLINE', label: tCommon(eserviceStateConfig.OFFLINE.labelKey) },
        { value: 'N_D', label: tCommon(eserviceStateConfig.N_D.labelKey) },
      ],
    },
  ])

  const params = {
    ...paginationParams,
    ...filtersParams,
  }

  const { data: eservices, refetch, isLoading } = MonitoringQueries.useGetList(params)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (eservices?.totalElements !== undefined) {
      setTotalEServices(eservices.totalElements)
    }
  }, [eservices?.totalElements])

  React.useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: 'auto' })
  }, [paginationParams.offset])

  const handleRefetch = useHandleRefetch<EService>(refetch)

  return (
    <Box ref={scrollRef}>
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

      {isLoading ? (
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

      <Pagination {...paginationProps} totalPages={getTotalPageCount(totalEServices)} />
    </Box>
  )
}

const TableSkeleton: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' })

  const generateSkeleton = () => {
    return headLabels(t).map((label) => <Skeleton sx={{ my: 0.5 }} key={label} />)
  }

  return (
    <Table headLabels={headLabels(t)}>
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
      <TableRow cellData={generateSkeleton()} />
    </Table>
  )
}
