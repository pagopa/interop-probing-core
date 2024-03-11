import { Typography } from '@mui/material'
import { InformationContainer } from '@pagopa/interop-fe-commons'

type MonitoringInformationContainerProps = {
  label: string
  content: JSX.Element | string | number
}

export const MonitoringInformationContainer: React.FC<MonitoringInformationContainerProps> = ({
  label,
  content,
}) => {
  return (
    <InformationContainer
      sx={{ minWidth: '400px', mb: '20px', textAlign: 'left' }}
      label={label}
      content={
        <Typography component="h3" variant="caption-semibold">
          {content}
        </Typography>
      }
    />
  )
}
