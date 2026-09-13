const STEPS = ['Search', 'Select', 'Passenger', 'Payment', 'Confirmation'];

export default function StepRail({ active }) {
  return (
    <div className="flex items-stretch my-7 mb-9 bg-surface border border-border">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const base = "flex-1 text-center font-mono text-[11px] uppercase tracking-wider py-3 px-1 border-r border-dashed border-border last:border-r-0";
        const state =
          n < active ? "bg-surface-alt text-teal"
          : n === active ? "bg-background text-gold font-bold"
          : "text-muted";
        return <div key={label} className={`${base} ${state}`}>{label}</div>;
      })}
    </div>
  );
}
