'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AdminBottomNavigation from '@/components/AdminBottomNavigation';
import RoleGuard from '@/components/RoleGuard';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import { SuccessMessage } from '@/components/system/SuccessMessage';
import { FeeService, type Fee } from '@/services/feeService';
import { HospitalService } from '@/services/hospitalService';
import type { Hospital } from '@/types/supabase';

interface FeeWithHospital extends Fee {
  hospital?: { id: string; name: string };
}

export default function AdminFeesPage() {
  const [fees, setFees] = useState<FeeWithHospital[]>([]);
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState<string>('all');
  const [editingFee, setEditingFee] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Fee>>({
    hospital_id: '',
    department: '',
    treatment: null,
    min_price: 0,
    max_price: 0,
    currency: 'USD',
    duration: ''
  });

  useEffect(() => {
    fetchFees();
    fetchHospitals();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError(null);

      const { fees: feesData } = await FeeService.list({ page: 1, limit: 1000 });
      const { hospitals: hospitalsData } = await HospitalService.getHospitals(1, 1000);
      
      // Map fees with hospital names
      const feesWithHospitals = feesData.map((fee: Fee) => ({
        ...fee,
        hospital: hospitalsData.find((h: any) => h.id === fee.hospital_id)
      }));

      setFees(feesWithHospitals);
      setHospitals(hospitalsData.map((h: Hospital) => ({ id: h.id, name: h.name })));
    } catch (err: any) {
      setError('Failed to load fee list.');
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const { hospitals: hospitalsData } = await HospitalService.getHospitals(1, 1000);
      setHospitals(hospitalsData.map((h: Hospital) => ({ id: h.id, name: h.name })));
    } catch (err: any) {
      console.error('Error fetching hospitals:', err);
    }
  };

  const handleEditFee = (fee: FeeWithHospital) => {
    setEditingFee(fee.id);
    setEditForm({
      hospital_id: fee.hospital_id || '',
      department: fee.department || '',
      treatment: fee.treatment || null,
      min_price: fee.min_price || 0,
      max_price: fee.max_price || 0,
      currency: fee.currency || 'USD',
      duration: fee.duration || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingFee) return;

    try {
      setError(null);
      await FeeService.update(editingFee, {
        hospital_id: editForm.hospital_id!,
        department: editForm.department,
        treatment: editForm.treatment,
        min_price: editForm.min_price!,
        max_price: editForm.max_price,
        currency: editForm.currency!,
        duration: editForm.duration
      });

      setSuccessMessage('Fee information updated successfully.');
      setEditingFee(null);
      fetchFees();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to update fee information.');
      console.error('Error updating fee:', err);
    }
  };

  const handleDeleteFee = async (feeId: string) => {
    if (!window.confirm('Are you sure you want to delete this fee? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await FeeService.delete(feeId);

      setSuccessMessage('Fee deleted successfully.');
      fetchFees();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to delete fee.');
      console.error('Error deleting fee:', err);
    }
  };

  const handleAddFee = async () => {
    try {
      setError(null);
      await FeeService.create({
        hospital_id: editForm.hospital_id!,
        department: editForm.department,
        treatment: editForm.treatment!,
        min_price: editForm.min_price!,
        max_price: editForm.max_price,
        currency: editForm.currency!,
        duration: editForm.duration
      });

      setSuccessMessage('New fee added successfully.');
      setEditForm({
        hospital_id: '',
        department: '',
        treatment: null,
        min_price: 0,
        max_price: 0,
        currency: 'USD',
        duration: ''
      });
      fetchFees();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to add fee.');
      console.error('Error adding fee:', err);
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.hospital?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = hospitalFilter === 'all' || fee.hospital_id === hospitalFilter;
    
    return matchesSearch && matchesHospital;
  });

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'KRW': return '₩';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return currency;
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />
          <main className="pt-4">
            <LoadingSpinner size="lg" text="Loading fee list..." className="py-20" />
          </main>
          <AdminBottomNavigation />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        
        <main className="pt-4">
          <div className="px-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Fee Management</h1>
            <p className="text-gray-600">Set and manage service fees by hospital</p>
          </div>

          {error && (
            <div className="px-4 mb-4">
              <ErrorMessage error={error} onRetry={fetchFees} />
            </div>
          )}

          {successMessage && (
            <div className="px-4 mb-4">
              <SuccessMessage message={successMessage} />
            </div>
          )}

          {/* 통계 카드 */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#A8E6CF]">{fees.length}</div>
                  <div className="text-sm text-gray-600">Total Fee Items</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FFD3B6]">
                    {Array.from(new Set(fees.map(f => f.hospital_id))).length}
                  </div>
                  <div className="text-sm text-gray-600">Registered Hospitals</div>
                </div>
              </div>
            </div>
          </div>

          {/* 새 수수료 추가 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Fee</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <select
                  value={editForm.hospital_id}
                  onChange={(e) => setEditForm(prev => ({ ...prev, hospital_id: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Department"
                  value={editForm.department || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <input
                  type="text"
                  placeholder="Treatment Name"
                  value={editForm.treatment || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, treatment: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <select
                  value={editForm.currency || 'USD'}
                  onChange={(e) => setEditForm(prev => ({ ...prev, currency: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KRW">KRW (₩)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={editForm.min_price || 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, min_price: Number(e.target.value) }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={editForm.max_price || 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, max_price: Number(e.target.value) }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 30min, 1hr)"
                  value={editForm.duration || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <button
                  onClick={handleAddFee}
                  disabled={!editForm.hospital_id || !editForm.treatment}
                  className="px-6 py-2 bg-[#A8E6CF] text-white rounded-xl font-medium hover:bg-[#8DD5B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* 필터 및 검색 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by treatment, department or hospital name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                  />
                </div>
                <select
                  value={hospitalFilter}
                  onChange={(e) => setHospitalFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                >
                  <option value="all">All Hospitals</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 수수료 목록 */}
          <div className="px-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hospital/Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {editingFee === fee.id ? (
                                <select
                                  value={editForm.hospital_id}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, hospital_id: e.target.value }))}
                                  className="px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                                >
                                  {hospitals.map(hospital => (
                                    <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                                  ))}
                                </select>
                              ) : (
                                fee.hospital?.name || 'N/A'
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {editingFee === fee.id ? (
                                <input
                                  type="text"
                                  value={editForm.department || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                                  className="px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                                  placeholder="Department"
                                />
                              ) : (
                                fee.department || '-'
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {editingFee === fee.id ? (
                                <input
                                  type="text"
                                  value={editForm.treatment || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, treatment: e.target.value }))}
                                  className="px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                                  placeholder="Treatment Name"
                                />
                              ) : (
                                fee.treatment || '-'
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {editingFee === fee.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={editForm.min_price || 0}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, min_price: Number(e.target.value) }))}
                                  className="w-20 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                                />
                                <span>-</span>
                                <input
                                  type="number"
                                  value={editForm.max_price || 0}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, max_price: Number(e.target.value) }))}
                                  className="w-20 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                                />
                              </div>
                            ) : (
                              `${getCurrencySymbol(fee.currency)}${fee.min_price?.toLocaleString()} - ${getCurrencySymbol(fee.currency)}${fee.max_price?.toLocaleString()}`
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingFee === fee.id ? (
                            <select
                              value={editForm.currency || 'USD'}
                              onChange={(e) => setEditForm(prev => ({ ...prev, currency: e.target.value as any }))}
                              className="px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                            >
                              <option value="KRW">KRW</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                            </select>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              {fee.currency}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {editingFee === fee.id ? (
                              <input
                                type="text"
                                value={editForm.duration || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                                className="px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                                placeholder="Duration"
                              />
                            ) : (
                              fee.duration || '-'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingFee === fee.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingFee(null)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditFee(fee)}
                                className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteFee(fee.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredFees.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                    <i className="ri-money-dollar-circle-line text-gray-400 text-2xl"></i>
                  </div>
                  <p className="text-gray-500">No fees found matching your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <AdminBottomNavigation />
      </div>
    </RoleGuard>
  );
}