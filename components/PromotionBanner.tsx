'use client';

import { useState, useEffect, useMemo } from 'react';
import { PromotionService, type Promotion } from '@/services/promotionService';

export default function PromotionBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const all = await PromotionService.list();
        const now = Date.now();
        const published = all
          .filter(p => p.status === 'published')
          .filter(p => new Date(p.startAt).getTime() <= now && now <= new Date(p.endAt).getTime())
          .filter(p => !!p.imageUrl)
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        setPromotions(published);
      } catch {/* noop */}
    };
    run();
  }, []);

  const slides = useMemo(() => promotions.map(p => ({
    id: p.id,
    title: p.title,
    subtitle: p.description || '',
    image: p.imageUrl as string
  })), [promotions]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative h-48 mx-4 mt-4 rounded-3xl overflow-hidden">
      {slides.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="w-full h-full rounded-3xl relative"
            style={{
              backgroundImage: `url(${banner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/30 rounded-3xl"></div>
            <div className="absolute inset-0 flex flex-col justify-center px-6">
              <h3 className="text-white text-2xl font-bold mb-2">{banner.title}</h3>
              {banner.subtitle && <p className="text-white/90 text-sm">{banner.subtitle}</p>}
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}