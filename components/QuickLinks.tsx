'use client';

import Link from 'next/link';

export default function QuickLinks() {
  const quickLinks = [
    {
      title: 'Find Interpreter',
      icon: 'ri-user-search-line',
      href: '/interpreters',
      color: 'bg-[#A8E6CF]'
    },
    {
      title: 'View Hospitals',
      icon: 'ri-hospital-line',
      href: '/hospitals',
      color: 'bg-[#FFD3B6]'
    },
    {
      title: 'Compare Fees',
      icon: 'ri-bar-chart-line',
      href: '/compare',
      color: 'bg-[#E0BBE4]'
    }
  ];

  return (
    <div className="px-4 mt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Reference</h2>
      <div className="grid grid-cols-3 gap-3">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="cursor-pointer whitespace-nowrap"
          >
            <div className={`${link.color} p-4 rounded-2xl text-center shadow-sm`}>
              <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                <i className={`${link.icon} text-2xl text-white`}></i>
              </div>
              <span className="text-white text-sm font-medium">{link.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}