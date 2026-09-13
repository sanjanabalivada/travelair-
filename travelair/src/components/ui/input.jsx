import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'w-full px-3 py-2.5 border border-border rounded-sm text-[15px] font-mono mb-4 bg-surface-alt text-foreground',
      'placeholder:text-muted',
      'focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
