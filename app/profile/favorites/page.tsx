
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import Link from 'next/link';

interface Hospital {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  specialty: string;
  image: string;
  distance: string;
  acceptsInsurance: boolean;
  waitTime: string;
  price: string;
}

const allHospitals: Hospital[] = [
  {
    id: 1,
    name: 'Seoul Dental Excellence',
    location: 'Gangnam District',
    rating: 4.9,
    reviews: 342,
    specialty: 'Dental Care',
    image: 'https://readdy.ai/api/search-image?query=Modern%20dental%20hospital%20exterior%20in%20Seoul%2C%20clean%20white%20building%2C%20professional%20medical%20facility%2C%20glass%20windows%2C%20Korean%20signage%2C%20urban%20healthcare%20center%2C%20welcoming%20entrance&width=400&height=200&seq=hospital-fav-1&orientation=landscape',
    distance: '2.3 km',
    acceptsInsurance: true,
    waitTime: '15-30 min',
    price: '₩45,000 - ₩80,000'
  },
  {
    id: 2, 
    name: 'Gangnam Beauty Clinic',
    location: 'Gangnam District',
    rating: 4.8,
    reviews: 256,
    specialty: 'Plastic Surgery',
    image: 'https://readdy.ai/api/search-image?query=Elegant%20plastic%20surgery%20clinic%20building%20in%20Gangnam%20Seoul%2C%20modern%20architecture%2C%20luxury%20medical%20center%2C%20sophisticated%20design%2C%20professional%20healthcare%20facility%2C%20Korean%20medical%20tourism&width=400&height=200&seq=hospital-fav-2&orientation=landscape',
    distance: '5.1 km',
    acceptsInsurance: true,
    waitTime: '20-45 min',
    price: '₩55,000 - ₩120,000'
  },
  {
    id: 3,
    name: 'Myeongdong Medical Center',
    location: 'Jung District',
    rating: 4.7,
    reviews: 189,
    specialty: 'General Surgery',
    image: 'https://readdy.ai/api/search-image?query=Large%20medical%20center%20building%20in%20Myeongdong%20Seoul%2C%20multi-story%20hospital%2C%20modern%20healthcare%20facility%2C%20professional%20medical%20building%2C%20Korean%20hospital%20architecture&width=400&height=200&seq=hospital-fav-3&orientation=landscape',
    distance: '3.8 km',
    acceptsInsurance: true,
    waitTime: '25-40 min',
    price: '₩70,000 - ₩150,000'
  },
  {
    id: 4,
    name: 'Apgujeong Skin Clinic',
    location: 'Gangnam District',
    rating: 4.9,
    reviews: 298,
    specialty: 'Dermatology',
    image: 'https://readdy.ai/api/search-image?query=Modern%20dermatology%20clinic%20in%20Apgujeong%20Seoul%2C%20clean%20medical%20facility%2C%20skincare%20center%2C%20professional%20building%2C%20Korean%20beauty%20clinic%20architecture&width=400&height=200&seq=hospital-fav-4&orientation=landscape',
    distance: '4.2 km',
    acceptsInsurance: true,
    waitTime: '30-60 min',
    price: '₩50,000 - ₩95,000'
  },
  {
    id: 5,
    name: 'Samsung Medical Center',
    location: 'Gangnam District',
    rating: 4.8,
    reviews: 412,
    specialty: 'Cardiology',
    image: 'https://readdy.ai/api/search-image?query=Samsung%20Medical%20Center%20Seoul%2C%20large%20hospital%20complex%2C%20modern%20medical%20facility%2C%20professional%20healthcare%20building%2C%20Korean%20medical%20institution&width=400&height=200&seq=hospital-fav-5&orientation=landscape',
    distance: '6.7 km',
    acceptsInsurance: true,
    waitTime: '20-35 min',
    price: '₩40,000 - ₩85,000'
  },
  {
    id: 6,
    name: 'Hongdae Beauty Center',
    location: 'Mapo District',
    rating: 4.6,
    reviews: 134,
    specialty: 'Cosmetic Surgery',
    image: 'https://readdy.ai/api/search-image?query=Beauty%20center%20in%20Hongdae%20Seoul%2C%20modern%20cosmetic%20surgery%20clinic%2C%20trendy%20medical%20facility%2C%20Korean%20beauty%20clinic%2C%20professional%20healthcare%20building&width=400&height=200&seq=hospital-fav-6&orientation=landscape',
    distance: '7.1 km',
    acceptsInsurance: true,
    waitTime: '25-50 min',
    price: '₩60,000 - ₩110,000'
  }
];

export default function FavoritesPage() {
  const [favoriteHospitals, setFavoriteHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteHospitals') || '[]');
    const favoriteHospitalData = allHospitals.filter(hospital => 
      favorites.includes(hospital.id)
    );
    setFavoriteHospitals(favoriteHospitalData);
    setIsLoading(false);
  }, []);

  const removeFavorite = (hospitalId: number) => {
    const currentFavorites = JSON.parse(localStorage.getItem('favoriteHospitals') || '[]');
    const updatedFavorites = currentFavorites.filter((id: number) => id !== hospitalId);
    localStorage.setItem('favoriteHospitals', JSON.stringify(updatedFavorites));
    
    setFavoriteHospitals(prev => prev.filter(hospital => hospital.id !== hospitalId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4">
          <div className="px-4">
            <div className="flex items-center mb-6">
              <Link href="/profile" className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm cursor-pointer whitespace-nowrap mr-3">
                <i className="ri-arrow-left-line text-gray-600"></i>
              </Link>
              <h1 className="text-xl font-bold text-gray-800">Favorite Hospitals</h1>
            </div>
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-[#A8E6CF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4">
          <div className="flex items-center mb-6">
            <Link href="/profile" className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm cursor-pointer whitespace-nowrap mr-3">
              <i className="ri-arrow-left-line text-gray-600"></i>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Favorite Hospitals</h1>
          </div>

          {favoriteHospitals.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                <i className="ri-heart-line text-gray-400 text-3xl"></i>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">No Favorite Hospitals</h3>
              <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto">
                You haven't saved any hospitals yet. Browse hospitals and tap the heart icon to add them to your favorites.
              </p>
              <Link 
                href="/hospitals"
                className="inline-block bg-[#A8E6CF] text-white px-6 py-3 rounded-full font-medium cursor-pointer whitespace-nowrap"
              >
                Browse Hospitals
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 text-sm">
                  {favoriteHospitals.length} saved hospital{favoriteHospitals.length !== 1 ? 's' : ''}
                </p>
                <Link 
                  href="/hospitals"
                  className="text-[#A8E6CF] text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  + Add More
                </Link>
              </div>

              {favoriteHospitals.map((hospital) => (
                <div key={hospital.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative">
                  <div className="flex">
                    <div 
                      className="w-20 h-20 rounded-xl bg-cover bg-center bg-top flex-shrink-0"
                      style={{ backgroundImage: `url(${hospital.image})` }}
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight pr-2">
                          {hospital.name}
                        </h3>
                        <button
                          onClick={() => removeFavorite(hospital.id)}
                          className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-full cursor-pointer whitespace-nowrap flex-shrink-0"
                        >
                          <i className="ri-heart-fill text-red-500"></i>
                        </button>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                          <i className="ri-map-pin-line text-gray-400 text-xs"></i>
                        </div>
                        <span className="text-gray-600 text-xs">{hospital.location}</span>
                        <span className="text-gray-400 text-xs mx-1">•</span>
                        <span className="text-gray-600 text-xs">{hospital.distance}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center mr-3">
                            <div className="w-4 h-4 flex items-center justify-center mr-1">
                              <i className="ri-star-fill text-yellow-400 text-xs"></i>
                            </div>
                            <span className="text-gray-800 text-xs font-medium">{hospital.rating}</span>
                            <span className="text-gray-500 text-xs ml-1">({hospital.reviews})</span>
                          </div>
                          
                          {hospital.acceptsInsurance && (
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-shield-check-line text-[#A8E6CF] text-xs"></i>
                            </div>
                          )}
                        </div>
                        
                        <Link
                          href={`/hospitals/${hospital.id}`}
                          className="bg-[#A8E6CF] text-white px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                          <i className="ri-stethoscope-line text-gray-400"></i>
                        </div>
                        <span className="text-gray-600">{hospital.specialty}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                          <i className="ri-time-line text-gray-400"></i>
                        </div>
                        <span className="text-gray-600">{hospital.waitTime}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                          <i className="ri-money-dollar-circle-line text-gray-400"></i>
                        </div>
                        <span className="text-gray-600">{hospital.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
