/**
 * Alert Component
 * 
 * Displays success, error, warning, or info messages.
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export function Alert({ type = 'info', title, message, onClose }: AlertProps) {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500',
    },
  };

  const { container, icon: Icon, iconColor } = styles[type];

  return (
    <div className={cn('border rounded-lg p-4 flex items-start gap-3', container)}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} />
      
      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current hover:opacity-70 transition-opacity"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}