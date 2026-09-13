import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepRail from '../components/StepRail';
import { CITIES } from '../data/flights';
import { useBooking } from '../state/BookingContext';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function SearchPage() {
  const navigate = useNavigate();
  const { setBooking } = useBooking();
  const [from, setFrom] = useState('BLR');
  const [to, setTo] = useState('BOM');

  function handleSearch() {
    if (from === to) {
      alert("Origin and destination can't be the same city.");
      return;
    }
    setBooking({ route: { from, to } });
    navigate('/select');
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 pb-20">
      <StepRail active={1} />
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Where are you flying?</h1>
      <p className="text-muted mb-7 max-w-[60ch]">
        Search live availability. This is a demo booking flow used to exercise
        TravelBud's autonomous QA loop — not a real reservation system.
      </p>

      <Card>
        <Label htmlFor="from">From</Label>
        <select
          id="from"
          className="w-full px-3 py-2.5 border border-border rounded-sm text-[15px] font-mono mb-4 bg-surface-alt text-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background"
          value={from} onChange={(e) => setFrom(e.target.value)}
        >
          {CITIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
        </select>
        <Label htmlFor="to">To</Label>
        <select
          id="to"
          className="w-full px-3 py-2.5 border border-border rounded-sm text-[15px] font-mono mb-4 bg-surface-alt text-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background"
          value={to} onChange={(e) => setTo(e.target.value)}
        >
          {CITIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
        </select>
        <Label htmlFor="date">Departure date</Label>
        <Input type="date" id="date" defaultValue="2026-09-12" />
        <Button onClick={handleSearch}>Search flights</Button>
      </Card>

      <footer className="mt-10 text-xs text-muted font-mono">TravelBud — demo data only. No live fares are queried.</footer>
    </div>
  );
}
