'use client';

import { useState, useEffect } from 'react';
import { getPromotionsTable } from '@/supabase/supabaseClient';
import type { Tables } from '@/types/supabase';

type Promotion = Tables<'promotions'>;

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await getPromotionsTable()
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPromotions(data || []);
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="px-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800">Current Promotions</h2>
          <p className="text-gray-600 text-sm">Special offers and discounts</p>
        </div>
        <div className="px-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="mt-8">
        <div className="px-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800">Current Promotions</h2>
          <p className="text-gray-600 text-sm">Special offers and discounts</p>
        </div>
        <div className="px-4">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
              <i className="ri-gift-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-500">No active promotions available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="px-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800">Current Promotions</h2>
        <p className="text-gray-600 text-sm">Special offers and discounts</p>
      </div>
      
      <div className="overflow-x-auto px-4">
        <div className="flex space-x-4 pb-4">
          {promotions.map((promotion) => (
            <div 
              key={promotion.id} 
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedPromotion(promotion)}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-64 flex-shrink-0 hover:shadow-md transition-shadow">
                {promotion.banner_image ? (
                  <div 
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${promotion.banner_image})` }}
                  />
                ) : (
                  <div className="h-32 bg-gradient-to-br from-[#A8E6CF] to-[#8DD5B8] flex items-center justify-center">
                    <i className="ri-gift-line text-white text-3xl"></i>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{promotion.title}</h3>
                    <div className="flex items-center">
                      <i className="ri-fire-line text-orange-500 text-sm"></i>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">{promotion.description || 'Special offer'}</p>
                  <div className="flex items-center justify-between">
                    <div className="bg-[#A8E6CF]/20 text-[#A8E6CF] text-xs px-2 py-1 rounded-full inline-block">
                      {promotion.discount}
                    </div>
                    {isExpired(promotion.valid_until) && (
                      <span className="text-xs text-red-500">Expired</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotion Detail Modal */}
      {selectedPromotion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Promotion Details</h3>
                <button
                  onClick={() => setSelectedPromotion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              
              {selectedPromotion.banner_image && (
                <div 
                  className="h-48 bg-cover bg-center rounded-xl mb-4"
                  style={{ backgroundImage: `url(${selectedPromotion.banner_image})` }}
                />
              )}
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedPromotion.title}</h4>
                  <p className="text-gray-600 text-sm">{selectedPromotion.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="font-semibold text-[#A8E6CF]">{selectedPromotion.discount}</span>
                </div>
                
                {selectedPromotion.original_price && selectedPromotion.discount_price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-400 line-through">{selectedPromotion.original_price}</span>
                      <span className="ml-2 font-semibold text-[#A8E6CF]">{selectedPromotion.discount_price}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valid until:</span>
                  <span className="text-sm text-gray-800">
                    {new Date(selectedPromotion.valid_until).toLocaleDateString('en-US')}
                  </span>
                </div>
                
                {selectedPromotion.hospital && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hospital:</span>
                    <span className="text-sm text-gray-800">{selectedPromotion.hospital}</span>
                  </div>
                )}
                
                {selectedPromotion.used_count > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Used:</span>
                    <span className="text-sm text-gray-800">{selectedPromotion.used_count} times</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedPromotion(null)}
                  className="w-full bg-[#A8E6CF] text-white py-3 rounded-xl font-medium hover:bg-[#8DD5B8] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
