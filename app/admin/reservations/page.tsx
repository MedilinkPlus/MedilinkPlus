'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AdminBottomNavigation from '@/components/AdminBottomNavigation';
import RoleGuard from '@/components/RoleGuard';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import { SuccessMessage } from '@/components/system/SuccessMessage';
import AdminTable, { AdminTableColumn } from '@/components/admin/AdminTable';
import SearchFilter from '@/components/admin/SearchFilter';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EditModal from '@/components/admin/EditModal';
import { supabase } from '@/supabase/supabaseClient';
import type { Tables } from '@/types/supabase';

interface ReservationWithDetails extends Tables<'reservations'> {
  users?: Tables<'users'>;
  hospital?: Tables<'hospitals'>;
  interpreter?: Tables<'interpreters'> & {
    users?: Tables<'users'>;
  };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // 모달 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<ReservationWithDetails | null>(null);
  const [deletingReservation, setDeletingReservation] = useState<ReservationWithDetails | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select(`
          *,
          users!patient_id (*),
          hospitals!hospital_id (*),
          interpreters!interpreter_id (
            *,
            users (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setReservations(data || []);
    } catch (err: any) {
      setError('예약 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReservation = (reservation: ReservationWithDetails) => {
    setEditingReservation(reservation);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (values: Record<string, any>) => {
    if (!editingReservation) return;

    try {
      setError(null);
      const { error: updateError } = await (supabase as any)
        .from('reservations')
        .update({
          status: values.status,
          notes: values.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingReservation.id);

      if (updateError) throw updateError;

      setSuccessMessage('예약 정보가 성공적으로 업데이트되었습니다.');
      setShowEditModal(false);
      setEditingReservation(null);
      fetchReservations();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('예약 정보 업데이트에 실패했습니다.');
      console.error('Error updating reservation:', err);
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      setError(null);
      const { error: updateError } = await (supabase as any)
        .from('reservations')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId);

      if (updateError) throw updateError;

      setSuccessMessage('예약 상태가 성공적으로 변경되었습니다.');
      fetchReservations();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('예약 상태 변경에 실패했습니다.');
      console.error('Error updating reservation status:', err);
    }
  };

  const handleDeleteReservation = (reservation: ReservationWithDetails) => {
    setDeletingReservation(reservation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingReservation) return;

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('reservations')
        .delete()
        .eq('id', deletingReservation.id);

      if (deleteError) throw deleteError;

      setSuccessMessage('예약이 성공적으로 삭제되었습니다.');
      setShowDeleteModal(false);
      setDeletingReservation(null);
      fetchReservations();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('예약 삭제에 실패했습니다.');
      console.error('Error deleting reservation:', err);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.hospital?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = new Date(reservation.date).toDateString() === new Date().toDateString();
    } else if (dateFilter === 'week') {
      const reservationDate = new Date(reservation.date);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = reservationDate >= weekAgo && reservationDate <= today;
    } else if (dateFilter === 'month') {
      const reservationDate = new Date(reservation.date);
      const today = new Date();
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      matchesDate = reservationDate >= monthAgo && reservationDate <= today;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'confirmed': return 'bg-blue-100 text-blue-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'confirmed': return '확정';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const calculateStats = () => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const completed = reservations.filter(r => r.status === 'completed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;

    // 이번 달 예약 수
    const now = new Date();
    const thisMonth = reservations.filter(r => {
      const reservationDate = new Date(r.date);
      return reservationDate.getMonth() === now.getMonth() &&
             reservationDate.getFullYear() === now.getFullYear();
    }).length;

    return { total, pending, confirmed, completed, cancelled, thisMonth };
  };

  const stats = calculateStats();

  // 테이블 컬럼 정의
  const columns: AdminTableColumn<ReservationWithDetails>[] = [
    {
      key: 'reservation',
      header: '예약 정보',
      render: (reservation) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {reservation.treatment}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(reservation.date).toLocaleDateString('ko-KR')} {reservation.time}
          </div>
          <div className="text-xs text-gray-400">
            예약 ID: {reservation.id.slice(0, 8)}...
          </div>
        </div>
      )
    },
    {
      key: 'patient_hospital',
      header: '환자/병원',
      render: (reservation) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {reservation.users?.name || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {reservation.hospital?.name || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'interpreter',
      header: '통역사',
      render: (reservation) => (
        <div>
          <div className="text-sm text-gray-900">
            {reservation.interpreter?.users?.name || '미배정'}
          </div>
          {reservation.interpreter && (
            <div className="text-xs text-gray-500">
              {reservation.interpreter.specializations?.join(', ')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: '상태',
      render: (reservation) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
          {getStatusText(reservation.status)}
        </span>
      )
    },
    {
      key: 'actions',
      header: '액션',
      render: (reservation) => (
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => handleEditReservation(reservation)}
            className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors text-xs"
          >
            수정
          </button>
          <button
            onClick={() => handleStatusChange(reservation.id, 'confirmed')}
            disabled={reservation.status === 'confirmed'}
            className="text-blue-600 hover:text-blue-800 transition-colors text-xs disabled:opacity-50"
          >
            확정
          </button>
          <button
            onClick={() => handleStatusChange(reservation.id, 'completed')}
            disabled={reservation.status === 'completed'}
            className="text-green-600 hover:text-green-800 transition-colors text-xs disabled:opacity-50"
          >
            완료
          </button>
          <button
            onClick={() => handleDeleteReservation(reservation)}
            className="text-red-600 hover:text-red-800 transition-colors text-xs"
          >
            삭제
          </button>
        </div>
      )
    }
  ];

  // 편집 폼 필드 정의
  const editFormFields = [
    {
      name: 'status',
      label: '상태',
      type: 'select' as const,
      options: [
        { value: 'pending', label: '대기중' },
        { value: 'confirmed', label: '확정' },
        { value: 'completed', label: '완료' },
        { value: 'cancelled', label: '취소' }
      ],
      required: true
    },
    {
      name: 'notes',
      label: '메모',
      type: 'textarea' as const,
      placeholder: '예약에 대한 메모를 입력하세요',
      required: false
    }
  ];

  // 필터 옵션 정의
  const filterOptions = [
    {
      name: 'status',
      value: statusFilter,
      options: [
        { value: 'all', label: '모든 상태' },
        { value: 'pending', label: '대기중' },
        { value: 'confirmed', label: '확정' },
        { value: 'completed', label: '완료' },
        { value: 'cancelled', label: '취소' }
      ],
      onChange: setStatusFilter,
      placeholder: '상태 선택'
    },
    {
      name: 'date',
      value: dateFilter,
      options: [
        { value: 'all', label: '모든 기간' },
        { value: 'today', label: '오늘' },
        { value: 'week', label: '이번 주' },
        { value: 'month', label: '이번 달' }
      ],
      onChange: setDateFilter,
      placeholder: '기간 선택'
    }
  ];

  if (loading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />
          <main className="pt-4">
            <LoadingSpinner size="lg" text="예약 목록을 불러오는 중..." className="py-20" />
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">예약 관리</h1>
            <p className="text-gray-600">전체 예약 현황을 모니터링하고 관리하세요</p>
          </div>

          {error && (
            <div className="px-4 mb-4">
              <ErrorMessage error={error} onRetry={fetchReservations} />
            </div>
          )}

          {successMessage && (
            <div className="px-4 mb-4">
              <SuccessMessage message={successMessage} />
            </div>
          )}

          {/* 통계 카드 */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#A8E6CF]">{stats.total}</div>
                  <div className="text-sm text-gray-600">전체 예약</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FFD3B6]">{stats.thisMonth}</div>
                  <div className="text-sm text-gray-600">이번 달</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E0BBE4]">{stats.pending}</div>
                  <div className="text-sm text-gray-600">대기중</div>
                </div>
              </div>
            </div>
          </div>

          {/* 상태별 요약 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">예약 상태 요약</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">대기중</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                  <div className="text-sm text-gray-600">확정</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-gray-600">완료</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                  <div className="text-sm text-gray-600">취소</div>
                </div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="px-4 mb-6">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="진료명, 환자명, 병원명으로 검색..."
              filters={filterOptions}
            />
          </div>

          {/* 예약 목록 테이블 */}
          <div className="px-4 mb-8">
            <AdminTable
              data={filteredReservations}
              columns={columns}
              loading={loading}
              emptyMessage="검색 조건에 맞는 예약이 없습니다."
              emptyIcon="ri-calendar-line"
            />
          </div>
        </main>
        
        <AdminBottomNavigation />

        {/* 편집 모달 */}
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          title="예약 정보 수정"
          fields={editFormFields}
          initialValues={{
            status: editingReservation?.status || 'pending',
            notes: editingReservation?.notes || ''
          }}
          loading={loading}
          saveText="저장"
          size="md"
        />

        {/* 삭제 확인 모달 */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="예약 삭제"
          message={`정말로 이 예약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          type="danger"
          loading={loading}
        />
      </div>
    </RoleGuard>
  );
}