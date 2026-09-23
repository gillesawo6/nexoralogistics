import React from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { ClientRoutes } from './client/routes';
import { AdminRoutes } from './admin/routes';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <LanguageProvider>
              <Router>
                {/* Global centralized scroll position reset on all route changes */}
                <ScrollToTop />

                <Routes>
                  {/* Admin Routes Group: /admin/* (Protected by Firebase Auth) */}
                  {AdminRoutes}

                  {/* Client Routes Group: /* (Public without login requirement) */}
                  {ClientRoutes}
                </Routes>
              </Router>
            </LanguageProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

