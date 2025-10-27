
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // 인증 훅 사용
  const { signIn, user, profile } = useAuth();

  // 역할별 홈 경로 결정
  const resolveHome = (u: any) => {
    // Prefer app profile role first, then auth.user_metadata.role
    const role = (profile?.role as any) || (u?.user_metadata as any)?.role
    const email = (u?.email || '').toLowerCase()
    // Email-based admin allowlist fallback
    if (email === 'ki.oksun@gmail.com') return '/admin'
    if (role === 'admin') return '/admin'
    if (role === 'interpreter') return '/interpreter/dashboard'
    return '/dashboard'
  }

  // Note: Do not auto-redirect before explicit login; allow user to choose to sign in

  // Sanitize URL if email/password are passed via query string
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const emailQ = url.searchParams.get('email');
    const passwordQ = url.searchParams.get('password');
    if (emailQ || passwordQ) {
      setFormData(prev => ({
        email: emailQ || prev.email,
        password: passwordQ || prev.password
      }));
      url.searchParams.delete('email');
      url.searchParams.delete('password');
      // Replace URL without sensitive params
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 간단한 검증
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        // 로그인 성공 시 profile이 로드될 때까지 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 역할별 홈으로 리다이렉트
        // useAuth 내부에서 user 상태가 갱신되므로 최신 user를 사용
        const userWithRole = (window as any).supabaseUser || user;
        const role = profile?.role || (userWithRole?.user_metadata as any)?.role;
        const email = (userWithRole?.email || '').toLowerCase();
        
        let target = '/dashboard';
        if (email === 'ki.oksun@gmail.com') target = '/admin';
        else if (role === 'admin') target = '/admin';
        else if (role === 'interpreter') target = '/interpreter/dashboard';
        
        console.log('Redirecting to:', target, 'role:', role, 'profile:', profile);
        router.push(target);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A8E6CF]/20 via-[#FFD3B6]/20 to-[#E0BBE4]/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-pacifico text-[#A8E6CF] mb-2">
            MediLink+
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
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

            {/* Password Input */}
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
                  placeholder="Enter your password"
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/auth/forgot-password" 
                className="text-[#A8E6CF] text-sm font-medium cursor-pointer hover:text-[#8DD5B8] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#A8E6CF] text-white py-3 rounded-2xl font-medium text-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8DD5B8] transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="text-[#A8E6CF] font-medium cursor-pointer hover:text-[#8DD5B8] transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          
        </div>
      </div>
    </div>
  );
}
