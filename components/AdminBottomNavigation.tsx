
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminBottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', icon: 'ri-home-line', activeIcon: 'ri-home-fill', label: 'Home' },
    { href: '/admin/price-comparison', icon: 'ri-bar-chart-line', activeIcon: 'ri-bar-chart-fill', label: 'Prices' },
    { href: '/admin/users', icon: 'ri-user-line', activeIcon: 'ri-user-fill', label: 'Users' },
    { href: '/admin/hospitals', icon: 'ri-hospital-line', activeIcon: 'ri-hospital-fill', label: 'Hospitals' },
    { href: '/admin/reservations', icon: 'ri-calendar-line', activeIcon: 'ri-calendar-fill', label: 'Bookings' },
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
                isActive ? 'bg-red-500/20 text-red-500' : 'text-gray-500'
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
