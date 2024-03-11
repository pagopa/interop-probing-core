import { useTranslation } from 'react-i18next'
import { max, scaleLinear, scaleBand } from 'd3'
import { ChartsLegend } from './ChartsLegend'
import type { Percentage } from '@/api/monitoring/monitoring.models'
import { CHART_COLORS } from './commons'

type BarChartProps = {
  data: Array<Percentage>
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
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
    <g transform="translate(15, 50)">
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
      <svg height={240} role="img" display="block">
        <g transform="translate(15, 17)">
          <text>
            <tspan fontFamily="Titillium Web" fontSize="18px" color="#17324D" fontWeight="700">
              {t('titleOperativita')}
            </tspan>
          </text>
        </g>
        <Bars />
      </svg>
      <ChartsLegend legendElements={legendElements} />
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
