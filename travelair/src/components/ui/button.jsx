import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Exported separately so react-router's <Link> can use the identical
// visual styling without actually being rendered as a <button> —
// internal navigation should stay real client-side routing, not a
// button pretending to be a link.
export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-sm font-bold text-sm uppercase tracking-wide font-sans transition-colors no-underline ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-crimson text-foreground hover:bg-crimson-dark',
        secondary: 'bg-transparent text-foreground border border-border hover:bg-surface-alt',
        ghost: 'bg-transparent text-foreground hover:bg-surface-alt',
      },
      size: {
        default: 'px-5 py-3',
        sm: 'px-3.5 py-2 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = 'Button';

export { Button };
