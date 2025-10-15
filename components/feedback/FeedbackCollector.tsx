'use client'

import { useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { SuccessMessage } from '@/components/system/SuccessMessage';
import { ErrorMessage } from '@/components/system/ErrorMessage';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'general';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type Category = 'ui' | 'ux' | 'performance' | 'security' | 'other';

interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  screenshot_url?: string;
}

export default function FeedbackCollector() {
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'general',
    title: '',
    description: '',
    priority: 'medium',
    category: 'other'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('로그인이 필요합니다.');
        return;
      }

      // 피드백 데이터 준비 (feedback 테이블이 없으므로 임시로 users 테이블에 저장)
      const feedbackData = {
        user_id: user.id,
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        created_at: new Date().toISOString(),
        status: 'pending',
        type: formData.type,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        screenshot_url: formData.screenshot_url
      };

      // 임시로 콘솔에 출력 (실제 구현에서는 적절한 테이블에 저장)
      console.log('Feedback submitted:', feedbackData);

      setSuccess(true);
      setFormData({
        type: 'general',
        title: '',
        description: '',
        priority: 'medium',
        category: 'other'
      });

      // 3초 후 성공 메시지 숨기기
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('피드백 제출에 실패했습니다. 다시 시도해주세요.');
      console.error('Feedback submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 입력 필드 변경 처리
  const handleInputChange = (field: keyof FeedbackFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 스크린샷 업로드 (시뮬레이션)
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      // 실제로는 Supabase Storage에 업로드
      const fakeUrl = URL.createObjectURL(file)
      handleInputChange('screenshot_url', fakeUrl)
    } catch (error) {
      setError('스크린샷 업로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 피드백 타입에 따른 아이콘
  const getFeedbackIcon = (type: FeedbackType) => {
    switch (type) {
      case 'bug': return 'ri-bug-line text-red-500'
      case 'feature': return 'ri-lightbulb-line text-blue-500'
      case 'improvement': return 'ri-tools-line text-green-500'
      case 'general': return 'ri-chat-1-line text-gray-500'
      default: return 'ri-chat-1-line text-gray-500'
    }
  }

  // 우선순위에 따른 색상
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700'
      case 'medium': return 'bg-blue-100 text-blue-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'critical': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="fixed bottom-6 left-6 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-md z-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <i className="ri-feedback-line text-blue-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800">피드백 보내기</h3>
        </div>
        <button
          onClick={() => window.close()}
          className="text-gray-500 hover:text-gray-700"
        >
          <i className="ri-close-line" />
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <i className="ri-error-warning-line text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* 성공 메시지 */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <i className="ri-check-line text-green-500" />
            <span className="text-sm text-green-700">피드백이 성공적으로 제출되었습니다!</span>
          </div>
        </div>
      )}

      {/* 피드백 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 피드백 타입 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            피드백 유형
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'bug', label: '버그 신고', icon: 'ri-bug-line' },
              { type: 'feature', label: '기능 제안', icon: 'ri-lightbulb-line' },
              { type: 'improvement', label: '개선 사항', icon: 'ri-tools-line' },
              { type: 'general', label: '일반 의견', icon: 'ri-chat-1-line' }
            ].map(({ type, label, icon }) => (
              <label
                key={type}
                className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={formData.type === type}
                  onChange={(e) => handleInputChange('type', e.target.value as FeedbackType)}
                  className="sr-only"
                />
                <i className={`${icon} text-lg`} />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="간단한 제목을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상세 설명 *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="자세한 내용을 설명해주세요"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* 고급 옵션 */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* 우선순위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
              <option value="critical">긴급</option>
            </select>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as Category)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ui">사용자 인터페이스</option>
              <option value="ux">사용자 경험</option>
              <option value="performance">성능</option>
              <option value="security">보안</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* 스크린샷 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              스크린샷 (선택사항)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formData.screenshot_url && (
              <div className="mt-2">
                <img
                  src={formData.screenshot_url}
                  alt="스크린샷"
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>제출 중...</span>
            </div>
          ) : (
            '피드백 제출'
          )}
        </button>

        {/* 미리보기 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 text-sm mb-2">미리보기</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">유형:</span>
              <span className="font-medium">{formData.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">제목:</span>
              <span className="font-medium">{formData.title || '입력되지 않음'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">우선순위:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)}`}>
                {formData.priority === 'low' && '낮음'}
                {formData.priority === 'medium' && '보통'}
                {formData.priority === 'high' && '높음'}
                {formData.priority === 'critical' && '긴급'}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
