'use client';

import React from 'react';

export interface AdminFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  className?: string;
  disabled?: boolean;
}

export interface AdminFormProps {
  fields: AdminFormField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  loading?: boolean;
  className?: string;
  gridCols?: 1 | 2 | 3 | 4;
}

export default function AdminForm({
  fields,
  values,
  onChange,
  onSubmit,
  submitText = '저장',
  loading = false,
  className = '',
  gridCols = 2
}: AdminFormProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[gridCols];

  const renderField = (field: AdminFormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: values[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = field.type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : e.target.value;
        onChange(field.name, value);
      },
      placeholder: field.placeholder,
      required: field.required,
      disabled: field.disabled || loading,
      className: `w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20 disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}`
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">선택하세요</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${commonProps.className} resize-none`}
          />
        );

      case 'file':
        return (
          <input
            id={field.name}
            name={field.name}
            type="file"
            onChange={(e) => onChange(field.name, (e.target as HTMLInputElement).files?.[0] || null)}
            disabled={field.disabled || loading}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={values[field.name] || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
              disabled={field.disabled || loading}
              className="w-4 h-4 text-[#A8E6CF] border-gray-300 rounded focus:ring-[#A8E6CF] focus:ring-2"
            />
            <label htmlFor={field.name} className="text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={values[field.name] === option.value}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  disabled={field.disabled || loading}
                  className="w-4 h-4 text-[#A8E6CF] border-gray-300 focus:ring-[#A8E6CF] focus:ring-2"
                />
                <label htmlFor={`${field.name}-${option.value}`} className="text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      <div className={`grid ${gridClass} gap-4`}>
        {fields.map((field) => (
          <div key={field.name} className={field.type === 'checkbox' || field.type === 'radio' ? '' : 'space-y-2'}>
            {field.type !== 'checkbox' && field.type !== 'radio' && (
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {field.validation?.message && (
              <p className="text-sm text-red-600">{field.validation.message}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#A8E6CF] text-white rounded-xl font-medium hover:bg-[#8DD5B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>처리 중...</span>
            </div>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
}
