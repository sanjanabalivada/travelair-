import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepRail from '../components/StepRail';
import { useBooking } from '../state/BookingContext';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function PassengerPage() {
  const navigate = useNavigate();
  const { booking, setBooking } = useBooking();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking.flight) navigate('/select');
  }, [booking.flight, navigate]);

  function handleContinue() {
    const n = name.trim(), e = email.trim(), p = phone.trim();
    if (!n) return setError("Enter the passenger's full name.");
    if (!e || !e.includes('@')) return setError('Enter a valid email address.');
    if (!p) return setError('Enter a phone number.');
    setBooking({ passenger: { name: n, email: e, phone: p } });
    navigate('/payment');
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 pb-20">
      <StepRail active={3} />
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Passenger details</h1>
      <p className="text-muted mb-7">We'll use this to issue your ticket and send updates if your flight changes.</p>

      <Card>
        <Label htmlFor="fullName">Full name (as on ID)</Label>
        <Input
          type="text" id="fullName" placeholder="e.g. Sanjana Rao"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
        />
        <Label htmlFor="email">Email</Label>
        <Input
          type="email" id="email" placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
        />
        <Label htmlFor="phone">Phone</Label>
        <Input
          type="tel" id="phone" placeholder="+91 9XXXXXXXXX"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setError(''); }}
        />
        {error && <p className="text-crimson text-[13px] -mt-2 mb-4">{error}</p>}
        <Button onClick={handleContinue}>Continue to payment</Button>
      </Card>
    </div>
  );
}
