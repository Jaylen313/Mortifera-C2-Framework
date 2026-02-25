/**
 * Input Component
 * 
 * Reusable text input with label and error display.
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-700 mb-2">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 bg-dark-100 border rounded-lg text-dark-900',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-dark-200',
            'disabled:bg-dark-50 disabled:text-dark-500 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-dark-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';