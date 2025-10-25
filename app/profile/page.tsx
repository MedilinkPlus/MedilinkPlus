
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProfileForm from '@/components/ProfileForm';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import { SuccessMessage } from '@/components/system/SuccessMessage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { user, profile, loading, error, updateProfile } = useAuth();

  const handleProfileUpdate = async (updates: any) => {
    try {
      const result = await updateProfile(updates);
      if (result.success) {
        setSuccessMessage('Profile updated successfully.');
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.error || 'Failed to update profile.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    await handleProfileUpdate({ avatar_url: imageUrl });
  };

  if (loading) {
    return (
      <ProtectedRoute showLoading={false}>
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />
          <main className="pt-4">
            <LoadingSpinner size="lg" text="Loading profile..." className="py-20" />
          </main>
          <BottomNavigation />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !user || !profile) {
    return (
      <ProtectedRoute showLoading={false}>
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />
          <main className="pt-4">
            <div className="px-4">
              <ErrorMessage error={error || 'User information not found.'} />
            </div>
          </main>
          <BottomNavigation />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        
        <main className="pt-4">
          <div className="px-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your personal information and account settings</p>
          </div>

          {/* 성공/에러 메시지 */}
          {successMessage && (
            <div className="px-4 mb-4">
              <SuccessMessage message={successMessage} />
            </div>
          )}
          
          {errorMessage && (
            <div className="px-4 mb-4">
              <ErrorMessage error={errorMessage} />
            </div>
          )}

          {/* 프로필 이미지 섹션 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <ProfileImageUpload
                currentImageUrl={profile.avatar_url}
                onImageUpload={handleImageUpload}
              />
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#A8E6CF] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'security'
                      ? 'bg-[#A8E6CF] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Security
                </button>
              </div>
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="px-4">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <ProfileForm
                  profile={profile}
                  isEditing={isEditing}
                  onEditToggle={() => setIsEditing(!isEditing)}
                  onSubmit={handleProfileUpdate}
                />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <PasswordChangeForm
                  onShow={() => setShowPasswordForm(true)}
                  showForm={showPasswordForm}
                  onClose={() => setShowPasswordForm(false)}
                />
              </div>
            )}
          </div>

          {/* 계정 정보 */}
          <div className="px-4 mt-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Account ID</span>
                  <span className="text-gray-800 font-mono text-sm">{user.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-800">
                    {new Date(user.created_at).toLocaleDateString('en-US')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Last Login</span>
                  <span className="text-gray-800">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString('en-US')
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Account Role</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.role === 'admin' 
                      ? 'bg-red-100 text-red-600'
                      : profile.role === 'interpreter'
                      ? 'bg-[#FFD3B6] text-[#FF8A65]'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {profile.role === 'admin' ? 'Admin' : 
                     profile.role === 'interpreter' ? 'Interpreter' : 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
}
