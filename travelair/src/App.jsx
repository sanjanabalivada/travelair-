import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookingProvider } from './state/BookingContext';
import TopBar from './components/TopBar';
import SearchPage from './pages/SearchPage';
import SelectPage from './pages/SelectPage';
import PassengerPage from './pages/PassengerPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DisruptionPage from './pages/DisruptionPage';

// Wraps each routed page in a horizontal slide transition. mode="wait" on
// AnimatePresence means the outgoing page fully exits before the next one
// enters, so the "slide through the booking flow" feel reads as one
// continuous motion rather than a flash-cut between pages.
function SlidePage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -48 }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <BookingProvider>
      <TopBar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<SlidePage><SearchPage /></SlidePage>} />
          <Route path="/select" element={<SlidePage><SelectPage /></SlidePage>} />
          <Route path="/passenger" element={<SlidePage><PassengerPage /></SlidePage>} />
          <Route path="/payment" element={<SlidePage><PaymentPage /></SlidePage>} />
          <Route path="/confirmation" element={<SlidePage><ConfirmationPage /></SlidePage>} />
          <Route path="/disruption" element={<SlidePage><DisruptionPage /></SlidePage>} />
        </Routes>
      </AnimatePresence>
    </BookingProvider>
  );
}
