'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import RoleGuard from '@/components/RoleGuard';
import AdminBottomNavigation from '@/components/AdminBottomNavigation';
import AdminTable, { AdminTableColumn } from '@/components/admin/AdminTable';
import EditModal from '@/components/admin/EditModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import SearchFilter from '@/components/admin/SearchFilter';
import { FeeService, type Fee } from '@/services/feeService';
import { HospitalService } from '@/services/hospitalService';

export default function AdminPriceComparisonPage() {
  const [loading, setLoading] = useState(false)
  const [fees, setFees] = useState<Fee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [hospitalId, setHospitalId] = useState<string>('all')
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editing, setEditing] = useState<Partial<Fee> | null>(null)
  const [showDelete, setShowDelete] = useState<Fee | null>(null)

  const filtered = useMemo(() => {
    return fees.filter(f =>
      (hospitalId === 'all' ? true : f.hospital_id === hospitalId) &&
      (!searchTerm ? true : ((f.treatment || '').toLowerCase().includes(searchTerm.toLowerCase()) || (f.department || '').toLowerCase().includes(searchTerm.toLowerCase())))
    )
  }, [fees, hospitalId, searchTerm])

  const load = async () => {
    setLoading(true)
    try {
      const [{ hospitals: hospitalRows }, feeRes] = await Promise.all([
        HospitalService.getHospitals(1, 200) as any,
        FeeService.list({ page: 1, limit: 200 })
      ])
      setHospitals((hospitalRows as any[]).map(h => ({ id: h.id, name: h.name })))
      setFees(feeRes.fees)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const columns: AdminTableColumn<Fee>[] = [
    { key: 'treatment', header: 'Treatment', render: (f) => <span className="font-medium">{f.treatment}</span> },
    { key: 'department', header: 'Department', render: (f) => <span>{f.department || '-'}</span> },
    { key: 'hospital_id', header: 'Hospital', render: (f) => <span>{hospitals.find(h => h.id === f.hospital_id)?.name || f.hospital_id}</span> },
    { key: 'min_price', header: 'Min Price', render: (f) => <span>{f.currency} {f.min_price}</span> },
    { key: 'max_price', header: 'Max Price', render: (f) => <span>{f.max_price ? `${f.currency} ${f.max_price}` : '-'}</span> },
    { key: 'duration', header: 'Duration', render: (f) => <span>{f.duration || '-'}</span> },
  ]

  const filterOptions = [
    {
      name: 'hospital',
      value: hospitalId,
      options: [{ value: 'all', label: 'All hospitals' }].concat(hospitals.map(h => ({ value: h.id, label: h.name }))),
      onChange: (v: any) => setHospitalId(v),
      placeholder: 'Hospital'
    }
  ]

  const openCreate = () => {
    setEditing({ hospital_id: '', treatment: '', department: '', min_price: 0, max_price: undefined, currency: 'USD', duration: '' })
    setShowEditModal(true)
  }

  const openEdit = (row: Fee) => {
    setEditing(row)
    setShowEditModal(true)
  }

  const handleSave = async (values: any) => {
    if (!values.hospital_id) throw new Error('Hospital is required')
    if (!values.treatment) throw new Error('Treatment name is required')
    if (!values.currency) throw new Error('Currency is required')
    if (!values.min_price || Number(values.min_price) <= 0) throw new Error('Min price must be greater than 0')

    setLoading(true)
    try {
      if (values.id) {
        const updated = await FeeService.update(values.id, {
          hospital_id: values.hospital_id,
          treatment: values.treatment,
          department: values.department,
          min_price: Number(values.min_price),
          max_price: values.max_price != null ? Number(values.max_price) : null as any,
          currency: values.currency,
          duration: values.duration,
          last_updated: values.last_updated
        })
        setFees(prev => prev.map(f => f.id === updated.id ? updated : f))
      } else {
        const created = await FeeService.create({
          hospital_id: values.hospital_id,
          treatment: values.treatment,
          department: values.department,
          min_price: Number(values.min_price),
          max_price: values.max_price != null ? Number(values.max_price) : undefined,
          currency: values.currency,
          duration: values.duration,
          last_updated: values.last_updated
        })
        setFees(prev => [created, ...prev])
      }
      setShowEditModal(false)
      setEditing(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!showDelete) return
    setLoading(true)
    try {
      await FeeService.delete(showDelete.id)
      setFees(prev => prev.filter(f => f.id !== showDelete.id))
      setShowDelete(null)
    } finally {
      setLoading(false)
    }
  }

  const editFields = [
    { name: 'hospital_id', label: 'Hospital', type: 'select', options: hospitals.map(h => ({ value: h.id, label: h.name })), required: true },
    { name: 'treatment', label: 'Treatment', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'text' },
    { name: 'min_price', label: 'Min Price', type: 'number', required: true },
    { name: 'max_price', label: 'Max Price', type: 'number' },
    { name: 'currency', label: 'Currency', type: 'text', required: true },
    { name: 'duration', label: 'Duration', type: 'text' },
    { name: 'last_updated', label: 'Last Updated', type: 'date' },
  ]

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />

        <main className="pt-4">
          <div className="px-4 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Price Comparison</h1>
              <p className="text-gray-600 text-sm">Manage treatment fees by hospital</p>
            </div>
            <button onClick={openCreate} className="bg-[#A8E6CF] text-white px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap">
              New Fee
            </button>
          </div>

          <div className="px-4 mb-4">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search by treatment or department..."
              filters={filterOptions as any}
            />
          </div>

          <div className="px-4">
            <AdminTable
              data={filtered}
              columns={columns}
              loading={loading}
              emptyMessage="No fees yet."
              emptyIcon="ri-bar-chart-line"
              onRowClick={(row: any) => { setShowDelete(null); openEdit(row); }}
            />
          </div>

          <EditModal
            isOpen={showEditModal}
            onClose={() => { setShowEditModal(false); setEditing(null); }}
            onSave={handleSave}
            title={editing?.id ? 'Edit Fee' : 'New Fee'}
            fields={editFields as any}
            initialValues={editing || {}}
            loading={loading}
            saveText="Save"
            size="lg"
          />

          <ConfirmModal
            isOpen={!!showDelete}
            onClose={() => setShowDelete(null)}
            onConfirm={handleDelete}
            title="Delete Fee"
            message={`Are you sure you want to delete "${showDelete?.treatment}"?`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            loading={loading}
          />
        </main>

        <AdminBottomNavigation />
      </div>
    </RoleGuard>
  );
}









