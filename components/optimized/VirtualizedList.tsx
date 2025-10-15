'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export default function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 가상화 계산
  const virtualizedItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + height) / itemHeight) + overscan
    )

    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      originalIndex: startIndex + index,
      top: (startIndex + index) * itemHeight
    }))
  }, [items, scrollTop, height, itemHeight, overscan])

  // 스크롤 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // 스크롤 위치 동기화
  useEffect(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  // 특정 아이템으로 스크롤
  const scrollToItem = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight
    }
  }, [itemHeight])

  // 스크롤 위치 복원
  const restoreScrollPosition = useCallback((position: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = position
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      {/* 전체 높이를 위한 스페이서 */}
      <div style={{ height: items.length * itemHeight }}>
        {/* 가상화된 아이템들 */}
        {virtualizedItems.map(({ item, originalIndex, top }) => (
          <div
            key={originalIndex}
            style={{
              position: 'absolute',
              top,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, originalIndex)}
          </div>
        ))}
      </div>
    </div>
  )
}

// 특정 용도별 가상화 컴포넌트들
export function VirtualizedTable<T>({
  items,
  columns,
  height = 400,
  rowHeight = 50,
  ...props
}: {
  items: T[]
  columns: {
    key: string
    header: string
    width?: number
    render?: (value: any, item: T, index: number) => React.ReactNode
  }[]
  height?: number
  rowHeight?: number
  [key: string]: any
}) {
  const renderItem = useCallback((item: T, index: number) => (
    <div className="flex border-b border-gray-200 hover:bg-gray-50">
      {columns.map((column) => (
        <div
          key={column.key}
          className="px-4 py-3 text-sm text-gray-900"
          style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
        >
          {column.render
            ? column.render((item as any)[column.key], item, index)
            : (item as any)[column.key]}
        </div>
      ))}
    </div>
  ), [columns])

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* 테이블 헤더 */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-3 text-sm font-medium text-gray-700"
            style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* 가상화된 테이블 바디 */}
      <VirtualizedList
        items={items}
        height={height}
        itemHeight={rowHeight}
        renderItem={renderItem}
        {...props}
      />
    </div>
  )
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  columns = 3,
  height = 400,
  itemHeight = 200,
  gap = 16,
  ...props
}: {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  columns?: number
  height?: number
  itemHeight?: number
  gap?: number
  [key: string]: any
}) {
  const gridItemHeight = itemHeight + gap
  const gridItems = useMemo(() => {
    const result = []
    for (let i = 0; i < items.length; i += columns) {
      result.push({
        row: Math.floor(i / columns),
        items: items.slice(i, i + columns)
      })
    }
    return result
  }, [items, columns])

  const renderGridRow = useCallback(({ row, items: rowItems }: { row: number; items: T[] }, index: number) => (
    <div className="flex gap-4">
      {rowItems.map((item, colIndex) => (
        <div key={colIndex} className="flex-1">
          {renderItem(item, row * columns + colIndex)}
        </div>
      ))}
      {/* 빈 열 채우기 */}
      {Array.from({ length: columns - rowItems.length }).map((_, colIndex) => (
        <div key={`empty-${colIndex}`} className="flex-1" />
      ))}
    </div>
  ), [renderItem, columns])

  return (
    <VirtualizedList
      items={gridItems}
      height={height}
      itemHeight={gridItemHeight}
      renderItem={renderGridRow}
      {...props}
    />
  )
}

// 성능 모니터링 훅
export function useVirtualizationMetrics() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    scrollEvents: 0,
    lastRenderTime: 0
  })

  const trackRender = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: performance.now()
    }))
  }, [])

  const trackScroll = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      scrollEvents: prev.scrollEvents + 1
    }))
  }, [])

  return { metrics, trackRender, trackScroll }
}
