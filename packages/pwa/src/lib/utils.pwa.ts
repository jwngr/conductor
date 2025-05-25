import {clsx} from 'clsx';
import type {ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Helper function to merge class names.
 *
 * Usage: cn('h-[60px]', isMobile && 'border-b', `px-${isMobile ? 2 : 4}`)
 */
export function cn(...inputs: readonly ClassValue[]): string {
  return twMerge(clsx(inputs));
}
