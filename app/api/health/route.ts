import { NextRequest, NextResponse } from 'next/server'
import { createServerAnonClient } from '@/supabase/supabaseClient'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 데이터베이스 연결 상태 확인 (try health_check table)
    let dbError = null
    try {
      const supabase = createServerAnonClient()
      if (supabase) {
        const { error: err } = await supabase.from('health_check').select('status').limit(1)
        dbError = err
      } else {
        dbError = new Error('Supabase not configured')
      }
    } catch (e: any) {
      dbError = e
    }
    
    const dbStatus = dbError ? 'error' : 'healthy'
    const responseTime = Date.now() - startTime
    
    // 헬스 체크 응답
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      services: {
        database: {
          status: dbStatus,
          error: dbError?.message || null,
          responseTime: `${responseTime}ms`
        },
        api: {
          status: 'healthy',
          responseTime: `${responseTime}ms`
        }
      },
      system: {
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    }
    
    // 전체 상태 결정
    const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded'
    healthData.status = overallStatus
    
    const statusCode = overallStatus === 'healthy' ? 200 : 503
    
    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: 'error',
          error: 'Connection failed'
        },
        api: {
          status: 'error',
          responseTime: `${responseTime}ms`
        }
      }
    }
    
    return NextResponse.json(errorData, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
