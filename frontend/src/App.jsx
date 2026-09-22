import React from 'react';
import EmployeesPage from './pages/EmployeesPage';

/**
 * App Component
 * Top-level application shell with professional navigation header and container layout.
 */
export default function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="navbar-logo" aria-hidden="true">🏢</span>
            <div className="brand-text">
              <span className="brand-title">WorkPulse EMS</span>
              <span className="brand-subtitle">Employee Management System</span>
            </div>
          </div>

          <div className="navbar-meta">
            <div className="api-badge" title={`API Endpoint: ${apiBaseUrl}`}>
              <span className="status-dot"></span>
              <span className="api-badge-text">REST API Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main View */}
      <main className="main-content">
        <div className="main-wrapper">
          <EmployeesPage />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} Full-Stack Employee Management System | Frontend built with React & native fetch()</p>
        </div>
      </footer>
    </div>
  );
}
