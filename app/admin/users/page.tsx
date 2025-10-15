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

interface UserWithProfile extends Tables<'users'> {
  auth_user?: {
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prefer server list (Auth Admin) so newly created auth users appear immediately
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch users');
      setUsers(json.users || []);
    } catch (err: any) {
      setError('Failed to load users.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values?: Record<string, any>) => {
    try {
      setCreating(true);
      setError(null);
      const payload = values && Object.keys(values).length ? values : createForm;

      const name = (payload.name || '').trim();
      const email = (payload.email || '').trim();
      const password = (payload.password || '').trim();
      const role = (payload.role || '').trim();
      if (!name || !email || !password || !role) {
        throw new Error('Please fill in name, email, password, and role.');
      }

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create user');
      setSuccessMessage('User has been created successfully.');
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = (user: UserWithProfile) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (values: Record<string, any>) => {
    if (!editingUser) return;

    try {
      setError(null);
      
      // Update via admin API (bypass RLS, sync Auth metadata and profile)
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: values.name,
          role: values.role
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update user')

      setSuccessMessage('User updated successfully.');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to update user.');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = (user: UserWithProfile) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const toggleUserStatus = async (user: UserWithProfile) => {
    try {
      setError(null);
      const nextStatus = (user as any).status === 'active' ? 'inactive' : 'active';
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: nextStatus })
      })
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update status');
      setSuccessMessage(`User ${nextStatus}.`);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      setError('Failed to update status.');
    }
  };

  const approveInterpreter = async (user: UserWithProfile) => {
    try {
      setError(null);
      const res = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      })
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to approve user');
      setSuccessMessage('Interpreter approved.');
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      setError('Failed to approve interpreter.');
    }
  };

  const resendConfirmation = async (user: UserWithProfile) => {
    try {
      setError(null);
      const res = await fetch('/api/admin/users/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      })
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to resend confirmation');
      setSuccessMessage('Confirmation email re-sent.');
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      setError('Failed to resend confirmation email.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setError(null);
      const res = await fetch(`/api/admin/users/delete?id=${deletingUser.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete user')

      setSuccessMessage('User deleted successfully.');
      setShowDeleteModal(false);
      setDeletingUser(null);
      fetchUsers();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to delete user.');
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || ((user as any).status || 'active') === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-600';
      case 'interpreter': return 'bg-[#FFD3B6] text-[#FF8A65]';
      default: return 'bg-green-100 text-green-600';
    }
  };



  // table columns
  const columns: AdminTableColumn<UserWithProfile>[] = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center">
          <div className="w-10 h-10 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full mr-3">
            <i className="ri-user-line text-[#A8E6CF]"></i>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {user.role === 'admin' ? 'Admin' : 
           user.role === 'interpreter' ? 'Interpreter' : 'User'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          ((user as any).status || 'active') === 'active' ? 'bg-green-100 text-green-600' :
          ((user as any).status || 'active') === 'pending' ? 'bg-yellow-100 text-yellow-600' :
          ((user as any).status || 'active') === 'rejected' ? 'bg-red-100 text-red-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {(((user as any).status || 'active') as string).charAt(0).toUpperCase() + (((user as any).status || 'active') as string).slice(1)}
        </span>
      )
    },

    {
      key: 'created_at',
      header: 'Joined',
      render: (user) => (
        <span className="text-sm text-gray-500">
          {new Date(user.created_at).toLocaleDateString('en-US')}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditUser(user)}
            className="text-[#A8E6CF] hover:text-[#8DD5B8] transition-colors text-sm"
          >
            Edit
          </button>
          {user.role === 'interpreter' && ((user as any).status || 'active') === 'pending' && (
            <button
              onClick={() => approveInterpreter(user)}
              className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
            >
              Approve
            </button>
          )}
          {((user as any).status || 'active') !== 'active' && (
            <button
              onClick={() => resendConfirmation(user)}
              className="text-purple-600 hover:text-purple-800 transition-colors text-sm"
            >
              Resend Confirmation
            </button>
          )}
          <button
            onClick={() => toggleUserStatus(user)}
            className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
          >
            {((user as any).status || 'active') === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleDeleteUser(user)}
            className="text-red-600 hover:text-red-800 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  // edit form fields
  const editFormFields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text' as const,
      placeholder: 'User name',
      required: true
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select' as const,
      options: [
        { value: 'user', label: 'User' },
        { value: 'interpreter', label: 'Interpreter' },
        { value: 'admin', label: 'Admin' }
      ],
      required: true
    }
  ];

  // filter options
  const filterOptions = [
    {
      name: 'role',
      value: roleFilter,
      options: [
        { value: 'all', label: 'All roles' },
        { value: 'user', label: 'User' },
        { value: 'interpreter', label: 'Interpreter' },
        { value: 'admin', label: 'Admin' }
      ],
      onChange: setRoleFilter,
      placeholder: 'Select role'
    },
    {
      name: 'status',
      value: statusFilter,
      options: [
        { value: 'all', label: 'All status' },
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'rejected', label: 'Rejected' }
      ],
      onChange: setStatusFilter,
      placeholder: 'Select status'
    },

  ];

  if (loading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />
          <main className="pt-4">
            <LoadingSpinner size="lg" text="Loading users..." className="py-20" />
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">User Management</h1>
            <p className="text-gray-600">Manage accounts and permissions</p>
          </div>

          {error && (
            <div className="px-4 mb-4">
              <ErrorMessage error={error} onRetry={fetchUsers} />
            </div>
          )}

          {successMessage && (
            <div className="px-4 mb-4">
              <SuccessMessage message={successMessage} />
            </div>
          )}

          {/* stats cards */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#A8E6CF]">{users.length}</div>
                  <div className="text-sm text-gray-600">Total users</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FFD3B6]">
                    {users.filter(u => u.role === 'interpreter').length}
                  </div>
                  <div className="text-sm text-gray-600">Interpreters</div>
                </div>
              </div>
            </div>
          </div>

          {/* search and filter */}
          <div className="px-4 mb-6">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search by name or email..."
              filters={filterOptions}
            />
          </div>

          {/* 상단 액션 + 사용자 목록 테이블 */}
          <div className="px-4 mb-8">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#A8E6CF] text-white px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap"
              >
                Create User
              </button>
            </div>
            <AdminTable
              data={filteredUsers}
              columns={columns}
              loading={loading}
              emptyMessage="No users match the filters."
              emptyIcon="ri-user-line"
            />
          </div>
        </main>
        
        <AdminBottomNavigation />

        {/* edit modal */}
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          title="Edit User"
          fields={editFormFields}
          initialValues={{
            name: editingUser?.name || '',
            role: editingUser?.role || 'user'
          }}
          loading={loading}
          saveText="Save"
          size="md"
        />

        {/* create modal */}
        <EditModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateUser}
          title="Create User"
          fields={[
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true },
            { name: 'role', label: 'Role', type: 'select', options: [
              { value: 'user', label: 'User' },
              { value: 'interpreter', label: 'Interpreter' },
              { value: 'admin', label: 'Admin' }
            ], required: true }
          ] as any}
          initialValues={createForm as any}
          loading={creating}
          saveText="Create"
          size="md"
        />

        {/* delete confirm modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete User"
          message={`Are you sure you want to delete "${deletingUser?.name}"? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          loading={loading}
        />
      </div>
    </RoleGuard>
  );
}