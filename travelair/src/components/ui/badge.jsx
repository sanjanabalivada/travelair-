import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'rounded-sm px-4 py-3.5 text-sm border border-dashed inline-block',
  {
    variants: {
      variant: {
        warn: 'border-gold bg-gold/10 text-gold',
        danger: 'border-crimson bg-crimson/10 text-crimson',
        ok: 'border-green bg-green/10 text-green',
        info: 'border-teal bg-teal/10 text-teal',
      },
    },
    defaultVariants: { variant: 'info' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), 'banner', className)} {...props} />;
}

export { Badge };
