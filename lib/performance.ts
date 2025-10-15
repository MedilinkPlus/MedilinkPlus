// 프론트엔드 성능 최적화 유틸리티
// ==========================================

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// 1. 디바운스 훅
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;
}

// 2. 쓰로틀 훅
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        callback(...args);
        lastCall.current = now;
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current);
        }
        lastCallTimer.current = setTimeout(() => {
          callback(...args);
          lastCall.current = Date.now();
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay]
  ) as T;
}

// 3. 가상화를 위한 훅
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    containerRef,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
}

// 4. 이미지 지연 로딩 훅
export function useLazyImage(src: string, placeholder: string = '') {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>();

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setImageSrc(placeholder);
      setIsLoaded(false);
    };
  }, [src, placeholder]);

  return { imageSrc, isLoaded, imgRef };
}

// 5. 메모이제이션된 정렬/필터링
export function useMemoizedData<T>(
  data: T[],
  sortBy?: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc',
  filters?: Partial<Record<keyof T, any>>
) {
  return useMemo(() => {
    let processedData = [...data];

    // 필터링
    if (filters) {
      processedData = processedData.filter(item =>
        Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null || value === '') return true;
          const itemValue = item[key as keyof T];
          if (typeof value === 'string') {
            return String(itemValue).toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        })
      );
    }

    // 정렬
    if (sortBy) {
      processedData.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processedData;
  }, [data, sortBy, sortOrder, filters]);
}

// 6. 무한 스크롤 훅
export function useInfiniteScroll<T>(
  fetchData: (page: number) => Promise<T[]>,
  pageSize: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newData = await fetchData(page);
      if (newData.length < pageSize) {
        setHasMore(false);
      }
      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, pageSize, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return {
    data,
    loading,
    hasMore,
    loadMore,
    reset
  };
}

// 7. 성능 모니터링 훅
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    const renderTime = now - lastRenderTime.current;
    
    if (renderTime > 16) { // 60fps 기준
      console.warn(
        `${componentName} 렌더링이 느림: ${renderTime.toFixed(2)}ms (${renderCount.current}번째 렌더)`
      );
    }
    
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current
  };
}

// 8. 웹 워커를 위한 훅
export function useWebWorker<T>(
  workerScript: string,
  onMessage?: (data: T) => void
) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof Window !== 'undefined') {
      workerRef.current = new Worker(workerScript);
      
      if (onMessage) {
        workerRef.current.onmessage = (event) => onMessage(event.data);
      }

      return () => {
        if (workerRef.current) {
          workerRef.current.terminate();
        }
      };
    }
  }, [workerScript, onMessage]);

  const postMessage = useCallback((data: any) => {
    if (workerRef.current) {
      workerRef.current.postMessage(data);
    }
  }, []);

  return { postMessage, worker: workerRef.current };
}

// 9. 캐시 훅
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5분
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const getCachedData = useCallback(async () => {
    const cached = cacheRef.current.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      setData(cached.data);
      return cached.data;
    }

    setLoading(true);
    try {
      const freshData = await fetcher();
      cacheRef.current.set(key, {
        data: freshData,
        timestamp: Date.now()
      });
      setData(freshData);
      return freshData;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    getCachedData();
  }, [getCachedData]);

  return {
    data,
    loading,
    refetch: getCachedData,
    invalidate: invalidateCache
  };
}

// 10. 성능 최적화 유틸리티 함수들
export const performanceUtils = {
  // 배열 청크 분할
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // 배열 중복 제거
  unique: <T>(array: T[], key?: keyof T): T[] => {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      });
    }
    return Array.from(new Set(array));
  },

  // 깊은 복사 (성능 최적화)
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => performanceUtils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = performanceUtils.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  },

  // 디바운스 함수
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  },

  // 쓰로틀 함수
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }
};
