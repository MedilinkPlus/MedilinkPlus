'use client';

import Link from 'next/link';

export default function RecommendedHospitals() {
  const hospitals = [
    {
      id: 1,
      name: 'Seoul Dental Excellence',
      specialty: 'Dental Care',
      rating: 4.9,
      image: 'https://readdy.ai/api/search-image?query=Modern%20dental%20hospital%20exterior%20in%20Seoul%2C%20clean%20white%20building%2C%20professional%20medical%20facility%2C%20glass%20windows%2C%20Korean%20signage%2C%20urban%20healthcare%20center%2C%20welcoming%20entrance&width=300&height=200&seq=hospital-1&orientation=landscape',
      promotion: '30% OFF First Visit'
    },
    {
      id: 2,
      name: 'Gangnam Beauty Clinic',
      specialty: 'Plastic Surgery',
      rating: 4.8,
      image: 'https://readdy.ai/api/search-image?query=Elegant%20plastic%20surgery%20clinic%20building%20in%20Gangnam%20Seoul%2C%20modern%20architecture%2C%20luxury%20medical%20center%2C%20sophisticated%20design%2C%20professional%20healthcare%20facility%2C%20Korean%20medical%20tourism&width=300&height=200&seq=hospital-2&orientation=landscape',
      promotion: 'Free Consultation'
    },
    {
      id: 3,
      name: 'Myeongdong Medical Center',
      specialty: 'General Surgery',
      rating: 4.7,
      image: 'https://readdy.ai/api/search-image?query=Large%20medical%20center%20building%20in%20Myeongdong%20Seoul%2C%20multi-story%20hospital%2C%20modern%20healthcare%20facility%2C%20professional%20medical%20building%2C%20Korean%20hospital%20architecture&width=300&height=200&seq=hospital-3&orientation=landscape',
      promotion: 'VIP Package Available'
    }
  ];

  return (
    <div className="mt-8">
      <div className="px-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800">Recommended Hospitals</h2>
        <p className="text-gray-600 text-sm">Top-rated medical facilities</p>
      </div>
      
      <div className="overflow-x-auto px-4">
        <div className="flex space-x-4 pb-4">
          {hospitals.map((hospital) => (
            <Link key={hospital.id} href={`/hospitals/${hospital.id}`} className="cursor-pointer whitespace-nowrap">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-64 flex-shrink-0">
                <div 
                  className="h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url(${hospital.image})` }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{hospital.name}</h3>
                    <div className="flex items-center">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-star-fill text-yellow-400 text-sm"></i>
                      </div>
                      <span className="text-xs text-gray-600 ml-1">{hospital.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs mb-2">{hospital.specialty}</p>
                  <div className="bg-[#A8E6CF]/20 text-[#A8E6CF] text-xs px-2 py-1 rounded-full inline-block">
                    {hospital.promotion}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}