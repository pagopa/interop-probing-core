import React from 'react'
import type { ScaleLinear, ScaleTime } from 'd3'
import { line, timeFormat, curveCatmullRom } from 'd3'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'
import type { ServicePerformance } from '@/api/monitoring/monitoring.models'

const curveType = curveCatmullRom.alpha(0.5)

interface IProps {
  data: Array<ServicePerformance>
  xScale: ScaleTime<number, number, never>
  yScale: ScaleLinear<number, number, never>
}

const LineChart: React.FC<IProps> = ({ data, xScale, yScale }) => {
  const { t } = useTranslation('common', { keyPrefix: 'detailsPage' })

  const header = (
    <g className="bar-header" transform={`translate(10, 20)`}>
      <text>
        <tspan fontFamily="Titillium Web" fontSize="18px" color="#17324D" fontWeight="700">
          {t('lineChartTitle')}
        </tspan>
      </text>
    </g>
  )

  const renderXTicks = () => {
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
            <text y="15" dy="0.71em">
              {timeFormat('%d / %m')(new Date(d))}
            </text>
            <text y="35">{timeFormat('%H:%M')(new Date(d))}</text>
          </g>
        ))}
      </g>
    )
  }

  const renderYTicks = () => {
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
    <Box>
      <svg className="line-chart-container" width={650} height={400} role="img">
        {header}
        <g className="scales" transform={`translate(50, 60)`}>
          {renderXTicks()}
          {renderYTicks()}
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
    </Box>
  )
}

export default LineChart
