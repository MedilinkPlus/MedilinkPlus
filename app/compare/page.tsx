
'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import Link from 'next/link';
import { FeeService, type Fee } from '@/services/feeService';
import { HospitalService } from '@/services/hospitalService';

export default function ComparePage() {
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fees, setFees] = useState<Fee[]>([]);
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ hospitals: hospitalRows }, feeRes] = await Promise.all([
          HospitalService.getHospitals(1, 200) as any,
          FeeService.list({ page: 1, limit: 500 })
        ]);
        setHospitals((hospitalRows as any[]).map(h => ({ id: h.id, name: h.name })));
        setFees(feeRes.fees);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown Hospital';

  const uniqueTreatments = useMemo(() => {
    return [...new Set(fees.map(fee => fee.treatment_name))];
  }, [fees]);

  const comparisonData = useMemo(() => {
    if (!selectedTreatment) return [] as Fee[];
    return fees.filter(fee => fee.treatment_name === selectedTreatment);
  }, [fees, selectedTreatment]);

  const filteredFees = useMemo(() => {
    return fees.filter(fee =>
      hospitalName(fee.hospital_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fee.treatment_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fee.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fees, hospitals, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Compare Treatment Fees</h1>
          <p className="text-gray-600 text-sm">Find the best prices for medical treatments across Seoul hospitals</p>
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
                  <p className="text-2xl font-bold text-[#FFD3B6]">{new Set(fees.map(fee => fee.hospital_id)).size}</p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#FFD3B6]/20 rounded-full">
                  <i className="ri-hospital-line text-[#FFD3B6] text-lg"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Options</p>
                  <p className="text-2xl font-bold text-[#E0BBE4]">{fees.length}</p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#E0BBE4]/20 rounded-full">
                  <i className="ri-bar-chart-line text-[#E0BBE4] text-lg"></i>
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
                  const treatmentFees = fees.filter(fee => fee.treatment_name === treatment);
                  const treatmentCount = treatmentFees.length;
                  const minPrice = Math.min(...treatmentFees.map(fee => fee.min_price));

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
                          {treatmentCount} options
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-2">{treatment}</h3>
                      <p className="text-gray-600 text-xs">Starting from ${minPrice.toLocaleString()}</p>
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
              <p className="text-gray-600">No pricing data available for the selected treatment.</p>
            </div>
          </div>
        ) : (
          <div className="px-4">
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {selectedTreatment}
                </h3>
                <p className="text-gray-600 text-sm">{comparisonData.length} hospitals offering this treatment</p>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  {comparisonData
                    .sort((a, b) => a.min_price - b.min_price)
                    .map((fee, index) => (
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
                                href={`/hospitals/${fee.hospital_id}`}
                                className="text-lg font-semibold text-[#A8E6CF] hover:text-[#A8E6CF]/80 cursor-pointer hover:underline"
                              >
                                {hospitalName(fee.hospital_id)}
                              </Link>
                              <span className="bg-[#E0BBE4]/20 text-[#E0BBE4] px-2 py-1 rounded-full text-xs">
                                {fee.department || 'General'}
                              </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <i className="ri-time-line"></i>
                                </div>
                                <span>—</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <i className="ri-calendar-line"></i>
                                </div>
                                <span>Updated: {new Date(fee.updated_at || fee.created_at || Date.now()).toISOString().slice(0,10)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-800">{fee.currency} {fee.min_price}{fee.max_price ? ` - ${fee.currency} ${fee.max_price}` : ''}</div>
                            <div className="text-sm text-gray-500">{fee.currency}</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex gap-2">
                            <Link
                              href={`/hospitals/${fee.hospital_id}`}
                              className="flex-1 bg-[#A8E6CF] text-white py-2 px-4 rounded-lg text-center text-sm font-medium cursor-pointer whitespace-nowrap"
                            >
                              View Hospital
                            </Link>
                            <button className="flex-1 bg-[#FFD3B6] text-white py-2 px-4 rounded-lg text-center text-sm font-medium cursor-pointer whitespace-nowrap">
                              Book Appointment
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 mt-8 mb-8">
          
        </div>

      </main>
      
      <BottomNavigation />
    </div>
  );
}
