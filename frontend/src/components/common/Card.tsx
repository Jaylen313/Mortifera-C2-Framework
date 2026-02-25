/**
 * Card Component
 * 
 * Container with consistent styling.
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-dark-100 border border-dark-200 rounded-lg',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}