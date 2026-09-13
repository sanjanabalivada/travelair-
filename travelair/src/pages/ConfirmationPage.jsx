import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StepRail from '../components/StepRail';
import { useBooking } from '../state/BookingContext';
import { Card } from '../components/ui/card';
import { buttonVariants } from '../components/ui/button';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { booking } = useBooking();

  useEffect(() => {
    if (!booking.confirmedAt) navigate('/select');
  }, [booking.confirmedAt, navigate]);

  if (!booking.confirmedAt) return null;

  return (
    <div className="max-w-[720px] mx-auto px-6 pb-20">
      <StepRail active={5} />
      <div
        id="confirmBanner"
        className="inline-block border-[3px] border-green text-green font-mono font-bold uppercase tracking-widest px-4.5 py-2.5 -rotate-3 rounded-sm mb-5"
      >
        Booking confirmed
      </div>
      <Card>
        <div className="flex justify-between py-2 text-sm border-b border-dashed border-border font-mono">
          <span>Flight</span><span>{booking.flight.id} · {booking.flight.depart} → {booking.flight.arrive}</span>
        </div>
        <div className="flex justify-between py-2 text-sm border-b border-dashed border-border font-mono">
          <span>Passenger</span><span>{booking.passenger.name}</span>
        </div>
        <div className="flex justify-between py-2 pt-3 text-sm font-mono font-bold">
          <span>Confirmed</span><span>{new Date(booking.confirmedAt).toLocaleString()}</span>
        </div>
      </Card>
      {/* Real client-side navigation via Link, styled identically to the
          Button component via the shared buttonVariants function. */}
      <Link className={buttonVariants({ variant: 'secondary' })} to="/disruption">
        Simulate a disruption for this trip →
      </Link>
    </div>
  );
}
