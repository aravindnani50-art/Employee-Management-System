import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Sun, Moon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import Avatar from '../common/Avatar';

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

  // Check API health on mount
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await fetch(`${apiBaseUrl}/health`, { signal: AbortSignal.timeout(3500) });
        if (res.ok && isMounted) {
          setApiStatus('online');
        } else if (isMounted) {
          setApiStatus('offline');
        }
      } catch {
        if (isMounted) setApiStatus('offline');
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [apiBaseUrl]);

  // Derive dynamic page title and subtitle from pathname
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard') {
      return { title: 'Dashboard', subtitle: 'Overview & workforce analytics' };
    }
    if (path === '/employees') {
      return { title: 'Employees', subtitle: 'Manage organization directory' };
    }
    if (path === '/employees/new') {
      return { title: 'Add Employee', subtitle: 'Create new employee record' };
    }
    if (path.startsWith('/employees/') && path.endsWith('/edit')) {
      return { title: 'Edit Employee', subtitle: 'Update employee details' };
    }
    if (path.startsWith('/employees/')) {
      return { title: 'Employee Profile', subtitle: 'Detailed record view' };
    }
    if (path === '/departments') {
      return { title: 'Departments', subtitle: 'Organization departments & staffing' };
    }
    if (path === '/settings') {
      return { title: 'Settings', subtitle: 'Portal configuration & preferences' };
    }
    return { title: 'WorkPulse Portal', subtitle: 'Employee Management System' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="topbar-title-block">
          <h1 className="topbar-title">{title}</h1>
          <span className="topbar-subtitle">{subtitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* API Health Status Badge */}
        <div
          className={`api-status-badge api-status-${apiStatus}`}
          title={`Backend: ${apiBaseUrl} (${apiStatus})`}
        >
          {apiStatus === 'online' ? (
            <>
              <span className="status-indicator-dot online" />
              <span className="status-badge-text">API Online</span>
            </>
          ) : apiStatus === 'offline' ? (
            <>
              <span className="status-indicator-dot offline" />
              <span className="status-badge-text">API Offline</span>
            </>
          ) : (
            <>
              <span className="status-indicator-dot checking" />
              <span className="status-badge-text">Connecting...</span>
            </>
          )}
        </div>

        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={19} className="theme-icon sun" /> : <Moon size={19} className="theme-icon moon" />}
        </button>

        {/* User Pill / Link to Settings */}
        <Link to="/settings" className="topbar-user-pill" title="View Profile & Settings">
          <Avatar name={user?.name || 'Admin'} size="sm" />
          <span className="topbar-user-name">{user?.name?.split(' ')[0] || 'Admin'}</span>
        </Link>
      </div>
    </header>
  );
}
