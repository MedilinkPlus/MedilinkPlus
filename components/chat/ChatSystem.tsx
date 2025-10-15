'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/system/LoadingSpinner'
import { ErrorMessage } from '@/components/system/ErrorMessage'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderType: 'user' | 'interpreter'
  message: string
  timestamp: string
  isRead: boolean
}

interface ChatSession {
  id: string
  interpreterId: string
  interpreterName: string
  interpreterAvatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  status: 'active' | 'ended' | 'waiting'
}

interface ChatSystemProps {
  className?: string
}

export default function ChatSystem({ className = "" }: ChatSystemProps) {
  const { user, isAuthenticated } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadChatSessions()
    }
  }, [isAuthenticated])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatSessions = async () => {
    try {
      setLoading(true)
      setError(null)

      // 실제 API 호출로 대체
      const mockSessions: ChatSession[] = [
        {
          id: '1',
          interpreterId: 'int1',
          interpreterName: '김영희 통역사',
          interpreterAvatar: '/avatars/interpreter1.jpg',
          lastMessage: '안녕하세요! 진료 예약에 대해 문의드리겠습니다.',
          lastMessageTime: '2024-12-20T10:30:00Z',
          unreadCount: 2,
          status: 'active'
        },
        {
          id: '2',
          interpreterId: 'int2',
          interpreterName: '이철수 통역사',
          interpreterAvatar: '/avatars/interpreter2.jpg',
          lastMessage: '통역 서비스가 완료되었습니다.',
          lastMessageTime: '2024-12-19T16:00:00Z',
          unreadCount: 0,
          status: 'ended'
        }
      ]

      setSessions(mockSessions)
    } catch (err) {
      setError('채팅 세션을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadChatMessages = async (sessionId: string) => {
    try {
      setLoading(true)
      setError(null)

      // 실제 API 호출로 대체
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          senderId: 'int1',
          senderName: '김영희 통역사',
          senderType: 'interpreter',
          message: '안녕하세요! 진료 예약에 대해 문의드리겠습니다.',
          timestamp: '2024-12-20T10:30:00Z',
          isRead: true
        },
        {
          id: '2',
          senderId: user?.id || '',
          senderName: '사용자',
          senderType: 'user',
          message: '네, 정형외과 진료를 받고 싶습니다.',
          timestamp: '2024-12-20T10:32:00Z',
          isRead: true
        },
        {
          id: '3',
          senderId: 'int1',
          senderName: '김영희 통역사',
          senderType: 'interpreter',
          message: '어떤 증상이 있으신가요?',
          timestamp: '2024-12-20T10:33:00Z',
          isRead: false
        }
      ]

      setMessages(mockMessages)
    } catch (err) {
      setError('채팅 메시지를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return

    try {
      const newChatMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: user?.id || '',
        senderName: '사용자',
        senderType: 'user',
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isRead: false
      }

      setMessages(prev => [...prev, newChatMessage])
      setNewMessage('')

      // 실제 API 호출로 메시지 전송
      console.log('Sending message:', newChatMessage)

      // 통역사 응답 시뮬레이션 (실제로는 WebSocket으로 처리)
      setTimeout(() => {
        const interpreterResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: selectedSession.interpreterId,
          senderName: selectedSession.interpreterName,
          senderType: 'interpreter',
          message: '메시지를 확인했습니다. 잠시만 기다려주세요.',
          timestamp: new Date().toISOString(),
          isRead: false
        }
        setMessages(prev => [...prev, interpreterResponse])
      }, 2000)

    } catch (err) {
      console.error('메시지 전송 실패:', err)
    }
  }

  const handleSessionSelect = (session: ChatSession) => {
    setSelectedSession(session)
    loadChatMessages(session.id)
    setShowChat(true)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatSessionTime = (timestamp: string) => {
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
    <div className={`${className}`}>
      {/* 채팅 버튼 */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
        aria-label="채팅"
      >
        <i className="ri-message-3-line text-xl" />
      </button>

      {/* 채팅 패널 */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                채팅
              </h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>
          </div>

          {/* 채팅 세션 목록 또는 채팅 화면 */}
          {!selectedSession ? (
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="md" text="채팅 세션 로딩 중..." />
                </div>
              ) : error ? (
                <div className="p-4">
                  <ErrorMessage 
                    error={error} 
                    onRetry={loadChatSessions}
                    className="text-sm"
                  />
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <i className="ri-message-3-line text-4xl mb-2" />
                  <p>활성 채팅 세션이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSessionSelect(session)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            {session.interpreterAvatar ? (
                              <img
                                src={session.interpreterAvatar}
                                alt={session.interpreterName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <i className="ri-user-line text-gray-600 text-xl" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {session.interpreterName}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatSessionTime(session.lastMessageTime || '')}
                            </span>
                          </div>
                          
                          {session.lastMessage && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {session.lastMessage}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : session.status === 'waiting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {session.status === 'active' ? '활성' : 
                               session.status === 'waiting' ? '대기중' : '종료'}
                            </span>
                            
                            {session.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {session.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 채팅 헤더 */}
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <i className="ri-arrow-left-line text-xl" />
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      {selectedSession.interpreterAvatar ? (
                        <img
                          src={selectedSession.interpreterAvatar}
                          alt={selectedSession.interpreterName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <i className="ri-user-line text-gray-600 text-sm" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {selectedSession.interpreterName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {selectedSession.status === 'active' ? '온라인' : '오프라인'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {loading ? (
                  <div className="text-center">
                    <LoadingSpinner size="md" text="메시지 로딩 중..." />
                  </div>
                ) : error ? (
                  <ErrorMessage 
                    error={error} 
                    onRetry={() => selectedSession && loadChatMessages(selectedSession.id)}
                    className="text-sm"
                  />
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderType === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.senderName}
                          </span>
                          <span className={`text-xs ${
                            message.senderType === 'user' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 메시지 입력 */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="ri-send-plane-line" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
