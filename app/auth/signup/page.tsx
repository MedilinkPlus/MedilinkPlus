
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabaseClient';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';

export default function SignupPage() {
  const [userType, setUserType] = useState('customer'); // 'customer' or 'interpreter'
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    phone: '',
    languages: [] as string[],
    experience: '',
    qualifications: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // 인증 훅 사용
  const { signUp, user } = useAuth();
  // 브라우저 뒤로가기 시 로그인 페이지로 이동
  useEffect(() => {
    const handlePopState = () => {
      try { router.replace('/auth/login'); } catch {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);


  // 이미 로그인된 경우 역할 기반 랜딩으로 리다이렉트
  if (user) {
    const role = (user.user_metadata as any)?.role
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'interpreter') {
      router.push('/interpreter/dashboard');
    } else {
      router.push('/dashboard');
    }
    return null;
  }

  const availableLanguages = [
    'English', 'Thai', 'Korean', 'Japanese', 'Chinese (Mandarin)', 
    'Chinese (Cantonese)', 'Vietnamese', 'Indonesian', 'Malay'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLanguageToggle = (language: string) => {
    const currentLanguages = formData.languages;
    if (currentLanguages.includes(language)) {
      setFormData({
        ...formData,
        languages: currentLanguages.filter(lang => lang !== language)
      });
    } else {
      setFormData({
        ...formData,
        languages: [...currentLanguages, language]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (userType === 'interpreter' && formData.languages.length === 0) {
      setError('Please select at least one language!');
      return;
    }

    // Client-side validation to avoid 400 from Auth
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if ((formData.password || '').length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await signUp(formData.email, formData.password, formData.name, formData.phone);
      
      if (result.success) {
        setShowSuccess(true);
        
        // 통역사인 경우 추가 정보를 저장하는 로직을 여기에 구현할 수 있음
        if (userType === 'interpreter') {
          // 통역사 테이블에 추가 정보 저장
          console.log('Interpreter additional info:', {
            languages: formData.languages,
            experience: formData.experience,
            qualifications: formData.qualifications
          });
        }
      } else {
        const msg = (result.error || '').toLowerCase();
        if (msg.includes('registered')) {
          setError('This email is already registered. Please sign in or reset your password.');
        } else if (msg.includes('password')) {
          setError('Password does not meet policy. Use at least 6 characters.');
        } else if (msg.includes('email')) {
          setError('Invalid email address.');
        } else {
          setError(result.error || 'Sign up failed');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineSignup = async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const redirectTo = `${siteUrl}/auth/login`;
    await supabase.auth.signInWithOAuth({
      provider: 'line' as any,
      options: {
        redirectTo,
        // LINE typically uses openid, profile, email by default in Supabase
        // additionalQueryParams: { prompt: 'consent' }
      } as any
    });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A8E6CF]/20 via-[#FFD3B6]/20 to-[#E0BBE4]/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full mx-auto mb-6">
              <i className="ri-check-line text-[#A8E6CF] text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {userType === 'customer' ? 'Account Created Successfully!' : 'Application Submitted!'}
            </h2>
            <p className="text-gray-600 mb-8">
              {userType === 'customer' 
                ? 'Welcome to MediLink+! You can now sign in to your account.'
                : 'Your interpreter application has been submitted for review. You will receive an email notification once approved.'
              }
            </p>
            <Link 
              href="/auth/login"
              className="w-full bg-[#A8E6CF] text-white py-3 rounded-2xl font-medium text-lg cursor-pointer whitespace-nowrap inline-block text-center hover:bg-[#8DD5B8] transition-colors"
            >
              {userType === 'customer' ? 'Sign In Now' : 'Back to Sign In'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A8E6CF]/20 via-[#FFD3B6]/20 to-[#E0BBE4]/20 py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            type="button"
            onClick={() => router.replace('/auth/login')}
            className="absolute left-0 top-1/2 -translate-y-1/2 ml-1 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <span className="inline-flex items-center">
              <i className="ri-arrow-left-line mr-1"></i>
              Back
            </span>
          </button>
          <div className="text-4xl font-['Pacifico'] text-[#A8E6CF] mb-2">
            MediLink+
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join the MediLink+ community</p>
        </div>

        {/* User Type Selection */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 text-center">Choose Account Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`p-4 rounded-2xl border-2 cursor-pointer whitespace-nowrap transition-colors ${
                userType === 'customer'
                  ? 'border-[#A8E6CF] bg-[#A8E6CF]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full mx-auto mb-2">
                <i className="ri-user-line text-[#A8E6CF]"></i>
              </div>
              <div className="text-sm font-medium text-gray-800">Customer</div>
              <div className="text-xs text-gray-600">Book appointments</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('interpreter')}
              className={`p-4 rounded-2xl border-2 cursor-pointer whitespace-nowrap transition-colors ${
                userType === 'interpreter'
                  ? 'border-[#FFD3B6] bg-[#FFD3B6]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center bg-[#FFD3B6]/20 rounded-full mx-auto mb-2">
                <i className="ri-translate-2 text-[#FFD3B6]"></i>
              </div>
              <div className="text-sm font-medium text-gray-800">Interpreter</div>
              <div className="text-xs text-gray-600">Provide services</div>
            </button>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-mail-line" style={{color: '#A8E6CF'}}></i>
                  </div>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-user-line" style={{color: '#A8E6CF'}}></i>
                  </div>
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-phone-line" style={{color: '#A8E6CF'}}></i>
                  </div>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-lock-line" style={{color: '#A8E6CF'}}></i>
                  </div>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} style={{color: '#9CA3AF'}}></i>
                  </div>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-lock-line" style={{color: '#A8E6CF'}}></i>
                  </div>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} style={{color: '#9CA3AF'}}></i>
                  </div>
                </button>
              </div>
            </div>

            {/* Interpreter-specific fields */}
            {userType === 'interpreter' && (
              <>
                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Languages (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableLanguages.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageToggle(language)}
                        className={`px-3 py-2 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                          formData.languages.includes(language)
                            ? 'bg-[#FFD3B6] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm"
                    placeholder="e.g., 5"
                    min="0"
                    required
                  />
                </div>

                {/* Qualifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications & Certifications
                  </label>
                  <textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm"
                    placeholder="List your medical interpretation qualifications, certifications, and relevant education..."
                    rows={4}
                    maxLength={500}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.qualifications.length}/500 characters
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-2xl font-medium text-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                userType === 'customer'
                  ? 'bg-[#A8E6CF] text-white hover:bg-[#8DD5B8]'
                  : 'bg-[#FFD3B6] text-white hover:bg-[#FFC4A3]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Account...
                </div>
              ) : (
                userType === 'customer' ? 'Create Account' : 'Submit Application'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="px-4 text-gray-500 text-sm">or</div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* LINE Signup Button */}
            <button
              type="button"
              onClick={handleLineSignup}
              className="w-full bg-[#00B900] text-white py-3 rounded-2xl font-medium text-lg cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-[#009900] transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center mr-3">
                <i className="ri-line-fill"></i>
              </div>
              Sign up with LINE
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="text-[#A8E6CF] font-medium cursor-pointer hover:text-[#8DD5B8] transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
