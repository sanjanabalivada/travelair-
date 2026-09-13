import { cn } from '../../lib/utils';

// Ticket-stub card: keeps the boarding-pass notch detail from the
// earlier redesign, just recast as a dark-surface component.
function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative bg-surface border border-border border-l-4 border-l-gold rounded-sm p-6 mb-4",
        "before:content-[''] before:absolute before:w-[18px] before:h-[18px] before:bg-background before:rounded-full before:-left-[13px] before:-top-[9px]",
        "after:content-[''] after:absolute after:w-[18px] after:h-[18px] after:bg-background after:rounded-full after:-left-[13px] after:-bottom-[9px]",
        className
      )}
      {...props}
    />
  );
}

export { Card };
