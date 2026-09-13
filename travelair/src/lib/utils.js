import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Standard shadcn/ui convention: merge conditional class names, then
// resolve any conflicting Tailwind utilities (e.g. two different
// padding values) so the last one wins predictably.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
