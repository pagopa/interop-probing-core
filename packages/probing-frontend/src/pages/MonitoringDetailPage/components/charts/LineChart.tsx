import type { ScaleLinear, ScaleTime } from 'd3'
import { line, timeFormat, curveCatmullRom } from 'd3'
import { useTranslation } from 'react-i18next'
import type { ServicePerformance } from '@/api/monitoring/monitoring.models'

type LineChartProps = {
  data: Array<ServicePerformance>
  xScale: ScaleTime<number, number, never>
  yScale: ScaleLinear<number, number, never>
}

const curveType = curveCatmullRom.alpha(0.5)

const LineChart: React.FC<LineChartProps> = ({ data, xScale, yScale }) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage' })

  const LineChartHeader = () => (
    <g className="bar-header" transform={`translate(10, 20)`}>
      <text>
        <tspan fontFamily="Titillium Web" fontSize="18px" color="#17324D" fontWeight="700">
          {t('lineChartTitle')}
        </tspan>
      </text>
    </g>
  )

  const XTicks = () => {
    return (
      <g transform={`translate(0, 300)`} opacity="40%" fontSize={10} textAnchor="middle">
        {xScale.ticks().map((d: Date) => (
          <g
            opacity="1"
            className="tick"
            transform={`translate(${xScale(d)}, 0)`}
            key={d.getTime()}
          >
            <line
              y2={0}
              transform={`translate(0, -300)`}
              strokeOpacity="0.2"
              stroke="currentColor"
            />
            <line
              y2={300}
              transform={`translate(0, -300)`}
              strokeOpacity="0.2"
              stroke="currentColor"
            />
            <text y="15" dy="0.75em">
              {timeFormat('%d / %m')(new Date(d))}
            </text>
            <text y="35">{timeFormat('%H:%M')(new Date(d))}</text>
          </g>
        ))}
      </g>
    )
  }

  const YTicks = () => {
    return (
      <g opacity="40%" fontSize={10} textAnchor="end">
        {yScale.ticks().map((d) => (
          <g key={d} opacity="1" className="tick" transform={`translate(-10, ${yScale(d)})`}>
            <line stroke="currentColor" x2={0} strokeOpacity="0.2" />
            <line stroke="currentColor" x2={550} strokeOpacity="0.2" />
            <text x="-16" dy="0.32em">{`${d}ms`}</text>
          </g>
        ))}
      </g>
    )
  }

  const createLine = line<ServicePerformance>()
    .curve(curveType)
    .defined((d) => d.responseTime !== 0)
    .x((d) => xScale(new Date(d.time)))
    .y((d) => yScale(d.responseTime ? d.responseTime : 0))

  return (
    <svg className="line-chart-container" display="block" height={430} width="100%">
      <LineChartHeader />
      <g className="scales" transform={`translate(50, 60)`}>
        <XTicks />
        <YTicks />
      </g>
      <path
        className="line"
        stroke="#17324D"
        strokeWidth="2"
        fill="none"
        d={createLine(data) || undefined}
        transform={`translate(50, 60)`}
      />
    </svg>
  )
}

export default LineChart
