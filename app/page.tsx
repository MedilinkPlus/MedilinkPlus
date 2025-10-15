
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait for the router to be ready before redirecting
    const timer = setTimeout(() => {
      setIsInitialized(true);
      router.push('/auth/login');
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A8E6CF]/20 via-[#FFD3B6]/20 to-[#E0BBE4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-[#A8E6CF] rounded-full mx-auto mb-4 animate-pulse">
            <i className="ri-loader-4-line text-white text-2xl animate-spin"></i>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}