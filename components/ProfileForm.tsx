'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import type { Tables } from '@/types/supabase';

interface ProfileFormProps {
  profile: Tables<'users'>;
  isEditing: boolean;
  onEditToggle: () => void;
  onSubmit: (updates: Partial<Tables<'users'>>) => Promise<void>;
}

export default function ProfileForm({ profile, isEditing, onEditToggle, onSubmit }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    language: profile.language || 'ko',
    age: profile.age || '',
    gender: profile.gender || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: profile.name || '',
      phone: profile.phone || '',
      language: profile.language || 'ko',
      age: profile.age || '',
      gender: profile.gender || ''
    });
  }, [profile]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updates: Partial<Tables<'users'>> = {
        name: formData.name,
        phone: formData.phone,
        language: formData.language,
        age: formData.age ? parseInt(formData.age.toString()) : null,
        gender: formData.gender as 'male' | 'female' | 'other' | null
      };

      await onSubmit(updates);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      phone: profile.phone || '',
      language: profile.language || 'ko',
      age: profile.age || '',
      gender: profile.gender || ''
    });
    onEditToggle();
  };

  if (isEditing) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">프로필 편집</h3>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
              placeholder="전화번호를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선호 언어
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="th">ไทย</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="vi">Tiếng Việt</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="ms">Bahasa Melayu</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                나이
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                placeholder="나이"
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
              >
                <option value="">선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </div>
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
                  저장 중...
                </div>
              ) : (
                '저장'
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
        <h3 className="text-lg font-bold text-gray-800">기본 정보</h3>
        <button
          onClick={onEditToggle}
          className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors"
        >
          <i className="ri-edit-line text-xl"></i>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600">이름</span>
          <span className="text-gray-800 font-medium">{profile.name || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600">이메일</span>
          <span className="text-gray-800">{profile.email}</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600">전화번호</span>
          <span className="text-gray-800">{profile.phone || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600">선호 언어</span>
          <span className="text-gray-800">
            {profile.language === 'ko' ? '한국어' :
             profile.language === 'en' ? 'English' :
             profile.language === 'th' ? 'ไทย' :
             profile.language === 'ja' ? '日本語' :
             profile.language === 'zh' ? '中文' :
             profile.language === 'vi' ? 'Tiếng Việt' :
             profile.language === 'id' ? 'Bahasa Indonesia' :
             profile.language === 'ms' ? 'Bahasa Melayu' : profile.language}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600">나이</span>
          <span className="text-gray-800">{profile.age || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center py-3">
          <span className="text-gray-600">성별</span>
          <span className="text-gray-800">
            {profile.gender === 'male' ? '남성' :
             profile.gender === 'female' ? '여성' :
             profile.gender === 'other' ? '기타' : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
