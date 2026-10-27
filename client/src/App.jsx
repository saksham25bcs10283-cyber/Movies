import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { RegionProvider } from './context/RegionContext';
import { WatchlistProvider } from './context/WatchlistContext';

import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import StartupAnimation from './components/StartupAnimation';

import HomePage from './pages/HomePage';
import ChartsPage from './pages/ChartsPage';
import DetailPage from './pages/DetailPage';
import PeoplePage from './pages/PeoplePage';
import PersonDetailPage from './pages/PersonDetailPage';
import SearchPage from './pages/SearchPage';
import MyCinemaPage from './pages/MyCinemaPage';
import GatherPage from './pages/GatherPage';

/**
 * Ensures refreshing any nested route returns the user cleanly to /,
 * while normal in-app link navigation continues to work smoothly.
 */
function RefreshToHomeHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasCheckedRef = React.useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    try {
      const navEntries = performance.getEntriesByType('navigation');
      const isReload =
        (navEntries && navEntries[0] && navEntries[0].type === 'reload') ||
        (window.performance && window.performance.navigation && window.performance.navigation.type === 1);

      if (isReload && location.pathname !== '/') {
        navigate('/', { replace: true });
      }

      const handleBeforeUnload = () => {
        sessionStorage.setItem('af_was_reloaded', 'true');
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    } catch {
      // Graceful fallback
    }
  }, []); // Run ONLY once on initial mount

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default function App() {
  const [splashFinished, setSplashFinished] = React.useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <RegionProvider>
          <WatchlistProvider>
            {!splashFinished && (
              <StartupAnimation onComplete={() => setSplashFinished(true)} />
            )}
            <BrowserRouter>
              <RefreshToHomeHandler />
              <ScrollToTop />
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <div style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/charts" element={<ChartsPage />} />
                    <Route path="/movie/:id" element={<DetailPage />} />
                    <Route path="/tv/:id" element={<DetailPage />} />
                    <Route path="/people" element={<PeoplePage />} />
                    <Route path="/person/:id" element={<PersonDetailPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/my-cinema" element={<MyCinemaPage />} />
                    <Route path="/gather" element={<GatherPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
                <Footer />
                <AuthModal />
              </div>
            </BrowserRouter>
          </WatchlistProvider>
        </RegionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
