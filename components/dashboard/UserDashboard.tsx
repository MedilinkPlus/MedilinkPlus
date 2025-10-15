'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/system/LoadingSpinner'
import { ErrorMessage } from '@/components/system/ErrorMessage'

interface DashboardStats {
  totalReservations: number
  upcomingReservations: number
  completedReservations: number
  totalSpent: number
  favoriteHospitals: number
  savedInterpreters: number
}

interface RecentActivity {
  id: string
  type: 'reservation' | 'review' | 'favorite'
  title: string
  description: string
  date: string
  status: string
}

export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 실제 API 호출로 대체
      const mockStats: DashboardStats = {
        totalReservations: 12,
        upcomingReservations: 3,
        completedReservations: 9,
        totalSpent: 450000,
        favoriteHospitals: 5,
        savedInterpreters: 2
      }

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'reservation',
          title: '서울대학교병원 정형외과 예약',
          description: '2024년 12월 25일 오전 9시',
          date: '2024-12-20',
          status: 'confirmed'
        },
        {
          id: '2',
          type: 'review',
          title: '연세대학교병원 리뷰 작성',
          description: '친절하고 전문적인 진료 서비스',
          date: '2024-12-18',
          status: 'completed'
        },
        {
          id: '3',
          type: 'favorite',
          title: '삼성서울병원 즐겨찾기 추가',
          description: '심장질환 전문병원',
          date: '2024-12-15',
          status: 'active'
        }
      ]

      setStats(mockStats)
      setRecentActivities(mockActivities)
    } catch (err) {
      setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <i className="ri-user-line text-6xl text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          로그인이 필요합니다
        </h2>
        <p className="text-gray-500">
          대시보드를 보려면 로그인해주세요.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="대시보드 로딩 중..." />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onRetry={loadDashboardData}
        className="my-8"
      />
    )
  }

  if (!stats) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-blue-600 bg-blue-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'active':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '확정됨'
      case 'completed':
        return '완료됨'
      case 'active':
        return '활성'
      default:
        return '알 수 없음'
    }
  }

  return (
    <div className="space-y-6">
      {/* 환영 메시지 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          안녕하세요, {user?.email?.split('@')[0]}님! 👋
        </h1>
        <p className="text-blue-100">
          오늘도 건강한 하루 되세요. 예약 현황과 활동 내역을 확인해보세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 총 예약 수 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 예약</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalReservations}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <i className="ri-calendar-line text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        {/* 예정된 예약 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">예정된 예약</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.upcomingReservations}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <i className="ri-time-line text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        {/* 완료된 예약 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">완료된 예약</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.completedReservations}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <i className="ri-check-line text-2xl text-green-600" />
            </div>
          </div>
        </div>

        {/* 총 지출 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 지출</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalSpent)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <i className="ri-money-dollar-circle-line text-2xl text-red-600" />
            </div>
          </div>
        </div>

        {/* 즐겨찾기 병원 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">즐겨찾기 병원</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.favoriteHospitals}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <i className="ri-heart-line text-2xl text-purple-600" />
            </div>
          </div>
        </div>

        {/* 저장된 통역사 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">저장된 통역사</p>
              <p className="text-3xl font-bold text-indigo-600">
                {stats.savedInterpreters}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <i className="ri-translate-2 text-2xl text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            최근 활동
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            최근 예약, 리뷰, 즐겨찾기 활동 내역입니다.
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {activity.type === 'reservation' && (
                      <i className="ri-calendar-line text-gray-600" />
                    )}
                    {activity.type === 'review' && (
                      <i className="ri-star-line text-gray-600" />
                    )}
                    {activity.type === 'favorite' && (
                      <i className="ri-heart-line text-gray-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {getStatusLabel(activity.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          빠른 액션
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
            <i className="ri-add-line text-2xl text-blue-600 mb-2" />
            <p className="text-sm font-medium text-blue-900">새 예약</p>
          </button>
          
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
            <i className="ri-search-line text-2xl text-green-600 mb-2" />
            <p className="text-sm font-medium text-green-900">병원 검색</p>
          </button>
          
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center">
            <i className="ri-translate-2 text-2xl text-purple-600 mb-2" />
            <p className="text-sm font-medium text-purple-900">통역사 찾기</p>
          </button>
          
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center">
            <i className="ri-star-line text-2xl text-orange-600 mb-2" />
            <p className="text-sm font-medium text-orange-900">리뷰 작성</p>
          </button>
        </div>
      </div>
    </div>
  )
}
