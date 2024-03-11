import { TableRow } from '@pagopa/interop-fe-commons'
import { Chip } from '@mui/material'
import { formatDateString } from '@/utils/date.utils'
import { useTranslation } from 'react-i18next'
import type { EserviceContent } from '../../../api/monitoring/monitoring.models'
import { ButtonNaked } from '@pagopa/mui-italia'
import { useNavigate } from '@/router'
import React from 'react'

type MonitoringTableRowProps = { row: EserviceContent }

export const MonitoringTableRow: React.FC<MonitoringTableRowProps> = ({ row }) => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  return (
    <>
      <TableRow
        cellData={[
          row.eserviceName,
          row.versionNumber.toString(),
          row.producerName,
          <Chip
            key={row.eserviceRecordId}
            label={row.state.toLowerCase()}
            size="small"
            color={
              row.state === 'ONLINE' ? 'success' : row.state === 'OFFLINE' ? 'error' : 'warning'
            }
          />,
          row.responseReceived ? formatDateString(row.responseReceived) : 'n/a',
          <ButtonNaked
            key={row.eserviceRecordId}
            size="small"
            color="primary"
            component={'button'}
            onClick={() =>
              navigate('MONITORING_DETAIL', { params: { id: row.eserviceRecordId.toString() } })
            }
          >
            {t('table.readMore')}
          </ButtonNaked>,
        ]}
      ></TableRow>
    </>
  )
}
