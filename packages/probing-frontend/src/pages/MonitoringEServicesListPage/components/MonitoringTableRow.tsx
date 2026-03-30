import { TableRow } from '@pagopa/interop-fe-commons'
import { Chip, Tooltip } from '@mui/material'
import { formatDateString } from '@/utils/date.utils'
import { useTranslation } from 'react-i18next'
import type { EserviceContent } from '../../../api/monitoring/monitoring.models'
import { ButtonNaked } from '@pagopa/mui-italia'
import { useNavigate } from '@/router'
import React from 'react'
import { EserviceState, eserviceStateConfig } from '@/types/eservice-state.types'

type MonitoringTableRowProps = { row: EserviceContent }

export const MonitoringTableRow: React.FC<MonitoringTableRowProps> = ({ row }) => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  const config = eserviceStateConfig[row.state as EserviceState] ?? eserviceStateConfig.N_D

  return (
    <>
      <TableRow
        cellData={[
          row.eserviceName,
          row.versionNumber.toString(),
          row.producerName,
          <Tooltip key={row.eserviceRecordId} title={t(config.tooltipKey)}>
            <Chip
              label={t(config.labelKey)}
              size="small"
              color={config.color}
            />
          </Tooltip>,
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
