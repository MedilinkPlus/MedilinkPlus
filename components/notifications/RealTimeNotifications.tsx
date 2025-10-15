'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/supabase/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

interface Notification {
  id: string
  user_id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'reservation' | 'payment' | 'system'
  title: string
  message: string
  is_read: boolean
  action_url?: string
  created_at: string
  expires_at?: string
}

interface RealTimeNotificationsProps {
  className?: string
}

export default function RealTimeNotifications({ className = "" }: RealTimeNotificationsProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  // 알림 목록 가져오기
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('notifications') as any)
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        // If table doesn't exist, just return empty array
        if (error.code === 'PGRST205') {
          console.warn('Notifications table not found, using empty notifications');
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        throw error;
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter((n: any) => !n.is_read).length || 0)
    } catch (error) {
      console.error('Failed to load notification list:', error)
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await (supabase
        .from('notifications') as any)
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('Notifications table not found, skipping mark as read');
          return;
        }
        throw error;
      }

      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const { error } = await (supabase
        .from('notifications') as any)
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('Notifications table not found, skipping mark all as read');
          return;
        }
        throw error;
      }

      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 알림 삭제
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('Notifications table not found, skipping delete');
          return;
        }
        throw error;
      }

      const notification = notifications.find(n => n.id === notificationId)
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [notifications])

  // 실시간 알림 구독
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // 브라우저 알림 표시
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              tag: newNotification.id
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // 초기 알림 로드
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        console.log('브라우저 알림 권한이 승인되었습니다.')
      }
    }
  }, [])

  // 알림 타입에 따른 아이콘
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'ri-check-line text-green-500'
      case 'warning': return 'ri-alert-line text-yellow-500'
      case 'error': return 'ri-error-warning-line text-red-500'
      case 'reservation': return 'ri-calendar-line text-blue-500'
      case 'payment': return 'ri-money-dollar-circle-line text-purple-500'
      case 'system': return 'ri-settings-line text-gray-500'
      default: return 'ri-information-line text-blue-500'
    }
  }

  // 알림 타입에 따른 배경색
  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'reservation': return 'bg-blue-50 border-blue-200'
      case 'payment': return 'bg-purple-50 border-purple-200'
      case 'system': return 'bg-gray-50 border-gray-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  // 알림 만료 시간 확인
  const isExpired = (notification: Notification) => {
    if (!notification.expires_at) return false
    return new Date(notification.expires_at) < new Date()
  }

  // 만료된 알림 필터링
  const activeNotifications = notifications.filter(n => !isExpired(n))

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="relative bg-white border border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        title="실시간 알림"
      >
        <i className="ri-notification-3-line text-xl text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">실시간 알림</h3>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              모두 읽음
            </button>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="ri-close-line" />
          </button>
        </div>
      </div>

      {/* 브라우저 알림 권한 요청 */}
      {Notification.permission === 'default' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <i className="ri-notification-line text-blue-500" />
            <span className="text-sm text-blue-700">브라우저 알림을 받으시겠습니까?</span>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            권한 허용
          </button>
        </div>
      )}

      {/* 알림 목록 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <i className="ri-loader-4-line animate-spin text-2xl mb-2" />
            <div>알림을 불러오는 중...</div>
          </div>
        ) : activeNotifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <i className="ri-notification-off-line text-2xl mb-2" />
            <div>새로운 알림이 없습니다</div>
          </div>
        ) : (
          activeNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${getNotificationBgColor(notification.type)} ${
                !notification.is_read ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              {/* 알림 헤더 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <i className={`${getNotificationIcon(notification.type)} text-lg`} />
                  <span className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {!notification.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              </div>

              {/* 알림 내용 */}
              <div className="text-sm text-gray-700 mb-2">
                {notification.message}
              </div>

              {/* 알림 메타 정보 */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {new Date(notification.created_at).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    읽음 처리
                  </button>
                )}
              </div>

              {/* 액션 버튼 */}
              {notification.action_url && (
                <div className="mt-2">
                  <a
                    href={notification.action_url}
                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    자세히 보기
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 하단 액션 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>총 {activeNotifications.length}개 알림</span>
          <span>{unreadCount}개 읽지 않음</span>
        </div>
      </div>
    </div>
  )
}
