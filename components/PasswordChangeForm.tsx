'use client';

import { useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import { SuccessMessage } from '@/components/system/SuccessMessage';

interface PasswordChangeFormProps {
  onShow: () => void;
  showForm: boolean;
  onClose: () => void;
}

export default function PasswordChangeForm({ onShow, showForm, onClose }: PasswordChangeFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('비밀번호가 성공적으로 변경되었습니다.');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    onClose();
  };

  if (showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">비밀번호 변경</h3>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorMessage error={error} />
          </div>
        )}

        {success && (
          <div className="mb-4">
            <SuccessMessage message={success} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호 *
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
              placeholder="새 비밀번호를 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호 확인 *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
              placeholder="새 비밀번호를 다시 입력하세요"
              required
            />
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <div className="w-5 h-5 flex items-center justify-center bg-blue-500 rounded-full mr-2">
                <i className="ri-information-line text-white text-sm"></i>
              </div>
              <span className="font-medium text-blue-800 text-sm">비밀번호 요구사항</span>
            </div>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• 최소 6자 이상</li>
              <li>• 영문, 숫자, 특수문자 조합 권장</li>
              <li>• 기존 비밀번호와 다른 비밀번호 사용</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl cursor-pointer whitespace-nowrap hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#A8E6CF] text-white rounded-xl cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  변경 중...
                </div>
              ) : (
                '비밀번호 변경'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">보안</h3>
        <button
          onClick={onShow}
          className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors"
        >
          <i className="ri-edit-line text-xl"></i>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full mr-3">
              <i className="ri-lock-line text-[#A8E6CF]"></i>
            </div>
            <div>
              <span className="text-gray-800 font-medium">비밀번호</span>
              <p className="text-gray-500 text-xs">계정 보안을 위해 정기적으로 변경하세요</p>
            </div>
          </div>
          <button
            onClick={onShow}
            className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors text-sm"
          >
            변경
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-[#FFD3B6]/20 rounded-full mr-3">
              <i className="ri-shield-check-line text-[#FFD3B6]"></i>
            </div>
            <div>
              <span className="text-gray-800 font-medium">2단계 인증</span>
              <p className="text-gray-500 text-xs">추가 보안을 위한 2단계 인증 설정</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">준비 중</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-[#E0BBE4]/20 rounded-full mr-3">
              <i className="ri-notification-line text-[#E0BBE4]"></i>
            </div>
            <div>
              <span className="text-gray-800 font-medium">로그인 알림</span>
              <p className="text-gray-500 text-xs">새로운 기기에서 로그인 시 알림</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">준비 중</span>
        </div>
      </div>
    </div>
  );
}
