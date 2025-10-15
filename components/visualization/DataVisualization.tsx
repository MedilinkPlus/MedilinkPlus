'use client'

import { useState, useEffect, useMemo } from 'react'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut'
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  animate?: boolean
}

interface DataVisualizationProps {
  data: ChartData[]
  config?: ChartConfig
  title?: string
  className?: string
}

export default function DataVisualization({
  data,
  config = { type: 'bar', height: 300, showLegend: true, showGrid: true, animate: true },
  title,
  className = ""
}: DataVisualizationProps) {
  const [isVisible, setIsVisible] = useState(false)

  // 데이터 정규화
  const normalizedData = useMemo(() => {
    if (data.length === 0) return []
    
    const maxValue = Math.max(...data.map(d => d.value))
    return data.map((item, index) => ({
      ...item,
      normalizedValue: maxValue > 0 ? (item.value / maxValue) * 100 : 0,
      color: item.color || getDefaultColor(index)
    }))
  }, [data])

  // 기본 색상 팔레트
  const getDefaultColor = (index: number) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
    ]
    return colors[index % colors.length]
  }

  // 차트 렌더링
  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return renderBarChart()
      case 'line':
        return renderLineChart()
      case 'pie':
        return renderPieChart()
      case 'doughnut':
        return renderDoughnutChart()
      default:
        return renderBarChart()
    }
  }

  // 막대 차트 렌더링
  const renderBarChart = () => (
    <div className="relative" style={{ height: config.height }}>
      <svg className="w-full h-full" viewBox={`0 0 100 ${config.height}`}>
        {config.showGrid && (
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
            </pattern>
          </defs>
        )}
        
        {config.showGrid && (
          <rect width="100" height={config.height} fill="url(#grid)" />
        )}
        
        {normalizedData.map((item, index) => {
          const barWidth = 100 / normalizedData.length
          const barHeight = item.normalizedValue
          const x = (index * barWidth) + (barWidth * 0.1)
          const y = config.height! - barHeight
          
          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill={item.color}
                className={config.animate ? 'animate-pulse' : ''}
                rx="2"
              />
              <text
                x={x + (barWidth * 0.4)}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {item.value}
              </text>
              <text
                x={x + (barWidth * 0.4)}
                y={config.height! + 15}
                textAnchor="middle"
                className="text-xs fill-gray-500"
                transform={`rotate(-45 ${x + (barWidth * 0.4)} ${config.height! + 15})`}
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )

  // 선 차트 렌더링
  const renderLineChart = () => (
    <div className="relative" style={{ height: config.height }}>
      <svg className="w-full h-full" viewBox={`0 0 100 ${config.height}`}>
        {config.showGrid && (
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
            </pattern>
          </defs>
        )}
        
        {config.showGrid && (
          <rect width="100" height={config.height} fill="url(#grid)" />
        )}
        
        <polyline
          fill="none"
          stroke={normalizedData[0]?.color || '#3B82F6'}
          strokeWidth="2"
          points={normalizedData.map((item, index) => {
            const x = (index / (normalizedData.length - 1)) * 100
            const y = config.height! - item.normalizedValue
            return `${x},${y}`
          }).join(' ')}
          className={config.animate ? 'animate-pulse' : ''}
        />
        
        {normalizedData.map((item, index) => {
          const x = (index / (normalizedData.length - 1)) * 100
          const y = config.height! - item.normalizedValue
          
          return (
            <g key={item.label}>
              <circle
                cx={x}
                cy={y}
                r="3"
                fill={item.color}
                className={config.animate ? 'animate-pulse' : ''}
              />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {item.value}
              </text>
              <text
                x={x}
                y={config.height! + 15}
                textAnchor="middle"
                className="text-xs fill-gray-500"
                transform={`rotate(-45 ${x} ${config.height! + 15})`}
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )

  // 원형 차트 렌더링
  const renderPieChart = () => {
    const radius = Math.min(40, config.height! / 2 - 10)
    const centerX = 50
    const centerY = config.height! / 2
    
    let currentAngle = 0
    const total = normalizedData.reduce((sum, item) => sum + item.value, 0)
    
    return (
      <div className="relative" style={{ height: config.height }}>
        <svg className="w-full h-full" viewBox={`0 0 100 ${config.height}`}>
          {normalizedData.map((item, index) => {
            const sliceAngle = (item.value / total) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + sliceAngle
            
            const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
            const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
            const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
            const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)
            
            const largeArcFlag = sliceAngle > 180 ? 1 : 0
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ')
            
            currentAngle = endAngle
            
            return (
              <g key={item.label}>
                <path
                  d={pathData}
                  fill={item.color}
                  className={config.animate ? 'animate-pulse' : ''}
                />
                <text
                  x={centerX + (radius * 0.7) * Math.cos(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
                  y={centerY + (radius * 0.7) * Math.sin(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                >
                  {Math.round((item.value / total) * 100)}%
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // 도넛 차트 렌더링
  const renderDoughnutChart = () => {
    const outerRadius = Math.min(40, config.height! / 2 - 10)
    const innerRadius = outerRadius * 0.6
    const centerX = 50
    const centerY = config.height! / 2
    
    let currentAngle = 0
    const total = normalizedData.reduce((sum, item) => sum + item.value, 0)
    
    return (
      <div className="relative" style={{ height: config.height }}>
        <svg className="w-full h-full" viewBox={`0 0 100 ${config.height}`}>
          {normalizedData.map((item, index) => {
            const sliceAngle = (item.value / total) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + sliceAngle
            
            const x1 = centerX + outerRadius * Math.cos((startAngle - 90) * Math.PI / 180)
            const y1 = centerY + outerRadius * Math.sin((startAngle - 90) * Math.PI / 180)
            const x2 = centerX + outerRadius * Math.cos((endAngle - 90) * Math.PI / 180)
            const y2 = centerY + outerRadius * Math.sin((endAngle - 90) * Math.PI / 180)
            
            const x1Inner = centerX + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180)
            const y1Inner = centerY + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180)
            const x2Inner = centerX + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180)
            const y2Inner = centerY + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180)
            
            const largeArcFlag = sliceAngle > 180 ? 1 : 0
            
            const pathData = [
              `M ${x1} ${y1}`,
              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `L ${x2Inner} ${y2Inner}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
              'Z'
            ].join(' ')
            
            currentAngle = endAngle
            
            return (
              <g key={item.label}>
                <path
                  d={pathData}
                  fill={item.color}
                  className={config.animate ? 'animate-pulse' : ''}
                />
              </g>
            )
          })}
          
          {/* 중앙 텍스트 */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            className="text-sm font-semibold fill-gray-700"
          >
            총 {total}
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            항목
          </text>
        </svg>
      </div>
    )
  }

  // Intersection Observer로 애니메이션 트리거
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.querySelector(`[data-chart="${title || 'chart'}"]`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [title])

  if (data.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <i className="ri-bar-chart-line text-4xl text-gray-300 mb-2" />
        <p className="text-gray-500">표시할 데이터가 없습니다</p>
      </div>
    )
  }

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
      data-chart={title || 'chart'}
    >
      {/* 헤더 */}
      {title && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      {/* 차트 */}
      <div className="p-4">
        <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {renderChart()}
        </div>
      </div>

      {/* 범례 */}
      {config.showLegend && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            {normalizedData.map((item, index) => (
              <div key={item.label} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">
                  {item.label} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
