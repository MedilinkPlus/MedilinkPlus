'use client';

import React from 'react';
import AdminForm, { AdminFormField } from './AdminForm';

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: Record<string, any>) => void;
  title: string;
  fields: AdminFormField[];
  initialValues: Record<string, any>;
  loading?: boolean;
  saveText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  title,
  fields,
  initialValues,
  loading = false,
  saveText = '저장',
  size = 'md'
}: EditModalProps) {
  const [values, setValues] = React.useState<Record<string, any>>(initialValues);

  React.useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(values);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full">
              <i className="ri-edit-line text-[#A8E6CF] text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <i className="ri-close-line text-gray-600"></i>
          </button>
        </div>

        {/* 폼 */}
        <div className="p-6">
          <AdminForm
            fields={fields}
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitText={saveText}
            loading={loading}
            gridCols={size === 'sm' ? 1 : size === 'md' ? 2 : 3}
          />
        </div>
      </div>
    </div>
  );
}
