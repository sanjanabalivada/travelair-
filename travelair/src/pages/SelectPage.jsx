import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepRail from '../components/StepRail';
import { CITIES, flightsFor } from '../data/flights';
import { useBooking } from '../state/BookingContext';
import { Button } from '../components/ui/button';

export default function SelectPage() {
  const navigate = useNavigate();
  const { booking, setBooking } = useBooking();
  const route = booking.route || { from: 'BLR', to: 'BOM' };
  const flights = flightsFor(route.from, route.to);
  const cityName = (code) => (CITIES.find(c => c.code === code) || { name: code }).name;

  useEffect(() => {
    if (!booking.route) setBooking({ route });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-[720px] mx-auto px-6 pb-20">
      <StepRail active={2} />
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">{cityName(route.from)} → {cityName(route.to)}</h1>
      <p className="text-muted mb-7">{flights.length} flight{flights.length === 1 ? '' : 's'} found for 12 Sep 2026.</p>

      <div>
        {flights.map(f => (
          <div className="flex justify-between items-center border border-dashed border-border rounded-sm p-4 mb-3 bg-surface" key={f.id}>
            <div>
              <div className="font-bold font-mono">{f.id} — {f.depart} → {f.arrive}</div>
              <div className="text-xs text-muted mt-0.5 font-mono">{f.from} to {f.to} · Non-stop</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg font-mono">₹{f.price.toLocaleString('en-IN')}</div>
              <Button
                variant="secondary" size="sm" className="mt-2"
                onClick={() => { setBooking({ flight: f }); navigate('/passenger'); }}
              >
                Select
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
