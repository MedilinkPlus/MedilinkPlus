'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';
import Link from 'next/link';

export default function InterpreterComparePage() {
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const interpreterFees = [
    {
      id: 1,
      hospital: 'Gangnam Severance Hospital',
      hospitalId: 1,
      department: 'Plastic Surgery',
      treatment: 'Rhinoplasty (Nose Job)',
      interpreterFee: '$120 - $150',
      duration: '2-3 hours',
      commissionRate: '15%',
      lastUpdated: '2024-01-15',
      partnershipStatus: 'active'
    },
    {
      id: 2,
      hospital: 'Seoul Dental Excellence',
      hospitalId: 2,
      department: 'Dentistry',
      treatment: 'Dental Implant (Single)',
      interpreterFee: '$80 - $100',
      duration: '1 hour',
      commissionRate: '12%',
      lastUpdated: '2024-01-14',
      partnershipStatus: 'active'
    },
    {
      id: 3,
      hospital: 'Bumrungrad International',
      hospitalId: 3,
      department: 'Cardiology',
      treatment: 'Heart Bypass Surgery',
      interpreterFee: '$300 - $400',
      duration: '4-6 hours',
      commissionRate: '18%',
      lastUpdated: '2024-01-13',
      partnershipStatus: 'active'
    },
    {
      id: 4,
      hospital: 'BNH Hospital',
      hospitalId: 4,
      department: 'Orthopedics',
      treatment: 'Knee Replacement',
      interpreterFee: '$200 - $280',
      duration: '2-3 hours',
      commissionRate: '16%',
      lastUpdated: '2024-01-12',
      partnershipStatus: 'active'
    },
    {
      id: 5,
      hospital: 'Gangnam Beauty Clinic',
      hospitalId: 5,
      department: 'Dermatology',
      treatment: 'Laser Skin Resurfacing',
      interpreterFee: '$90 - $120',
      duration: '1-2 hours',
      commissionRate: '14%',
      lastUpdated: '2024-01-11',
      partnershipStatus: 'active'
    },
    {
      id: 6,
      hospital: 'Seoul National University Hospital',
      hospitalId: 6,
      department: 'Plastic Surgery',
      treatment: 'Rhinoplasty (Nose Job)',
      interpreterFee: '$130 - $170',
      duration: '2-4 hours',
      commissionRate: '16%',
      lastUpdated: '2024-01-10',
      partnershipStatus: 'active'
    },
    {
      id: 7,
      hospital: 'Asan Medical Center',
      hospitalId: 7,
      department: 'Plastic Surgery',
      treatment: 'Rhinoplasty (Nose Job)',
      interpreterFee: '$110 - $140',
      duration: '2-3 hours',
      commissionRate: '15%',
      lastUpdated: '2024-01-09',
      partnershipStatus: 'active'
    },
    {
      id: 8,
      hospital: 'Samsung Medical Center',
      hospitalId: 8,
      department: 'Dentistry',
      treatment: 'Dental Implant (Single)',
      interpreterFee: '$85 - $110',
      duration: '1-1.5 hours',
      commissionRate: '13%',
      lastUpdated: '2024-01-08',
      partnershipStatus: 'active'
    },
    {
      id: 9,
      hospital: 'Yonsei Severance Hospital',
      hospitalId: 9,
      department: 'Ophthalmology',
      treatment: 'LASIK Eye Surgery',
      interpreterFee: '$70 - $95',
      duration: '30 minutes',
      commissionRate: '11%',
      lastUpdated: '2024-01-07',
      partnershipStatus: 'active'
    },
    {
      id: 10,
      hospital: 'Seoul St. Mary Hospital',
      hospitalId: 10,
      department: 'Ophthalmology',
      treatment: 'LASIK Eye Surgery',
      interpreterFee: '$65 - $90',
      duration: '45 minutes',
      commissionRate: '10%',
      lastUpdated: '2024-01-06',
      partnershipStatus: 'active'
    }
  ];

  // Get unique treatments for comparison
  const uniqueTreatments = [...new Set(interpreterFees.map(fee => fee.treatment))];

  // Get fees grouped by treatment for comparison view
  const getComparisonData = () => {
    if (!selectedTreatment) return [];
    return interpreterFees.filter(fee => fee.treatment === selectedTreatment);
  };

  const filteredFees = interpreterFees.filter(fee =>
    fee.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const comparisonData = getComparisonData();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Interpreter Fee Comparison</h1>
          <p className="text-gray-600 text-sm">Compare interpreter fees and commission rates across partner hospitals</p>
        </div>

        <div className="px-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Available Treatments</p>
                  <p className="text-2xl font-bold text-[#A8E6CF]">{uniqueTreatments.length}</p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full">
                  <i className="ri-first-aid-kit-line text-[#A8E6CF] text-lg"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Partner Hospitals</p>
                  <p className="text-2xl font-bold text-[#FFD3B6]">
                    {new Set(interpreterFees.map(fee => fee.hospital)).size}
                  </p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#FFD3B6]/20 rounded-full">
                  <i className="ri-hospital-line text-[#FFD3B6] text-lg"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg Commission</p>
                  <p className="text-2xl font-bold text-[#E0BBE4]">14%</p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#E0BBE4]/20 rounded-full">
                  <i className="ri-money-dollar-circle-line text-[#E0BBE4] text-lg"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-search-line text-gray-400"></i>
                  </div>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm"
                  placeholder="Search by hospital, treatment, or department..."
                />
              </div>

              <div className="relative md:w-72">
                <select
                  value={selectedTreatment}
                  onChange={(e) => setSelectedTreatment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm pr-8"
                >
                  <option value="">Select treatment to compare</option>
                  {uniqueTreatments.map((treatment) => (
                    <option key={treatment} value={treatment}>
                      {treatment}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {!selectedTreatment ? (
          <div className="px-4">
            <div className="bg-white rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueTreatments.map((treatment) => {
                  const treatmentCount = interpreterFees.filter(fee => fee.treatment === treatment).length;
                  const minFee = Math.min(...interpreterFees
                    .filter(fee => fee.treatment === treatment)
                    .map(fee => parseInt(fee.interpreterFee.replace(/[^0-9]/g, ''))));
                  const avgCommission = Math.round(interpreterFees
                    .filter(fee => fee.treatment === treatment)
                    .reduce((sum, fee) => sum + parseInt(fee.commissionRate), 0) / treatmentCount);

                  return (
                    <div
                      key={treatment}
                      onClick={() => setSelectedTreatment(treatment)}
                      className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[#A8E6CF] hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full">
                          <i className="ri-stethoscope-line text-[#A8E6CF] text-lg"></i>
                        </div>
                        <span className="bg-[#A8E6CF] text-white px-2 py-1 rounded-full text-xs font-medium">
                          {treatmentCount} hospitals
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-2">{treatment}</h3>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-xs">Fee: ${minFee}+</p>
                        <p className="text-gray-600 text-xs">Commission: {avgCommission}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : comparisonData.length === 0 ? (
          <div className="px-4">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                <i className="ri-search-line text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Data Found</h3>
              <p className="text-gray-600">No interpreter fee data available for the selected treatment.</p>
            </div>
          </div>
        ) : (
          <div className="px-4">
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {selectedTreatment}
                </h3>
                <p className="text-gray-600 text-sm">{comparisonData.length} hospitals offering interpreter services</p>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  {comparisonData
                    .sort((a, b) => {
                      const feeA = parseInt(a.interpreterFee.replace(/[^0-9]/g, ''));
                      const feeB = parseInt(b.interpreterFee.replace(/[^0-9]/g, ''));
                      return feeB - feeA; // Highest fee first for interpreters
                    })
                    .map((fee, index) => {
                      const commissionValue = parseInt(fee.commissionRate);
                      return (
                        <div key={fee.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                                    index === 0
                                      ? 'bg-green-100 text-green-600'
                                      : index === 1
                                      ? 'bg-yellow-100 text-yellow-600'
                                      : index === 2
                                      ? 'bg-orange-100 text-orange-600'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  #{index + 1}
                                </div>
                                <Link
                                  href={`/interpreter/hospitals/${fee.hospitalId}`}
                                  className="text-lg font-semibold text-[#A8E6CF] hover:text-[#A8E6CF]/80 cursor-pointer hover:underline"
                                >
                                  {fee.hospital}
                                </Link>
                                <span className="bg-[#E0BBE4]/20 text-[#E0BBE4] px-2 py-1 rounded-full text-xs">
                                  {fee.department}
                                </span>
                                <span 
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    commissionValue >= 15 ? 'bg-green-100 text-green-600' :
                                    commissionValue >= 12 ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-red-100 text-red-600'
                                  }`}
                                >
                                  {fee.commissionRate} Commission
                                </span>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <i className="ri-time-line"></i>
                                  </div>
                                  <span>{fee.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <i className="ri-calendar-line"></i>
                                  </div>
                                  <span>Updated: {fee.lastUpdated}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <i className="ri-shield-check-line"></i>
                                  </div>
                                  <span className="capitalize">{fee.partnershipStatus}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-800">{fee.interpreterFee}</div>
                              <div className="text-sm text-gray-500">Interpreter Fee</div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex gap-2">
                              <Link
                                href={`/interpreter/hospitals/${fee.hospitalId}`}
                                className="flex-1 bg-[#A8E6CF] text-white py-2 px-4 rounded-lg text-center text-sm font-medium cursor-pointer whitespace-nowrap"
                              >
                                View Hospital Details
                              </Link>
                              <button className="flex-1 bg-[#FFD3B6] text-white py-2 px-4 rounded-lg text-center text-sm font-medium cursor-pointer whitespace-nowrap">
                                Contact Hospital
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 mt-8 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                <i className="ri-information-line text-blue-500"></i>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Fee Information</h4>
                <p className="text-blue-700 text-sm">
                  Interpreter fees are paid per session and vary based on treatment complexity and duration. 
                  Commission rates are additional earnings based on successful customer referrals.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      <InterpreterBottomNavigation />
    </div>
  );
}