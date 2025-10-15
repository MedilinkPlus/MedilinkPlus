
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function BottomNavigation() {
  const pathname = usePathname();
  const [homeHref, setHomeHref] = useState('/dashboard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userRole = localStorage.getItem('userRole');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn) {
      if (userRole === 'admin') {
        setHomeHref('/admin');
      } else if (userRole === 'interpreter') {
        setHomeHref('/interpreter/dashboard');
      } else {
        setHomeHref('/dashboard');
      }
    } else {
      setHomeHref('/auth/login');
    }
  }, []);

  const navItems = [
    { href: homeHref, icon: 'ri-home-line', activeIcon: 'ri-home-fill', label: 'Home' },
    { href: '/interpreters', icon: 'ri-user-line', activeIcon: 'ri-user-fill', label: 'Interpreters' },
    { href: '/hospitals', icon: 'ri-hospital-line', activeIcon: 'ri-hospital-fill', label: 'Hospitals' },
    { href: '/reservations', icon: 'ri-calendar-line', activeIcon: 'ri-calendar-fill', label: 'Reservations' },
    { href: '/profile', icon: 'ri-user-settings-line', activeIcon: 'ri-user-settings-fill', label: 'My Page' },
  ];

  if (!isClient) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50">
        <div className="flex justify-around">
          <div className="flex flex-col items-center py-2 px-3 rounded-xl cursor-pointer whitespace-nowrap text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-line text-xl"></i>
            </div>
            <span className="text-xs mt-1 font-medium">Home</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-xl cursor-pointer whitespace-nowrap ${
                isActive ? 'bg-[#A8E6CF]/20 text-[#A8E6CF]' : 'text-gray-500'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <i className={`${isActive ? item.activeIcon : item.icon} text-xl`}></i>
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
