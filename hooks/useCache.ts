import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
  staleWhileRevalidate?: boolean // Allow stale data while revalidating
}

interface UseCacheReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  get: (key: string) => T | null
  set: (key: string, data: T, options?: CacheOptions) => void
  remove: (key: string) => void
  clear: () => void
  refresh: (key: string) => Promise<void>
  isStale: (key: string) => boolean
}

// 메모리 캐시 저장소
const cache = new Map<string, CacheItem<any>>()
const defaultTTL = 5 * 60 * 1000 // 5분

// 캐시 정리 함수
const cleanupCache = (maxSize: number) => {
  if (cache.size <= maxSize) return

  const entries = Array.from(cache.entries())
  entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
  
  const toRemove = entries.slice(0, cache.size - maxSize)
  toRemove.forEach(([key]) => cache.delete(key))
}

// 캐시 유효성 검사
const isCacheValid = (item: CacheItem<any>): boolean => {
  return Date.now() - item.timestamp < item.ttl
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): UseCacheReturn<T> {
  const { ttl = defaultTTL, maxSize = 100, staleWhileRevalidate = true } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 캐시에서 데이터 가져오기
  const get = useCallback((cacheKey: string): T | null => {
    const item = cache.get(cacheKey)
    if (!item) return null
    
    if (isCacheValid(item)) {
      return item.data
    }
    
    // 만료된 데이터 제거
    cache.delete(cacheKey)
    return null
  }, [])

  // 캐시에 데이터 저장
  const set = useCallback((cacheKey: string, cacheData: T, cacheOptions?: CacheOptions) => {
    const itemTTL = cacheOptions?.ttl || ttl
    const itemMaxSize = cacheOptions?.maxSize || maxSize
    
    cache.set(cacheKey, {
      data: cacheData,
      timestamp: Date.now(),
      ttl: itemTTL
    })
    
    cleanupCache(itemMaxSize)
  }, [ttl, maxSize])

  // 캐시에서 데이터 제거
  const remove = useCallback((cacheKey: string) => {
    cache.delete(cacheKey)
  }, [])

  // 전체 캐시 정리
  const clear = useCallback(() => {
    cache.clear()
  }, [])

  // 캐시 데이터 새로고침
  const refresh = useCallback(async (cacheKey: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      const newData = await fetcher()
      
      if (!abortControllerRef.current.signal.aborted) {
        set(cacheKey, newData, options)
        setData(newData)
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }, [fetcher, set, options])

  // 캐시 데이터가 오래되었는지 확인
  const isStale = useCallback((cacheKey: string): boolean => {
    const item = cache.get(cacheKey)
    if (!item) return true
    
    return !isCacheValid(item)
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      // 캐시에서 데이터 확인
      const cachedData = get(key)
      if (cachedData) {
        setData(cachedData)
        
        // stale-while-revalidate: 백그라운드에서 새로고침
        if (staleWhileRevalidate && isStale(key)) {
          refresh(key)
        }
        return
      }
      
      // 캐시에 없으면 새로 가져오기
      await refresh(key)
    }
    
    loadData()
    
    // 컴포넌트 언마운트 시 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [key, get, isStale, refresh, staleWhileRevalidate])

  return {
    data,
    loading,
    error,
    get,
    set,
    remove,
    clear,
    refresh,
    isStale
  }
}

// 특정 용도별 캐시 훅들
export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  return useCache<T>(key, fetcher, {
    ttl: 10 * 60 * 1000, // 10분
    staleWhileRevalidate: true,
    ...options
  })
}

export function useLocalStorageCache<T>(
  key: string,
  defaultValue: T,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.timestamp && Date.now() - parsed.timestamp < (options.ttl || defaultTTL)) {
          return parsed.data
        }
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
    }
    return defaultValue
  })

  const set = useCallback((newData: T) => {
    try {
      const item = {
        data: newData,
        timestamp: Date.now(),
        ttl: options.ttl || defaultTTL
      }
      localStorage.setItem(key, JSON.stringify(item))
      setData(newData)
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }, [key, options.ttl])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setData(defaultValue)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  }, [key, defaultValue])

  return { data, set, remove }
}

// 캐시 통계 훅
export function useCacheStats() {
  const [stats, setStats] = useState({
    size: 0,
    hitRate: 0,
    missRate: 0,
    totalHits: 0,
    totalMisses: 0
  })

  useEffect(() => {
    const updateStats = () => {
      setStats({
        size: cache.size,
        hitRate: stats.totalHits / (stats.totalHits + stats.totalMisses) || 0,
        missRate: stats.totalMisses / (stats.totalHits + stats.totalMisses) || 0,
        totalHits: stats.totalHits,
        totalMisses: stats.totalMisses
      })
    }

    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [stats])

  return stats
}
