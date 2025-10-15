'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import Link from 'next/link';

interface ReviewUploadProps {
  reservationId: string;
}

export default function ReviewUpload({ reservationId }: ReviewUploadProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageUpload = (type: 'before' | 'after' | 'receipt') => {
    // Simulate image upload
    const newImage = `https://readdy.ai/api/search-image?query=Medical%20treatment%20$%7Btype%7D%20photo%20placeholder%2C%20professional%20medical%20documentation%2C%20healthcare%20record%2C%20clean%20background&width=200&height=200&seq=upload-${type}-${Date.now()}&orientation=squarish`;
    setUploadedImages([...uploadedImages, newImage]);
  };

  const submitReview = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Navigate back to reservation detail
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4 mb-6">
          <Link href={`/reservations/${reservationId}`} className="flex items-center text-gray-600 mb-4 cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-arrow-left-line"></i>
            </div>
            <span className="text-sm">Back to Reservation</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Leave a Review</h1>
          <p className="text-gray-600 text-sm">Share your experience and help other patients</p>
        </div>
        
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Rate Your Experience</h3>
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="cursor-pointer whitespace-nowrap"
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <i className={`ri-star-${rating >= star ? 'fill' : 'line'} text-3xl ${
                      rating >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}></i>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                {rating === 0 && 'Tap to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Write Your Review</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience, treatment quality, staff service, and overall satisfaction..."
              className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-[#A8E6CF]"
              maxLength={500}
            />
            <div className="text-right mt-2">
              <span className="text-xs text-gray-500">{comment.length}/500 characters</span>
            </div>
          </div>
        </div>
        
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Upload Photos & Documents</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => handleImageUpload('before')}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer whitespace-nowrap hover:border-[#A8E6CF]"
              >
                <div className="w-6 h-6 flex items-center justify-center mb-1">
                  <i className="ri-image-add-line text-gray-400"></i>
                </div>
                <span className="text-xs text-gray-500">Before</span>
              </button>
              
              <button
                onClick={() => handleImageUpload('after')}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer whitespace-nowrap hover:border-[#A8E6CF]"
              >
                <div className="w-6 h-6 flex items-center justify-center mb-1">
                  <i className="ri-image-add-line text-gray-400"></i>
                </div>
                <span className="text-xs text-gray-500">After</span>
              </button>
              
              <button
                onClick={() => handleImageUpload('receipt')}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer whitespace-nowrap hover:border-[#A8E6CF]"
              >
                <div className="w-6 h-6 flex items-center justify-center mb-1">
                  <i className="ri-file-add-line text-gray-400"></i>
                </div>
                <span className="text-xs text-gray-500">Receipt</span>
              </button>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <div 
                      className="aspect-square bg-cover bg-center rounded-xl"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                    <button className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full text-xs cursor-pointer whitespace-nowrap">
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-3">
              Upload before/after photos and treatment receipts to help other patients make informed decisions
            </p>
          </div>
        </div>
        
        <div className="px-4 mb-8">
          <button
            onClick={submitReview}
            className="w-full bg-[#A8E6CF] text-white py-4 rounded-2xl font-semibold text-lg cursor-pointer whitespace-nowrap"
          >
            Submit Review
          </button>
        </div>
      </main>
      
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-[#A8E6CF] rounded-full mx-auto mb-4">
              <i className="ri-check-line text-white text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Review Submitted!</h3>
            <p className="text-gray-600 text-sm">Thank you for sharing your experience</p>
          </div>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
}