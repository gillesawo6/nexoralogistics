import React from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ClientRoutes } from './client/routes';
import { AdminRoutes } from './admin/routes';
import { ScrollToTop } from './components/common/ScrollToTop';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
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
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
