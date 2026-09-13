// ---------------------------------------------------------------
// TravelGuard demo app — shared state & mock data.
// Two demo toggles live in localStorage so they persist across pages
// and can be flipped live during a demo without a rebuild:
//   BREAK_MODE=1        -> renames "Confirm Booking" to "Complete
//                          Reservation" (simulated UI regression the
//                          self-healing test suite must survive)
//   CHAOS_API_DOWN=1    -> simulated flight-status API outage; the
//                          disruption page must show UNVERIFIED, not
//                          a fabricated status (TruthGuard behaviour)
// ---------------------------------------------------------------

const CITIES = [
  { code: 'BLR', name: 'Bengaluru' },
  { code: 'BOM', name: 'Mumbai' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'GOI', name: 'Goa' },
];

// Flights are keyed by "FROM-TO" so the search page's chosen route
// actually changes what select.html shows, instead of always
// displaying the same fixed BLR->BOM list regardless of input.
const FLIGHTS_BY_ROUTE = {
  'BLR-BOM': [
    { id: 'AI203', from: 'BLR', to: 'BOM', depart: '06:40', arrive: '08:10', price: 4520 },
    { id: '6E512', from: 'BLR', to: 'BOM', depart: '09:15', arrive: '10:45', price: 3890 },
    { id: 'UK955', from: 'BLR', to: 'BOM', depart: '18:05', arrive: '19:35', price: 5210 },
  ],
  'BLR-DEL': [
    { id: 'AI505', from: 'BLR', to: 'DEL', depart: '05:50', arrive: '08:35', price: 6120 },
    { id: '6E204', from: 'BLR', to: 'DEL', depart: '13:10', arrive: '15:55', price: 5480 },
  ],
  'BLR-HYD': [
    { id: '6E769', from: 'BLR', to: 'HYD', depart: '07:20', arrive: '08:35', price: 2890 },
    { id: 'UK823', from: 'BLR', to: 'HYD', depart: '16:45', arrive: '18:00', price: 3150 },
  ],
  'BLR-MAA': [
    { id: 'AI503', from: 'BLR', to: 'MAA', depart: '08:00', arrive: '09:05', price: 2650 },
  ],
  'BLR-GOI': [
    { id: '6E332', from: 'BLR', to: 'GOI', depart: '10:30', arrive: '11:55', price: 3980 },
  ],
  'BOM-DEL': [
    { id: 'AI860', from: 'BOM', to: 'DEL', depart: '06:15', arrive: '08:20', price: 5390 },
  ],
  'DEL-BOM': [
    { id: 'AI861', from: 'DEL', to: 'BOM', depart: '19:00', arrive: '21:10', price: 5590 },
  ],
};

function flightsFor(from, to) {
  return FLIGHTS_BY_ROUTE[`${from}-${to}`] || FLIGHTS_BY_ROUTE['BLR-BOM'];
}

// Backward-compatible default used by disruption.html / confirmation.html
const FLIGHTS = FLIGHTS_BY_ROUTE['BLR-BOM'];

const ALTERNATIVES = [
  { id: 'AI209', from: 'BLR', to: 'BOM', depart: '11:20', arrive: '12:50', price: 4990, seats: 6 },
  { id: '6E518', from: 'BLR', to: 'BOM', depart: '14:00', arrive: '15:30', price: 4310, seats: 2 },
];

function getFlag(name) {
  return localStorage.getItem(name) === '1';
}
function setFlag(name, value) {
  if (value) localStorage.setItem(name, '1');
  else localStorage.removeItem(name);
}

function getBooking() {
  try { return JSON.parse(sessionStorage.getItem('tg_booking') || '{}'); }
  catch (e) { return {}; }
}
function setBooking(patch) {
  const current = getBooking();
  sessionStorage.setItem('tg_booking', JSON.stringify({ ...current, ...patch }));
}

// Renders the shared top bar with the chaos/break toggles.
function renderTopbar() {
  const el = document.getElementById('topbar');
  if (!el) return;
  el.innerHTML = `
    <div class="brand">Travel<span>Guard</span> Air</div>
    <label class="chaos-toggle">
      <input type="checkbox" id="breakModeToggle" ${getFlag('BREAK_MODE') ? 'checked' : ''}>
      Simulate UI regression
    </label>
    <label class="chaos-toggle">
      <input type="checkbox" id="chaosApiToggle" ${getFlag('CHAOS_API_DOWN') ? 'checked' : ''}>
      Simulate flight-status outage
    </label>
  `;
  document.getElementById('breakModeToggle').addEventListener('change', (e) => {
    setFlag('BREAK_MODE', e.target.checked);
  });
  document.getElementById('chaosApiToggle').addEventListener('change', (e) => {
    setFlag('CHAOS_API_DOWN', e.target.checked);
  });
}

// Renders the step rail. `active` is the 1-based index of the current step.
function renderSteps(active) {
  const steps = ['Search', 'Select', 'Passenger', 'Payment', 'Confirmation'];
  const el = document.getElementById('stepRail');
  if (!el) return;
  el.innerHTML = steps.map((label, i) => {
    const n = i + 1;
    const cls = n < active ? 'done' : n === active ? 'active' : '';
    return `<div class="step ${cls}">${label}</div>`;
  }).join('');
}

// The label that should appear on the final confirm button. In BREAK_MODE
// the underlying control's accessible name changes — this is the
// "application changed under the test" event the self-healing suite
// must detect and adapt to, rather than silently failing.
function confirmButtonLabel() {
  return getFlag('BREAK_MODE') ? 'Complete Reservation' : 'Confirm Booking';
}

// Simulated flight-status lookup used on the disruption page. When the
// chaos toggle is on, this represents the live status API being
// unavailable. The caller must surface UNVERIFIED, not invent a status.
function getFlightStatus(flightId) {
  if (getFlag('CHAOS_API_DOWN')) {
    return { ok: false, reason: 'Live flight-status source unavailable' };
  }
  return { ok: true, status: 'CANCELLED', flightId, reason: 'Fog at departure airport' };
}
