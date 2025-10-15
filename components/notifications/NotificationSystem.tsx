'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/system/LoadingSpinner'
import { ErrorMessage } from '@/components/system/ErrorMessage'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionText?: string
}

interface NotificationSystemProps {
  className?: string
}

export default function NotificationSystem({ className = "" }: NotificationSystemProps) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
    }
  }, [isAuthenticated])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      // 실제 API 호출로 대체
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: '예약 확정',
          message: '서울대학교병원 정형외과 예약이 확정되었습니다.',
          timestamp: '2024-12-20T10:30:00Z',
          read: false,
          actionUrl: '/reservations/1',
          actionText: '예약 보기'
        },
        {
          id: '2',
          type: 'info',
          title: '진료 일정 알림',
          message: '내일 오전 9시에 정형외과 진료가 예정되어 있습니다.',
          timestamp: '2024-12-20T09:00:00Z',
          read: false,
          actionUrl: '/reservations/1',
          actionText: '상세 보기'
        },
        {
          id: '3',
          type: 'warning',
          title: '통역사 배정 대기',
          message: '영어 통역사 배정이 지연되고 있습니다. 잠시만 기다려주세요.',
          timestamp: '2024-12-19T16:00:00Z',
          read: true
        },
        {
          id: '4',
          type: 'error',
          title: '결제 실패',
          message: '예약 결제가 실패했습니다. 다시 시도해주세요.',
          timestamp: '2024-12-19T14:30:00Z',
          read: false,
          actionUrl: '/reservations/1/payment',
          actionText: '재결제'
        }
      ]

      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => !n.read).length)
    } catch (err) {
      setError('알림을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // 실제 API 호출로 대체
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      // 실제 API 호출로 대체
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('전체 알림 읽음 처리 실패:', err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      // 실제 API 호출로 대체
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(prev => {
        const deleted = notifications.find(n => n.id === notificationId)
        return deleted && !deleted.read ? Math.max(0, prev - 1) : prev
      })
    } catch (err) {
      console.error('알림 삭제 실패:', err)
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'ri-check-line text-green-600'
      case 'info':
        return 'ri-information-line text-blue-600'
      case 'warning':
        return 'ri-error-warning-line text-yellow-600'
      case 'error':
        return 'ri-close-line text-red-600'
      default:
        return 'ri-notification-line text-gray-600'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return '방금 전'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`
    } else {
      return date.toLocaleDateString('ko-KR')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* 알림 버튼 */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="알림"
      >
        <i className="ri-notification-line text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                알림
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  모두 읽음 처리
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <LoadingSpinner size="md" text="알림 로딩 중..." />
              </div>
            ) : error ? (
              <div className="p-4">
                <ErrorMessage 
                  error={error} 
                  onRetry={loadNotifications}
                  className="text-sm"
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <i className="ri-notification-off-line text-4xl mb-2" />
                <p>새로운 알림이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <i className={`${getNotificationIcon(notification.type)} text-lg`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="알림 삭제"
                            >
                              <i className="ri-close-line text-sm" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {notification.actionUrl && notification.actionText && (
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                markAsRead(notification.id)
                                // 실제 라우팅 로직 추가
                                console.log('Navigate to:', notification.actionUrl)
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {notification.actionText} →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          읽음 처리
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                알림 닫기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 외부 클릭 시 드롭다운 닫기 */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
