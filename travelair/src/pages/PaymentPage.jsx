import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepRail from '../components/StepRail';
import { useBooking } from '../state/BookingContext';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { booking, setBooking, confirmButtonLabel } = useBooking();

  useEffect(() => {
    if (!booking.flight || !booking.passenger) navigate('/select');
  }, [booking.flight, booking.passenger, navigate]);

  if (!booking.flight || !booking.passenger) return null;

  function handleConfirm() {
    setBooking({ confirmedAt: new Date().toISOString() });
    navigate('/confirmation');
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 pb-20">
      <StepRail active={4} />
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Payment</h1>
      <p className="text-muted mb-7">Card details are mocked — no real payment is processed in this demo.</p>

      <Card>
        <div className="flex justify-between py-2 text-sm border-b border-dashed border-border font-mono">
          <span>Flight</span><span>{booking.flight.id} · {booking.flight.depart} → {booking.flight.arrive}</span>
        </div>
        <div className="flex justify-between py-2 text-sm border-b border-dashed border-border font-mono">
          <span>Passenger</span><span>{booking.passenger.name}</span>
        </div>
        <div className="flex justify-between py-2 pt-3 text-sm font-mono font-bold">
          <span>Total</span><span>₹{booking.flight.price.toLocaleString('en-IN')}</span>
        </div>
      </Card>

      <Card>
        <Label htmlFor="cardNumber">Card number</Label>
        <Input type="text" id="cardNumber" defaultValue="4242 4242 4242 4242" />
        <Label htmlFor="expiry">Expiry</Label>
        <Input type="text" id="expiry" defaultValue="12/29" />
        {/* This is the control the self-healing test suite targets. Its
            accessible name flips under BREAK_MODE — same element, different
            label — simulating a UI-drift regression. */}
        <Button onClick={handleConfirm}>{confirmButtonLabel}</Button>
      </Card>
    </div>
  );
}
