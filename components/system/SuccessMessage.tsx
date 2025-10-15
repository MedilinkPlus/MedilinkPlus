import React from 'react';

interface SuccessMessageProps {
  message: string;
  className?: string;
  showIcon?: boolean;
}

export function SuccessMessage({ message, className = '', showIcon = true }: SuccessMessageProps) {
  return (
    <div className={`bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm ${className}`}>
      <div className="flex items-center">
        {showIcon && (
          <div className="w-5 h-5 flex items-center justify-center mr-3">
            <i className="ri-check-line text-green-500"></i>
          </div>
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}
