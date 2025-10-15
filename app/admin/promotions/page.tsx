'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AdminBottomNavigation from '@/components/AdminBottomNavigation';
import RoleGuard from '@/components/RoleGuard';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import { SuccessMessage } from '@/components/system/SuccessMessage';
import { getPromotionsTable, getHospitalsTable } from '@/supabase/supabaseClient';
import type { Tables, Inserts, Updates } from '@/types/supabase';

type PromotionWithHospital = Tables<'promotions'> & { hospital_row?: Tables<'hospitals'> }

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionWithHospital[]>([]);
  const [hospitals, setHospitals] = useState<Tables<'hospitals'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPromotion, setEditingPromotion] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Inserts<'promotions'>>({
    title: '',
    description: '',
    discount: '',
    original_price: '',
    discount_price: '',
    valid_from: '',
    valid_until: '',
    hospital: '',
    used_count: 0
  });
  const [bannerImage, setBannerImage] = useState('');

  useEffect(() => {
    fetchPromotions();
    fetchHospitals();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getPromotionsTable()
        .select(`*`)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPromotions(data || []);
    } catch (err: any) {
      setError('Failed to load promotions.');
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const { data, error: fetchError } = await getHospitalsTable()
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (fetchError) throw fetchError;

      setHospitals(data || []);
    } catch (err: any) {
      console.error('Error fetching hospitals:', err);
    }
  };

  const handleEditPromotion = (promotion: PromotionWithHospital) => {
    setEditingPromotion(promotion.id);
    setEditForm({
      title: promotion.title || '',
      description: promotion.description || '',
      discount: promotion.discount || '',
      original_price: promotion.original_price || '',
      discount_price: promotion.discount_price || '',
      valid_from: promotion.valid_from || '',
      valid_until: promotion.valid_until || '',
      hospital: promotion.hospital || '',
      used_count: promotion.used_count || 0
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPromotion) return;

    try {
      setError(null);
      const res = await fetch('/api/admin/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPromotion,
          title: editForm.title,
          description: editForm.description,
          discount: editForm.discount,
          original_price: editForm.original_price,
          discount_price: editForm.discount_price,
          valid_from: editForm.valid_from,
          valid_until: editForm.valid_until,
          hospital: editForm.hospital,
          used_count: editForm.used_count
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Update failed')

      setSuccessMessage('Promotion updated successfully.');
      setEditingPromotion(null);
      fetchPromotions();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to update promotion.');
      console.error('Error updating promotion:', err);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!window.confirm('Are you sure you want to delete this promotion? This cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      const res = await fetch(`/api/admin/promotions?id=${promotionId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Delete failed')

      setSuccessMessage('Promotion deleted successfully.');
      fetchPromotions();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to delete promotion.');
      console.error('Error deleting promotion:', err);
    }
  };

  const handleAddPromotion = async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          discount: editForm.discount,
          original_price: editForm.original_price,
          discount_price: editForm.discount_price,
          valid_from: editForm.valid_from,
          valid_until: editForm.valid_until,
          hospital: editForm.hospital,
          used_count: editForm.used_count,
          banner_image: bannerImage
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Create failed')

      setSuccessMessage('New promotion added successfully.');
      setEditForm({
        title: '',
        description: '',
        discount: '',
        original_price: '',
        discount_price: '',
        valid_from: '',
        valid_until: '',
        hospital: '',
        used_count: 0
      });
      setBannerImage('');
      fetchPromotions();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to add promotion.');
      console.error('Error adding promotion:', err);
    }
  };

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (promotion.hospital || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                                                   (statusFilter === 'active' && promotion.status === 'active') ||
                          (statusFilter === 'inactive' && promotion.status === 'expired');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600';
  };



  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />
          <main className="pt-4">
            <LoadingSpinner size="lg" text="Loading promotions..." className="py-20" />
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Promotion Management</h1>
            <p className="text-gray-600">Configure and manage discounts and promotions</p>
          </div>

          {error && (
            <div className="px-4 mb-4">
              <ErrorMessage error={error} onRetry={fetchPromotions} />
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
                  <div className="text-2xl font-bold text-[#A8E6CF]">{promotions.length}</div>
                  <div className="text-sm text-gray-600">Total promotions</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FFD3B6]">
                                         {promotions.filter(p => p.status === 'active' && !isExpired(p.valid_until)).length}
                  </div>
                  <div className="text-sm text-gray-600">Active promotions</div>
                </div>
              </div>
            </div>
          </div>

          {/* 새 프로모션 추가 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Promotion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Promotion title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <input
                  type="url"
                  placeholder="Banner image URL"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <select
                  value={editForm.hospital || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, hospital: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                >
                  <option value="">All hospitals</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Discount amount or rate (e.g., 10% or 5000)"
                  value={editForm.discount || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, discount: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <input
                  type="number"
                  placeholder="Original price"
                  value={editForm.original_price || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, original_price: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <input
                  type="number"
                  placeholder="Discounted price"
                  value={editForm.discount_price || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, discount_price: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <input
                  type="date"
                  placeholder="Valid from"
                  value={editForm.valid_from}
                  onChange={(e) => setEditForm(prev => ({ ...prev, valid_from: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <input
                  type="date"
                  placeholder="Valid until"
                  value={editForm.valid_until}
                  onChange={(e) => setEditForm(prev => ({ ...prev, valid_until: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />
                <input
                  type="number"
                  placeholder="Max usage (optional)"
                  value={editForm.used_count || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, used_count: e.target.value ? Number(e.target.value) : 0 }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                />

                <button
                  onClick={handleAddPromotion}
                  disabled={!editForm.title || !editForm.valid_from || !editForm.valid_until}
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
                    placeholder="Search by title, description, or hospital..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* 프로모션 목록 */}
          <div className="px-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promotion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPromotions.map((promotion) => (
                      <tr key={promotion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {editingPromotion === promotion.id ? (
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                  className="px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                                />
                              ) : (
                                promotion.title
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {editingPromotion === promotion.id ? (
                                <input
                                  type="text"
                                  value={editForm.description || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                  className="px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                                  placeholder="Description"
                                />
                              ) : (
                                promotion.description || '-'
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {promotion.hospital_row?.name || '전체 병원'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {editingPromotion === promotion.id ? (
                              <input
                                type="text"
                                value={editForm.discount}
                                onChange={(e) => setEditForm(prev => ({ ...prev, discount: e.target.value }))}
                                className="w-32 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF]"
                                placeholder="할인 정보"
                              />
                            ) : (
                              promotion.discount
                            )}
                          </div>
                          {promotion.used_count > 0 && (
                            <div className="text-xs text-gray-500">
                              Used {promotion.used_count} times
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {editingPromotion === promotion.id ? (
                              <div className="space-y-1">
                                <input
                                  type="date"
                                  value={editForm.valid_from}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, valid_from: e.target.value }))}
                                  className="px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF] text-xs"
                                />
                                <input
                                  type="date"
                                  value={editForm.valid_until}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, valid_until: e.target.value }))}
                                  className="px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#A8E6CF] text-xs"
                                />
                              </div>
                            ) : (
                              <div>
                                <div>{new Date(promotion.valid_from).toLocaleDateString('en-US')}</div>
                                <div className="text-gray-500">~</div>
                                <div>{new Date(promotion.valid_until).toLocaleDateString('en-US')}</div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status === 'active')}`}>
                              {promotion.status === 'active' ? 'Active' : 'Expired'}
                            </span>
                            {isExpired(promotion.valid_until) && (
                              <div className="text-xs text-red-600">만료됨</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingPromotion === promotion.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPromotion(null)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditPromotion(promotion)}
                                className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePromotion(promotion.id)}
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
              
              {filteredPromotions.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                    <i className="ri-gift-line text-gray-400 text-2xl"></i>
                  </div>
                  <p className="text-gray-500">No promotions match the filters.</p>
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