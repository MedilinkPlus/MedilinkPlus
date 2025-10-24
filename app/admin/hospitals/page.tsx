'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import RoleGuard from '@/components/RoleGuard';
import AdminBottomNavigation from '@/components/AdminBottomNavigation';
import AdminTable, { AdminTableColumn } from '@/components/admin/AdminTable';
import EditModal from '@/components/admin/EditModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import SearchFilter from '@/components/admin/SearchFilter';
import { HospitalService } from '@/services/hospitalService';
import { uploadPublicImage } from '@/services/storageService';

type HospitalRow = {
  id: string
  name: string
  specialty?: string
  address?: string
  phone?: string
  website?: string
  hours?: string
  image_url?: string
  status?: string
  rating?: number
  total_reservations?: number
}

type HospitalForm = Partial<HospitalRow> & {
  name: string
}

export default function AdminHospitalsPage() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<HospitalRow[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editing, setEditing] = useState<HospitalForm | null>(null)
  const [showDelete, setShowDelete] = useState<HospitalRow | null>(null)

  const filtered = useMemo(() => {
    return items
      .filter(h => statusFilter === 'all' ? true : (h.status || 'active') === statusFilter)
      .filter(h => !searchTerm ? true : (h.name?.toLowerCase().includes(searchTerm.toLowerCase()) || (h.specialty || '').toLowerCase().includes(searchTerm.toLowerCase())))
  }, [items, statusFilter, searchTerm])

  const load = async () => {
    setLoading(true)
    try {
      const { hospitals } = await HospitalService.getHospitals(1, 100)
      setItems(hospitals as any)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const columns: AdminTableColumn<HospitalRow>[] = [
    { key: 'image', header: '', render: (h) => h.image_url ? <img src={h.image_url} alt="hospital" className="w-8 h-8 rounded" /> : <div className="w-8 h-8 bg-gray-100 rounded" /> },
    { key: 'name', header: 'Name', render: (h) => <span className="font-medium">{h.name}</span> },
    { key: 'specialty', header: 'Specialty', render: (h) => <span>{h.specialty || '-'}</span> },
    { key: 'phone', header: 'Phone', render: (h) => <span>{h.phone || '-'}</span> },
    { key: 'website', header: 'Website', render: (h) => <span>{h.website || '-'}</span> },
    { key: 'status', header: 'Status', render: (h) => <span className={`text-xs px-2 py-1 rounded ${h.status === 'inactive' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>{h.status || 'active'}</span> },
    { key: 'rating', header: 'Rating', render: (h) => <span>{h.rating ? h.rating.toFixed(1) : '-'}</span> },
  ]

  const filterOptions = [
    {
      name: 'status',
      value: statusFilter,
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      onChange: (v: any) => setStatusFilter(v),
      placeholder: 'Status'
    }
  ]

  const openCreate = () => {
    setEditing({ name: '', specialty: '', address: '', phone: '', website: '', hours: '', status: 'active', image_url: '' })
    setShowEditModal(true)
  }

  const openEdit = (row: HospitalRow) => {
    setEditing({
      id: row.id,
      name: row.name,
      specialty: row.specialty,
      address: row.address,
      phone: row.phone,
      website: row.website,
      hours: row.hours,
      image_url: row.image_url,
      status: row.status as any
    })
    setShowEditModal(true)
  }

  const handleSave = async (values: any) => {
    if (!values.name) throw new Error('Name is required')
    setLoading(true)
    try {
      let imageUrl = values.image_url
      if (values.image_url instanceof File) {
        imageUrl = await uploadPublicImage(values.image_url, 'hospitals')
      }
      if (values.id) {
        const updated = await HospitalService.updateHospital(values.id, {
          name: values.name,
          specialty: values.specialty,
          address: values.address,
          phone: values.phone,
          website: values.website,
          hours: values.hours,
          image_url: imageUrl,
          status: values.status
        } as any) as HospitalRow
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
      } else {
        const created = await HospitalService.createHospital({
          name: values.name,
          specialty: values.specialty,
          address: values.address,
          phone: values.phone,
          website: values.website,
          hours: values.hours,
          image_url: imageUrl,
          status: values.status || 'active'
        } as any) as HospitalRow
        setItems(prev => [created, ...prev])
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
      await HospitalService.deleteHospital(showDelete.id)
      setItems(prev => prev.filter(h => h.id !== showDelete.id))
      setShowDelete(null)
    } finally {
      setLoading(false)
    }
  }

  const editFields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'specialty', label: 'Specialty', type: 'text' },
    { name: 'address', label: 'Address', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'website', label: 'Website', type: 'text' },
    { name: 'hours', label: 'Hours', type: 'text' },
    { name: 'image_url', label: 'Image', type: 'file' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ] }
  ]

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />

        <main className="pt-4">
          <div className="px-4 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Hospitals</h1>
              <p className="text-gray-600 text-sm">Create, edit, and deactivate hospitals</p>
            </div>
            <button onClick={openCreate} className="bg-[#A8E6CF] text-white px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap">
              New Hospital
            </button>
          </div>

          <div className="px-4 mb-4">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search by name or specialty..."
              filters={filterOptions as any}
            />
          </div>

          <div className="px-4">
            <AdminTable
              data={filtered}
              columns={columns}
              loading={loading}
              emptyMessage="No hospitals."
              emptyIcon="ri-hospital-line"
              onRowClick={(row: any) => { setShowDelete(null); openEdit(row); }}
            />
          </div>

          <EditModal
            isOpen={showEditModal}
            onClose={() => { setShowEditModal(false); setEditing(null); }}
            onSave={handleSave}
            title={editing?.id ? 'Edit Hospital' : 'New Hospital'}
            fields={editFields as any}
            initialValues={editing || {}}
            loading={loading}
            saveText="Save"
            size="md"
          />

          <ConfirmModal
            isOpen={!!showDelete}
            onClose={() => setShowDelete(null)}
            onConfirm={handleDelete}
            title="Deactivate Hospital"
            message={`Set "${showDelete?.name}" inactive? It will be hidden from customers.`}
            confirmText="Deactivate"
            cancelText="Cancel"
            type="warning"
            loading={loading}
          />
        </main>

        <AdminBottomNavigation />
      </div>
    </RoleGuard>
  );
}