'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';
import Link from 'next/link';

export default function InterpreterHospitalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [partnershipStatus, setPartnershipStatus] = useState('All');

  const hospitals = [
    {
      id: 1,
      name: 'Seoul Dental Excellence',
      type: 'Dental Clinic',
      location: 'Gangnam',
      address: '123 Gangnam-daero, Gangnam-gu, Seoul',
      phone: '+82-2-1234-5678',
      partnership: 'active',
      activeRequests: 3,
      completedAppointments: 45,
      rating: 4.8,
      specialties: ['Dental Implants', 'Orthodontics', 'Cosmetic Dentistry'],
      image: 'https://readdy.ai/api/search-image?query=Modern%20dental%20clinic%20exterior%2C%20clean%20white%20building%2C%20medical%20center%20sign%2C%20professional%20healthcare%20facility%2C%20Korean%20hospital%20architecture%2C%20bright%20entrance%2C%20medical%20cross%20symbol&width=300&height=200&seq=hospital-1&orientation=landscape',
      interpreterFee: '₩80,000',
      contactPerson: 'Dr. Park Min-jun',
      workingHours: '09:00 - 18:00'
    },
    {
      id: 2,
      name: 'Gangnam Beauty Clinic',
      type: 'Plastic Surgery',
      location: 'Gangnam',
      address: '456 Apgujeong-ro, Gangnam-gu, Seoul',
      phone: '+82-2-2345-6789',
      partnership: 'active',
      activeRequests: 2,
      completedAppointments: 32,
      rating: 4.9,
      specialties: ['Rhinoplasty', 'Face Lift', 'Breast Surgery'],
      image: 'https://readdy.ai/api/search-image?query=Luxury%20plastic%20surgery%20clinic%20exterior%2C%20modern%20glass%20building%2C%20elegant%20medical%20center%2C%20upscale%20healthcare%20facility%2C%20premium%20clinic%20entrance%2C%20sophisticated%20architecture&width=300&height=200&seq=hospital-2&orientation=landscape',
      interpreterFee: '₩100,000',
      contactPerson: 'Dr. Kim So-young',
      workingHours: '10:00 - 19:00'
    },
    {
      id: 3,
      name: 'Myeongdong Medical Center',
      type: 'General Hospital',
      location: 'Jung-gu',
      address: '789 Myeongdong-gil, Jung-gu, Seoul',
      phone: '+82-2-3456-7890',
      partnership: 'active',
      activeRequests: 5,
      completedAppointments: 78,
      rating: 4.7,
      specialties: ['Internal Medicine', 'Dermatology', 'General Surgery'],
      image: 'https://readdy.ai/api/search-image?query=Large%20general%20hospital%20building%2C%20multi-story%20medical%20center%2C%20professional%20healthcare%20facility%2C%20hospital%20entrance%20with%20ambulance%20bay%2C%20modern%20medical%20architecture&width=300&height=200&seq=hospital-3&orientation=landscape',
      interpreterFee: '₩90,000',
      contactPerson: 'Dr. Lee Jung-ho',
      workingHours: '08:00 - 17:00'
    },
    {
      id: 4,
      name: 'Samsung Medical Center',
      type: 'General Hospital',
      location: 'Gangnam',
      address: '81 Irwon-ro, Gangnam-gu, Seoul',
      phone: '+82-2-3410-2114',
      partnership: 'active',
      activeRequests: 8,
      completedAppointments: 156,
      rating: 4.9,
      specialties: ['Cardiology', 'Oncology', 'Neurosurgery'],
      image: 'https://readdy.ai/api/search-image?query=Large%20university%20hospital%20complex%2C%20modern%20medical%20center%20building%2C%20prestigious%20healthcare%20facility%2C%20multiple%20buildings%20medical%20campus%2C%20advanced%20hospital%20architecture&width=300&height=200&seq=hospital-4&orientation=landscape',
      interpreterFee: '₩120,000',
      contactPerson: 'Dr. Choi Hyun-woo',
      workingHours: '08:30 - 17:30'
    },
    {
      id: 5,
      name: 'Apgujeong Skin Clinic',
      type: 'Dermatology',
      location: 'Gangnam',
      address: '321 Apgujeong-dong, Gangnam-gu, Seoul',
      phone: '+82-2-4567-8901',
      partnership: 'pending',
      activeRequests: 1,
      completedAppointments: 23,
      rating: 4.6,
      specialties: ['Laser Treatment', 'Anti-aging', 'Acne Treatment'],
      image: 'https://readdy.ai/api/search-image?query=Elegant%20dermatology%20clinic%20exterior%2C%20clean%20white%20medical%20building%2C%20skincare%20center%20sign%2C%20modern%20beauty%20clinic%2C%20professional%20aesthetic%20facility&width=300&height=200&seq=hospital-5&orientation=landscape',
      interpreterFee: '₩70,000',
      contactPerson: 'Dr. Yoon Mi-ra',
      workingHours: '10:00 - 20:00'
    },
    {
      id: 6,
      name: 'Hongdae Beauty Center',
      type: 'Plastic Surgery',
      location: 'Mapo',
      address: '654 Hongik-ro, Mapo-gu, Seoul',
      phone: '+82-2-5678-9012',
      partnership: 'inactive',
      activeRequests: 0,
      completedAppointments: 12,
      rating: 4.4,
      specialties: ['Double Eyelid Surgery', 'Nose Job', 'Liposuction'],
      image: 'https://readdy.ai/api/search-image?query=Small%20beauty%20clinic%20building%2C%20cozy%20plastic%20surgery%20center%2C%20boutique%20medical%20facility%2C%20intimate%20healthcare%20clinic%2C%20modern%20medical%20office%20building&width=300&height=200&seq=hospital-6&orientation=landscape',
      interpreterFee: '₩85,000',
      contactPerson: 'Dr. Han Ji-soo',
      workingHours: '11:00 - 21:00'
    }
  ];

  const locations = ['All', 'Gangnam', 'Jung-gu', 'Mapo', 'Yongsan', 'Seocho'];
  const types = ['All', 'General Hospital', 'Dental Clinic', 'Plastic Surgery', 'Dermatology'];

  const getFilteredHospitals = () => {
    let filtered = hospitals;

    if (searchTerm) {
      filtered = filtered.filter(hospital => 
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter(hospital => hospital.type === typeFilter);
    }

    if (locationFilter !== 'All') {
      filtered = filtered.filter(hospital => hospital.location === locationFilter);
    }

    if (partnershipStatus !== 'All') {
      filtered = filtered.filter(hospital => hospital.partnership === partnershipStatus.toLowerCase());
    }

    return filtered;
  };

  const getPartnershipColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPartnershipText = (status: string) => {
    switch (status) {
      case 'active': return 'Active Partner';
      case 'pending': return 'Pending';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const filteredHospitals = getFilteredHospitals();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Partner Hospitals</h1>
          <p className="text-gray-600 text-sm">Manage your hospital partnerships and requests</p>
        </div>

        {/* Search */}
        <div className="px-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] text-sm"
              placeholder="Search hospitals by name, type, or specialty..."
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Status</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Active', 'Pending', 'Inactive'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setPartnershipStatus(status)}
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap ${
                        partnershipStatus === status
                          ? 'bg-[#A8E6CF] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF] pr-8"
                  >
                    {types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF] pr-8"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital List */}
        <div className="px-4">
          {filteredHospitals.length > 0 ? (
            <div className="space-y-4">
              {filteredHospitals.map((hospital) => (
                <div key={hospital.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${hospital.image})` }}
                  />
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                        <p className="text-gray-500 text-sm">{hospital.type} • {hospital.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPartnershipColor(hospital.partnership)}`}>
                          {getPartnershipText(hospital.partnership)}
                        </span>
                        <div className="flex items-center">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-star-fill text-yellow-400 text-sm"></i>
                          </div>
                          <span className="text-sm text-gray-700 ml-1">{hospital.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          <i className="ri-map-pin-line text-[#FFD3B6] text-sm"></i>
                        </div>
                        <span className="text-gray-700 text-sm">{hospital.address}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="flex items-center mb-1">
                            <div className="w-4 h-4 flex items-center justify-center mr-2">
                              <i className="ri-file-list-line text-[#A8E6CF] text-sm"></i>
                            </div>
                            <span className="text-gray-600">Active: {hospital.activeRequests}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 flex items-center justify-center mr-2">
                              <i className="ri-check-line text-green-500 text-sm"></i>
                            </div>
                            <span className="text-gray-600">Completed: {hospital.completedAppointments}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <div className="w-4 h-4 flex items-center justify-center mr-2">
                              <i className="ri-money-dollar-circle-line text-[#E0BBE4] text-sm"></i>
                            </div>
                            <span className="text-gray-600">Fee: {hospital.interpreterFee}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 flex items-center justify-center mr-2">
                              <i className="ri-time-line text-gray-400 text-sm"></i>
                            </div>
                            <span className="text-gray-600">{hospital.workingHours}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-start">
                          <div className="w-4 h-4 flex items-center justify-center mr-2 mt-0.5">
                            <i className="ri-stethoscope-line text-gray-400 text-sm"></i>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {hospital.specialties.map((specialty, index) => (
                              <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex items-center">
                          <div className="w-4 h-4 flex items-center justify-center mr-2">
                            <i className="ri-user-line text-gray-400 text-sm"></i>
                          </div>
                          <span className="text-gray-600 text-sm">Contact: {hospital.contactPerson}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <a
                        href={`tel:${hospital.phone}`}
                        className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap"
                      >
                        <div className="w-4 h-4 flex items-center justify-center mr-1 inline-flex">
                          <i className="ri-phone-line"></i>
                        </div>
                        Call
                      </a>
                      {hospital.partnership === 'active' && hospital.activeRequests > 0 && (
                        <Link
                          href={`/interpreter/requests?hospital=${hospital.id}`}
                          className="flex-1 bg-[#A8E6CF] text-white text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap"
                        >
                          View Requests ({hospital.activeRequests})
                        </Link>
                      )}
                      {hospital.partnership === 'pending' && (
                        <button className="flex-1 bg-[#FFD3B6] text-white text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap">
                          Partnership Pending
                        </button>
                      )}
                      {hospital.partnership === 'inactive' && (
                        <button className="flex-1 bg-gray-300 text-gray-600 text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap">
                          Request Partnership
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                <i className="ri-hospital-line text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">No hospitals found</h3>
              <p className="text-gray-600 text-sm">
                {searchTerm || typeFilter !== 'All' || locationFilter !== 'All' || partnershipStatus !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'Hospital partnerships will appear here'
                }
              </p>
            </div>
          )}
        </div>
      </main>
      
      <InterpreterBottomNavigation />
    </div>
  );
}