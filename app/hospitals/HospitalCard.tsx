
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Hospital } from '@/types/supabase';

interface HospitalCardProps {
  hospital: Hospital;
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  // Load favorite status from localStorage on component mount
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteHospitals') || '[]');
    setIsFavorited(favorites.includes(hospital.id));
  }, [hospital.id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteHospitals') || '[]');
    
    if (isFavorited) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((id: string) => id !== hospital.id);
      localStorage.setItem('favoriteHospitals', JSON.stringify(updatedFavorites));
      setIsFavorited(false);
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, hospital.id];
      localStorage.setItem('favoriteHospitals', JSON.stringify(updatedFavorites));
      setIsFavorited(true);
    }
  };

  // 기본 이미지 URL (실제 이미지가 없을 경우)
  const defaultImage = 'https://readdy.ai/api/search-image?query=Modern%20hospital%20building%20exterior%2C%20clean%20medical%20facility%2C%20professional%20healthcare%20center&width=400&height=250&orientation=landscape';
  
  // 이미지 URL 결정
  const imageUrl = hospital.image_url || defaultImage;

  // 평점 표시 (소수점 1자리까지)
  const displayRating = hospital.rating ? hospital.rating.toFixed(1) : 'N/A';
  
  // 리뷰 수 표시 (실제 데이터에서는 total_reviews 사용)
  const reviewCount = hospital.total_reservations || 0;

  const handleViewOnMap = () => {
    const address = (hospital.address || '').trim();
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {}
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative">
        <div 
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        {/* 프로모션 배지 (향후 구현) */}
        {/* <div className="absolute top-3 left-3 bg-[#FFD3B6] text-white px-2 py-1 rounded-full text-xs font-medium">
          프로모션
        </div> */}
        <button 
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer whitespace-nowrap transition-colors ${
            isFavorited 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-600 hover:bg-white'
          }`}
          suppressHydrationWarning={true}
        >
          <i className={isFavorited ? 'ri-heart-fill' : 'ri-heart-line'}></i>
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">{hospital.name}</h3>
            <p className="text-sm text-gray-600 mb-1">
              {hospital.specialty || 'General Medicine'}
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                <i className="ri-map-pin-line"></i>
              </div>
              <span className="truncate">{hospital.address}</span>
            </div>
          </div>
          <div className="text-right ml-2">
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-star-fill text-yellow-400"></i>
              </div>
              <span className="text-sm font-medium text-gray-800 ml-1">
                {displayRating}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              ({reviewCount} reservations)
            </p>
          </div>
        </div>
        
        {/* 병원 상태 표시 */}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            hospital.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${
              hospital.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            {hospital.status === 'active' ? '운영중' : '운영중단'}
          </span>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={handleViewOnMap}
            disabled={!hospital.address}
            className={`flex items-center justify-center flex-1 py-2 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors ${hospital.address ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            suppressHydrationWarning={true}
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-map-pin-line"></i>
            </div>
            View on Map
          </button>
          <Link
            href={`/hospitals/${hospital.id}`}
            className="flex-1 bg-[#A8E6CF] text-white text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
