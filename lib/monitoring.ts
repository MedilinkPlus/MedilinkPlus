// 모니터링 및 로깅 유틸리티
// ==========================================

import * as Sentry from '@sentry/nextjs'

// 환경 변수 확인
const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'

// Sentry 초기화
export function initializeMonitoring() {
  if (isProduction && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'production',
      release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      tracesSampleRate: 0.1,
      // BrowserTracing은 더 이상 필요하지 않음
    })
  }
}

// 에러 로깅
export function logError(error: Error, context?: Record<string, any>) {
  if (isDevelopment) {
    console.error('🚨 Error:', error)
    if (context) {
      console.error('Context:', context)
    }
  }

  if (isProduction && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    })
  }
}

// 성능 모니터링
export function logPerformance(name: string, duration: number, metadata?: Record<string, any>) {
  if (isDevelopment) {
    console.log(`⚡ Performance [${name}]: ${duration}ms`, metadata)
  }

  if (isProduction && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Performance: ${name}`,
      data: {
        name,
        duration,
        ...metadata,
      },
      level: 'info',
    })
  }
}

// 사용자 행동 추적
export function trackUserAction(action: string, properties?: Record<string, any>) {
  if (isDevelopment) {
    console.log(`👤 User Action [${action}]:`, properties)
  }

  if (isProduction && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: `User Action: ${action}`,
      data: {
        action,
        ...properties,
      },
      level: 'info',
    })
  }
}

// API 호출 모니터링
export function logApiCall(
  endpoint: string,
  method: string,
  duration: number,
  status: number,
  error?: Error
) {
  if (isDevelopment) {
    const statusIcon = status >= 400 ? '❌' : '✅'
    console.log(`${statusIcon} API [${method}] ${endpoint}: ${duration}ms (${status})`)
    
    if (error) {
      console.error('API Error:', error)
    }
  }

  if (isProduction && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'api',
      message: `API Call: ${method} ${endpoint}`,
      data: {
        endpoint,
        method,
        duration,
        status,
        error: error?.message,
      },
      level: status >= 400 ? 'error' : 'info',
    })

    if (error) {
      Sentry.captureException(error, {
        tags: {
          type: 'api_error',
          endpoint,
          method,
          status: status.toString(),
        },
      })
    }
  }
}

// 페이지 로딩 성능 모니터링
export function logPageLoad(pageName: string, loadTime: number) {
  if (isDevelopment) {
    console.log(`📄 Page Load [${pageName}]: ${loadTime}ms`)
  }

  if (isProduction && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'page-load',
      message: `Page Load: ${pageName}`,
      data: {
        pageName,
        loadTime,
      },
      level: 'info',
    })
  }
}

// 사용자 세션 추적
export function trackUserSession(userId: string, sessionData: Record<string, any>) {
  if (isDevelopment) {
    console.log(`🔐 User Session [${userId}]:`, sessionData)
  }

  if (isProduction && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      ...sessionData,
    })
  }
}

// 비즈니스 이벤트 추적
export function trackBusinessEvent(
  eventName: string,
  category: string,
  properties?: Record<string, any>
) {
  if (isDevelopment) {
    console.log(`💼 Business Event [${category}] ${eventName}:`, properties)
  }

  if (isProduction && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'business',
      message: `Business Event: ${eventName}`,
      data: {
        eventName,
        category,
        ...properties,
      },
      level: 'info',
    })
  }
}

// 메모리 사용량 모니터링
export function logMemoryUsage() {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024)
    const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)

    if (isDevelopment) {
      console.log(`🧠 Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`)
    }
  }
}

// 네트워크 상태 모니터링
export function logNetworkStatus() {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection.effectiveType || 'unknown'
    const downlink = connection.downlink || 0
    const rtt = connection.rtt || 0

    if (isDevelopment) {
      console.log(`🌐 Network: ${effectiveType}, ${downlink}Mbps, RTT: ${rtt}ms`)
    }
  }
}

// 자동 모니터링 시작
export function startAutoMonitoring() {
  if (typeof window !== 'undefined') {
    // 페이지 로딩 성능 모니터링
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      logPageLoad(window.location.pathname, loadTime)
    })

    // 메모리 사용량 주기적 모니터링
    setInterval(logMemoryUsage, 30000) // 30초마다

    // 네트워크 상태 모니터링
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', logNetworkStatus)
    }

    // 에러 이벤트 모니터링
    window.addEventListener('error', (event) => {
      logError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    // Promise 에러 모니터링
    window.addEventListener('unhandledrejection', (event) => {
      logError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
      })
    })
  }
}

// 모니터링 중지
export function stopMonitoring() {
  if (typeof window !== 'undefined') {
    // 이벤트 리스너 정리
    window.removeEventListener('error', () => {})
    window.removeEventListener('unhandledrejection', () => {})
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.removeEventListener('change', logNetworkStatus)
    }
  }
}
