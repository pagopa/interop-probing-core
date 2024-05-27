import { useTranslation } from 'react-i18next'
import type { ScaleTime } from 'd3'
import { timeFormat } from 'd3'
import type { FailurePerformance } from '@/api/monitoring/monitoring.models'
import { CHART_COLORS } from './commons'

type FailuresChartProps = {
  failures: FailurePerformance[]
  x: ScaleTime<number, number, never>
}

export const FailuresChart: React.FC<FailuresChartProps> = ({ failures, x }) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage' })

  const XTicks = () => {
    return (
      <g opacity="40%" fontSize={10} textAnchor="middle">
        {x.ticks().map((d) => (
          <g opacity="1" className="tick" transform={`translate(${x(d)}, 0)`} key={d.getTime()}>
            <text y="5" dy="0.71em">
              {timeFormat('%d / %m')(new Date(d))}
            </text>
            <text y="25">{timeFormat('%H:%M')(new Date(d))}</text>
          </g>
        ))}
      </g>
    )
  }

  const FailuresPoints = () => {
    return (
      <g className="failures-header" transform={`translate(0, 15)`}>
        <text>
          <tspan fontFamily="Titillium Web" color="#17324D" fontWeight="700">
            {t('lineChartFailuresTitle')}
          </tspan>
        </text>
      </g>
    )
  }

  const FailuresHeader = () => {
    return (
      <g className="points" transform={`translate(20, 50)`}>
        {failures.map((failure, index) => (
          <circle
            key={x(new Date(failure.time))}
            cx={x(new Date(failure.time))}
            cy={index > 0 && failure.time === failures[index - 1].time ? -8 : 0}
            r="3"
            fill={CHART_COLORS[failure.status]}
          />
        ))}
      </g>
    )
  }

  return (
    <svg className="line-chart-container-failures" height={100} width="100%" role="img">
      <FailuresHeader />
      <g className="scales" transform={`translate(20,50)`}>
        <XTicks />
        <g fontFamily="Poppins" opacity={0.4} fontSize={10} textAnchor="end">
          <g opacity="1" className="tick">
            <line stroke="currentColor" x2={0} strokeOpacity="0.2" />
            <line stroke="currentColor" x2={600} strokeOpacity="0.2" />
          </g>
        </g>
      </g>
      <FailuresPoints />
    </svg>
  )
}
