import { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext(null);

function readBooking() {
  try { return JSON.parse(sessionStorage.getItem('tg_booking') || '{}'); }
  catch (e) { return {}; }
}

function readFlag(name) {
  return localStorage.getItem(name) === '1';
}

export function BookingProvider({ children }) {
  const [booking, setBookingState] = useState(readBooking);
  // These two flags are the exact same demo mechanism as the original
  // vanilla build: BREAK_MODE simulates a UI-drift regression, and
  // CHAOS_API_DOWN simulates the flight-status source being unavailable
  // (TruthGuard scenario). Kept in localStorage, not React state alone,
  // so they still survive a hard refresh mid-demo, matching the original.
  const [breakMode, setBreakModeState] = useState(() => readFlag('BREAK_MODE'));
  const [chaosApiDown, setChaosApiDownState] = useState(() => readFlag('CHAOS_API_DOWN'));

  const setBooking = useCallback((patch) => {
    setBookingState(prev => {
      const next = { ...prev, ...patch };
      sessionStorage.setItem('tg_booking', JSON.stringify(next));
      return next;
    });
  }, []);

  const setBreakMode = useCallback((value) => {
    if (value) localStorage.setItem('BREAK_MODE', '1'); else localStorage.removeItem('BREAK_MODE');
    setBreakModeState(value);
  }, []);

  const setChaosApiDown = useCallback((value) => {
    if (value) localStorage.setItem('CHAOS_API_DOWN', '1'); else localStorage.removeItem('CHAOS_API_DOWN');
    setChaosApiDownState(value);
  }, []);

  // Same behaviour as the original confirmButtonLabel(): the accessible
  // name of the confirm control changes under BREAK_MODE, which is the
  // exact UI-drift event the self-healing test suite has to survive.
  const confirmButtonLabel = breakMode ? 'Complete Reservation' : 'Confirm Booking';

  // Same behaviour as the original getFlightStatus(): under chaos, the
  // live source is unavailable and the caller must show UNVERIFIED
  // rather than inventing a status (TruthGuard).
  const getFlightStatus = useCallback((flightId) => {
    if (chaosApiDown) {
      return { ok: false, reason: 'Live flight-status source unavailable' };
    }
    return { ok: true, status: 'CANCELLED', flightId, reason: 'Fog at departure airport' };
  }, [chaosApiDown]);

  const value = {
    booking, setBooking,
    breakMode, setBreakMode,
    chaosApiDown, setChaosApiDown,
    confirmButtonLabel,
    getFlightStatus,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
