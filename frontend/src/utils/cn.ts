/**
 * Class Name Utility
 * 
 * Combines Tailwind classes intelligently.
 * Handles conditional classes and removes duplicates.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}