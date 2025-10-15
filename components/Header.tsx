
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [language, setLanguage] = useState('EN');
  const router = useRouter();
  
  // 인증 훅 사용
  const { user, profile, signOut } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'TH' : 'EN');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href={profile?.role === 'admin' ? '/admin' : profile?.role === 'interpreter' ? '/interpreter/dashboard' : '/dashboard'} className="text-2xl font-pacifico text-[#A8E6CF] cursor-pointer">
        MediLink+
      </Link>
      
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="bg-[#E0BBE4] text-white px-3 py-1 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-[#D4A8D8] transition-colors"
        >
          {language}
        </button>
        
        {user ? (
          <div className="flex items-center gap-2">
            {profile?.role === 'admin' && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                Admin
              </span>
            )}
            {profile?.role === 'interpreter' && (
              <span className="bg-[#FFD3B6] text-[#FF8A65] px-2 py-1 rounded-full text-xs font-medium">
                Interpreter
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 hidden sm:block">
                {profile?.name || user.email}
              </span>
              <button 
                onClick={handleSignOut}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-gray-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link 
            href="/auth/login"
            className="bg-[#A8E6CF] text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}