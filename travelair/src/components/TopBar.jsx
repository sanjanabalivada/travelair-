import { useBooking } from '../state/BookingContext';

export default function TopBar() {
  const { breakMode, setBreakMode, chaosApiDown, setChaosApiDown } = useBooking();

  return (
    <div className="bg-surface text-foreground px-6 py-4.5 flex items-center justify-between border-b-4 border-gold flex-wrap gap-2.5">
      <div className="font-mono font-bold text-lg tracking-wide uppercase">
        Travel<span className="text-gold">Bud</span>
      </div>
      <label className="text-xs font-mono text-muted flex items-center gap-1.5">
        <input
          type="checkbox"
          className="accent-crimson"
          checked={breakMode}
          onChange={(e) => setBreakMode(e.target.checked)}
        />
        Simulate UI regression
      </label>
      <label className="text-xs font-mono text-muted flex items-center gap-1.5">
        <input
          type="checkbox"
          className="accent-crimson"
          checked={chaosApiDown}
          onChange={(e) => setChaosApiDown(e.target.checked)}
        />
        Simulate flight-status outage
      </label>
    </div>
  );
}
