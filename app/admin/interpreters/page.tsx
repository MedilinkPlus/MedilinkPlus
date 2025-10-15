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

interface InterpreterWithUser extends Tables<'interpreters'> {
  user?: Tables<'users'>;
}

export default function AdminInterpretersPage() {
  const [interpreters, setInterpreters] = useState<InterpreterWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 모달 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingInterpreter, setEditingInterpreter] = useState<InterpreterWithUser | null>(null);
  const [deletingInterpreter, setDeletingInterpreter] = useState<InterpreterWithUser | null>(null);

  useEffect(() => {
    fetchInterpreters();
  }, []);

  const fetchInterpreters = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('interpreters')
        .select(`
          *,
          user (*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setInterpreters(data || []);
    } catch (err: any) {
      setError('통역사 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching interpreters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInterpreter = (interpreter: InterpreterWithUser) => {
    setEditingInterpreter(interpreter);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (values: Record<string, any>) => {
    if (!editingInterpreter) return;

    try {
      setError(null);

      // 통역사 정보 업데이트
      const { error: updateError } = await (supabase as any)
        .from('interpreters')
        .update({
          specializations: values.specializations,
          experience_years: values.experience_years,
          status: values.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingInterpreter.id);

      if (updateError) throw updateError;

      // 사용자 이름 업데이트
      if (editingInterpreter.user_id) {
        const { error: userUpdateError } = await (supabase as any)
          .from('users')
          .update({
            name: values.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingInterpreter.user_id);

        if (userUpdateError) throw userUpdateError;
      }

      setSuccessMessage('통역사 정보가 성공적으로 업데이트되었습니다.');
      setShowEditModal(false);
      setEditingInterpreter(null);
      fetchInterpreters();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('통역사 정보 업데이트에 실패했습니다.');
      console.error('Error updating interpreter:', err);
    }
  };

  const handleDeleteInterpreter = (interpreter: InterpreterWithUser) => {
    setDeletingInterpreter(interpreter);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingInterpreter) return;

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('interpreters')
        .delete()
        .eq('id', deletingInterpreter.id);

      if (deleteError) throw deleteError;

      setSuccessMessage('통역사가 성공적으로 삭제되었습니다.');
      setShowDeleteModal(false);
      setDeletingInterpreter(null);
      fetchInterpreters();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('통역사 삭제에 실패했습니다.');
      console.error('Error deleting interpreter:', err);
    }
  };



  const filteredInterpreters = interpreters.filter(interpreter => {
    const matchesSearch = interpreter.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interpreter.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialization = specializationFilter === 'all' ||
                                  interpreter.specializations?.includes(specializationFilter);
    const matchesStatus = statusFilter === 'all' || interpreter.status === statusFilter;

    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      case 'suspended': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const specializations = Array.from(new Set(
    interpreters.flatMap(i => i.specializations || []).filter(Boolean)
  ));

  // 테이블 컬럼 정의
  const columns: AdminTableColumn<InterpreterWithUser>[] = [
    {
      key: 'interpreter',
      header: '통역사 정보',
      render: (interpreter) => (
        <div className="flex items-center">
          <div className="w-10 h-10 flex items-center justify-center bg-[#E0BBE4]/20 rounded-full mr-3">
            <i className="ri-translate-2 text-[#E0BBE4]"></i>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {interpreter.user?.name || '이름 없음'}
            </div>
            <div className="text-sm text-gray-500">
              {interpreter.user?.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'specializations',
      header: '전문분야',
      render: (interpreter) => (
        <div className="flex flex-wrap gap-1">
          {interpreter.specializations?.map((spec, index) => (
            <span key={index} className="px-2 py-1 bg-[#A8E6CF]/20 text-[#A8E6CF] rounded-full text-xs">
              {spec}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'experience',
      header: '경력',
      render: (interpreter) => (
        <div>
          <div className="text-sm text-gray-900">
            경력: {interpreter.experience_years}년
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: '상태',
      render: (interpreter) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interpreter.status || 'active')}`}>
          {interpreter.status === 'active' ? '활성' :
           interpreter.status === 'inactive' ? '비활성' :
           interpreter.status === 'suspended' ? '정지' : '활성'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '액션',
      render: (interpreter) => (
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => handleEditInterpreter(interpreter)}
            className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors text-xs"
          >
            수정
          </button>
          {interpreter.status !== 'active' && (
            <button
              onClick={async () => {
                try {
                  setError(null)
                  const { error: err1 } = await (supabase as any)
                    .from('interpreters')
                    .update({ status: 'active', updated_at: new Date().toISOString() })
                    .eq('id', interpreter.id)
                  if (err1) throw err1
                  setSuccessMessage('통역사가 승인되었습니다.')
                  fetchInterpreters()
                  setTimeout(() => setSuccessMessage(null), 3000)
                } catch (e: any) {
                  setError('승인 처리에 실패했습니다.')
                }
              }}
              className="text-green-600 hover:text-green-800 transition-colors text-xs"
            >
              승인
            </button>
          )}
          {interpreter.status === 'active' && (
            <button
              onClick={async () => {
                try {
                  setError(null)
                  const { error: err1 } = await (supabase as any)
                    .from('interpreters')
                    .update({ status: 'inactive', updated_at: new Date().toISOString() })
                    .eq('id', interpreter.id)
                  if (err1) throw err1
                  setSuccessMessage('통역사가 비활성화되었습니다.')
                  fetchInterpreters()
                  setTimeout(() => setSuccessMessage(null), 3000)
                } catch (e: any) {
                  setError('비활성화 처리에 실패했습니다.')
                }
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors text-xs"
            >
              비활성화
            </button>
          )}
          <button
            onClick={() => handleDeleteInterpreter(interpreter)}
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
      name: 'name',
      label: '이름',
      type: 'text' as const,
      placeholder: '통역사 이름',
      required: true
    },
    {
      name: 'specializations',
      label: '전문분야',
      type: 'text' as const,
      placeholder: '전문분야를 쉼표로 구분하여 입력하세요',
      required: true
    },
    {
      name: 'experience_years',
      label: '경력 (년)',
      type: 'number' as const,
      placeholder: '경력 연차',
      required: true
    },

    {
      name: 'status',
      label: '상태',
      type: 'select' as const,
      options: [
        { value: 'active', label: '활성' },
        { value: 'inactive', label: '비활성' },
        { value: 'suspended', label: '정지' }
      ],
      required: true
    }
  ];

  // 필터 옵션 정의
  const filterOptions = [
    {
      name: 'specialization',
      value: specializationFilter,
      options: [
        { value: 'all', label: '모든 전문분야' },
        ...specializations.map(spec => ({ value: spec, label: spec }))
      ],
      onChange: setSpecializationFilter,
      placeholder: '전문분야 선택'
    },
    {
      name: 'status',
      value: statusFilter,
      options: [
        { value: 'all', label: '모든 상태' },
        { value: 'active', label: '활성' },
        { value: 'inactive', label: '비활성' },
        { value: 'suspended', label: '정지' }
      ],
      onChange: setStatusFilter,
      placeholder: '상태 선택'
    }
  ];

  if (loading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />
          <main className="pt-4">
            <LoadingSpinner size="lg" text="통역사 목록을 불러오는 중..." className="py-20" />
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">통역사 관리</h1>
            <p className="text-gray-600">등록된 통역사 정보를 관리하고 인증을 처리하세요</p>
          </div>

          {error && (
            <div className="px-4 mb-4">
              <ErrorMessage error={error} onRetry={fetchInterpreters} />
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
                  <div className="text-2xl font-bold text-[#A8E6CF]">{interpreters.length}</div>
                  <div className="text-sm text-gray-600">전체 통역사</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FFD3B6]">
                    {interpreters.filter(i => i.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">활성 통역사</div>
                </div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="px-4 mb-6">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="이름 또는 전문분야로 검색..."
              filters={filterOptions}
            />
          </div>

          {/* 통역사 목록 테이블 */}
          <div className="px-4 mb-8">
            <AdminTable
              data={filteredInterpreters}
              columns={columns}
              loading={loading}
              emptyMessage="검색 조건에 맞는 통역사가 없습니다."
              emptyIcon="ri-translate-2"
            />
          </div>
        </main>
        
        <AdminBottomNavigation />

        {/* 편집 모달 */}
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          title="통역사 정보 수정"
          fields={editFormFields}
          initialValues={{
            name: editingInterpreter?.user?.name || '',
            specializations: editingInterpreter?.specializations?.join(', ') || '',
            experience_years: editingInterpreter?.experience_years || 0,

            status: editingInterpreter?.status || 'active'
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
          title="통역사 삭제"
          message={`정말로 "${deletingInterpreter?.user?.name}" 통역사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          type="danger"
          loading={loading}
        />
      </div>
    </RoleGuard>
  );
}
