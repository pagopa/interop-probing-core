import { useTranslation } from 'react-i18next'
import { max, scaleLinear, scaleBand } from 'd3'
import { ChartsLegend } from './ChartsLegend'
import { Box } from '@mui/system'
import type { Percentage } from '@/api/monitoring/monitoring.models'
import { CHART_COLORS } from './commons'

export const BarChart = ({ data }: { data: Array<Percentage> }) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage' })

  const legendElements = [
    { label: 'E-service online', color: '#17324D' },
    { label: t('monitoringSuspended'), color: '#A2ADB8' },
    { label: 'E-service offline', color: '#FE6666' },
  ]

  const maxValue = max(data, (d) => d.value) ?? 0
  const x = scaleLinear().domain([0, maxValue]).range([0, 300])
  const y = scaleBand()
    .domain(data.map((d) => d.status))
    .rangeRound([0, 170])
    .paddingInner(0.25)

  const Bars = () => (
    <g transform="translate(0, 50)">
      {data
        .filter((percentage) => percentage.value)
        .map((d) => (
          <Bar
            key={d.status}
            percentage={Math.round(d.value)}
            width={x(d.value)}
            bandWidth={y.bandwidth()}
            height={y(d.status) ?? 0}
            color={CHART_COLORS[d.status]}
          />
        ))}
    </g>
  )

  return (
    <>
      <Box>
        <svg className="bar-chart-container" width={430} height={240} role="img">
          <g className="bar-header" transform="translate(0, 20)">
            <text>
              <tspan fontFamily="Titillium Web" fontSize="18px" color="#17324D" fontWeight="700">
                {t('titleOperativita')}
              </tspan>
            </text>
          </g>
          <Bars />
        </svg>
        <ChartsLegend legendElements={legendElements} />
      </Box>
    </>
  )
}

type BarProps = {
  percentage: number
  width: number
  bandWidth: number
  height: number
  color: string
}

const Bar = ({ percentage, width, bandWidth, height, color }: BarProps) => {
  return (
    <g>
      <rect className="bar" y={height} width={width} height={bandWidth} fill={color}></rect>
      <text
        x={width}
        y={height}
        fontFamily="Titillium Web"
        fontSize="24px"
        color="#17324D"
        fontWeight="600"
        transform={`translate(10, ${bandWidth * 0.7})`}
      >
        {percentage + '%'}
      </text>
    </g>
  )
}
