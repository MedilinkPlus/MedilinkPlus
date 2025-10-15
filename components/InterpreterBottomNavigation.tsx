
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function InterpreterBottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/interpreter/dashboard', icon: 'ri-home-line', activeIcon: 'ri-home-fill', label: 'Dashboard' },
    { href: '/interpreter/requests', icon: 'ri-mail-line', activeIcon: 'ri-mail-fill', label: 'Requests' },
    { href: '/interpreter/reservations', icon: 'ri-calendar-line', activeIcon: 'ri-calendar-fill', label: 'Reservations' },
    { href: '/interpreter/customers', icon: 'ri-user-heart-line', activeIcon: 'ri-user-heart-fill', label: 'Customers' },
    { href: '/interpreter/profile', icon: 'ri-user-settings-line', activeIcon: 'ri-user-settings-fill', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-1 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-1 rounded-xl cursor-pointer whitespace-nowrap ${
                isActive ? 'bg-[#A8E6CF]/20 text-[#A8E6CF]' : 'text-gray-500'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${isActive ? item.activeIcon : item.icon} text-lg`}></i>
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
