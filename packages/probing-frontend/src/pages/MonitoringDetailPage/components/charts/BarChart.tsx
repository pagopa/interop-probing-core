import { useTranslation } from 'react-i18next'
import type { ScaleLinear, ScaleBand } from 'd3'
import { max, scaleLinear, scaleBand } from 'd3'
import { ChartsLegend } from './ChartsLegend'
import { Box } from '@mui/system'

// margin convention often used with D3
const margin = { top: 20, right: 100, bottom: 20, left: 30 }
const width = 300
const height = 200

const color: { [key: string]: string } = {
  OK: '#17324D',
  'N/D': '#A2ADB8',
  KO: '#FE6666',
}

export const BarChart = ({ data }: { data: { status: string; value: number }[] }) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage' })
  const legendElements = [
    { label: 'E-service online', color: '#17324D' },
    { label: t('monitoringSuspended'), color: '#A2ADB8' },
    { label: 'E-service offline', color: '#FE6666' },
  ]
  const xMax: number = max(data, (d) => d.value) as number

  // x scale
  const x: ScaleLinear<number, number, never> = scaleLinear().domain([0, xMax]).range([0, width])

  // x scale
  const y: ScaleBand<string> = scaleBand()
    .domain(data.map((d) => d.status))
    .rangeRound([0, height - margin.left])
    .paddingInner(0.25)

  // header of the chart
  const header: JSX.Element = (
    <g className="bar-header" transform={`translate(0, ${margin.top})`}>
      <text>
        <tspan fontFamily="Titillium Web" fontSize="18px" color="#17324D" fontWeight="700">
          {t('titleOperativita')}
        </tspan>
      </text>
    </g>
  )

  // bars and bars' titles
  const bars: JSX.Element = (
    <g transform={`translate(0, ${margin.top * 2.5})`}>
      {data
        .filter((percentage) => percentage.value)
        .map((d: { status: string; value: number }) => (
          <g key={d.status}>
            <rect
              className="bar"
              y={y(d.status) as number}
              width={x(d.value)}
              height={y.bandwidth()}
              fill={color[d.status]}
            ></rect>
            <text
              x={x(d.value) as number}
              y={y(d.status)}
              fontFamily="Titillium Web"
              fontSize="24px"
              color="#17324D"
              fontWeight="600"
              transform={`translate(10, ${y.bandwidth() * 0.7})`}
            >
              {Math.round(d.value) + '%'}
            </text>
          </g>
        ))}
    </g>
  )

  return (
    <>
      <Box>
        <svg
          className="bar-chart-container"
          width={width + margin.left + margin.right}
          height={height + margin.top + margin.bottom}
          role="img"
        >
          {header}
          {bars}
        </svg>
        <ChartsLegend legendElements={legendElements} />
      </Box>
    </>
  )
}
