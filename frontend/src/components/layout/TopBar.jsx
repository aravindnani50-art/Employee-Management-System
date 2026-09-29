import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Sun, Moon, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import EmployeeAvatar from '../common/EmployeeAvatar';
import ThemeCustomizerModal from '../common/ThemeCustomizerModal';

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

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
    return { title: 'SONAR EMS', subtitle: 'Internal Employee Management Portal' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <motion.button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenuClick}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="topbar-title-block"
          >
            <h1 className="topbar-title">{title}</h1>
            <span className="topbar-subtitle">{subtitle}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="topbar-right">
        {/* API Health Status Badge */}
        <motion.div
          className={`api-status-badge api-status-${apiStatus}`}
          whileHover={{ scale: 1.04 }}
          title={`Backend: ${apiBaseUrl} (${apiStatus})`}
        >
          {apiStatus === 'online' ? (
            <>
              <motion.span
                className="status-indicator-dot online"
                animate={{ scale: [1, 1.25, 1], opacity: [1, 0.75, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
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
        </motion.div>

        {/* Dark / Light Mode Toggle Button with 3D Flip */}
        <motion.button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          whileHover={{ scale: 1.1, rotate: isDark ? 15 : -15 }}
          whileTap={{ scale: 0.9 }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDark ? 'dark' : 'light'}
              initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <Sun size={19} className="theme-icon sun" /> : <Moon size={19} className="theme-icon moon" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Theme & Typography Customizer Button */}
        <motion.button
          type="button"
          className="theme-toggle-btn"
          onClick={() => setIsCustomizerOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Customize Theme & Font Styles"
          aria-label="Customize Theme & Font Styles"
        >
          <Palette size={18} className="theme-icon" />
        </motion.button>

        {/* User Pill / Link to Settings */}
        <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}>
          <Link to="/settings" className="topbar-user-pill" title="View Profile & Settings">
            <EmployeeAvatar employee={user} name={user?.name || 'Sonar Admin'} size="sm" />
            <span className="topbar-user-name">{user?.name?.split(' ')[0] || 'Admin'}</span>
          </Link>
        </motion.div>
      </div>

      {/* Quick Theme & Typography Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </header>
  );
}
