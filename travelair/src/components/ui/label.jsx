import { forwardRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../lib/utils';

const Label = forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-muted font-mono',
      className
    )}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
