export const CITIES = [
  { code: 'BLR', name: 'Bengaluru' },
  { code: 'BOM', name: 'Mumbai' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'GOI', name: 'Goa' },
];

export const FLIGHTS_BY_ROUTE = {
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

export function flightsFor(from, to) {
  return FLIGHTS_BY_ROUTE[`${from}-${to}`] || FLIGHTS_BY_ROUTE['BLR-BOM'];
}

export const ALTERNATIVES = [
  { id: 'AI209', from: 'BLR', to: 'BOM', depart: '11:20', arrive: '12:50', price: 4990, seats: 6 },
  { id: '6E518', from: 'BLR', to: 'BOM', depart: '14:00', arrive: '15:30', price: 4310, seats: 2 },
];
