import React from 'react';
import { FileText } from 'lucide-react';

interface InvoiceButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function InvoiceButton({ 
  onClick, 
  disabled = false, 
  className = '',
  size = 'md' 
}: InvoiceButtonProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        border border-transparent font-medium rounded-md
        text-white bg-purple-600 hover:bg-purple-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${sizeClasses[size]}
        ${className}
      `}
      title="Generate Invoice"
    >
      <FileText className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} mr-1`} />
      Invoice
    </button>
  );
} 