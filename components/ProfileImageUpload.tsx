'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';

interface ProfileImageUploadProps {
  currentImageUrl: string | null;
  onImageUpload: (imageUrl: string) => Promise<void>;
}

export default function ProfileImageUpload({ currentImageUrl, onImageUpload }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultImage = 'https://readdy.ai/api/search-image?query=Professional%20profile%20photo%2C%20friendly%20smile%2C%20modern%20casual%20attire%2C%20clean%20background%2C%20confident%20expression%2C%20business%20headshot&width=200&height=200&orientation=squarish';

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // 파일명 생성 (고유성 보장)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 프로필 업데이트
      await onImageUpload(publicUrl);

    } catch (err: any) {
      console.error('Image upload error:', err);
      setError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* 현재 프로필 이미지 */}
      <div className="relative">
        <div 
          className={`w-24 h-24 rounded-full bg-cover bg-center mx-auto mb-4 border-4 ${
            dragActive ? 'border-[#A8E6CF] border-dashed' : 'border-white'
          } shadow-lg`}
          style={{ 
            backgroundImage: `url(${currentImageUrl || defaultImage})` 
          }}
        />
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <LoadingSpinner size="sm" className="text-white" />
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4">
          <ErrorMessage error={error} />
        </div>
      )}

      {/* 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-[#A8E6CF] bg-[#A8E6CF]/10'
            : 'border-gray-300 hover:border-[#A8E6CF] hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="w-12 h-12 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full mx-auto mb-3">
          <i className="ri-image-add-line text-[#A8E6CF] text-xl"></i>
        </div>
        
        <p className="text-gray-700 font-medium mb-1">
          {isUploading ? '업로드 중...' : '프로필 이미지 변경'}
        </p>
        
        <p className="text-gray-500 text-sm">
          클릭하거나 이미지를 여기에 드래그하세요
        </p>
        
        <p className="text-gray-400 text-xs mt-2">
          JPG, PNG, GIF • 최대 5MB
        </p>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 현재 이미지가 있는 경우 삭제 옵션 */}
      {currentImageUrl && currentImageUrl !== defaultImage && (
        <button
          onClick={async () => {
            try {
              setIsUploading(true);
              await onImageUpload('');
            } catch (err) {
              setError('이미지 삭제에 실패했습니다.');
            } finally {
              setIsUploading(false);
            }
          }}
          disabled={isUploading}
          className="w-full py-2 text-red-600 text-sm font-medium hover:text-red-700 transition-colors disabled:opacity-50"
        >
          기본 이미지로 변경
        </button>
      )}
    </div>
  );
}
