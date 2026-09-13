import { useBooking } from '../state/BookingContext';
import { ALTERNATIVES } from '../data/flights';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function DisruptionPage() {
  const { booking, getFlightStatus } = useBooking();
  const flightId = booking.flight ? booking.flight.id : 'AI203';
  const status = getFlightStatus(flightId);

  return (
    <div className="max-w-[720px] mx-auto px-6 pb-20">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Your trip</h1>
      <p className="text-muted mb-7">Live flight status is checked whenever this page loads.</p>

      {!status.ok ? (
        <>
          <Badge variant="danger" className="mb-5 block">
            <strong>Flight status: UNVERIFIED</strong><br />
            {status.reason}. Rebooking is disabled until a trusted status source is available.
          </Badge>
          <Card>
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted mb-3.5">Alternative flights</h2>
            <p className="text-muted">
              No alternative flights are shown while flight status is unverified — offering a
              rebooking option here without a confirmed disruption would risk moving a
              traveler off a flight that is still operating normally.
            </p>
          </Card>
        </>
      ) : (
        <>
          <Badge variant="warn" className="mb-5 block">
            <strong>Flight {status.flightId} is CANCELLED.</strong><br />
            Reason: {status.reason}. We've found alternative flights below.
          </Badge>
          <Card>
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted mb-3.5">Alternative flights</h2>
            {ALTERNATIVES.map(f => (
              <div className="flex justify-between items-center border border-dashed border-border rounded-sm p-4 mb-3 bg-surface" key={f.id}>
                <div>
                  <div className="font-bold font-mono">{f.id} — {f.depart} → {f.arrive}</div>
                  <div className="text-xs text-muted mt-0.5 font-mono">{f.seats} seats left</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg font-mono">₹{f.price.toLocaleString('en-IN')}</div>
                  <Button size="sm" className="mt-2">Rebook this flight</Button>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
