import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/employees/new', label: 'Add Employee', icon: UserPlus },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-backdrop"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}
        aria-label="Main Navigation"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Sidebar Header / Brand */}
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-brand" onClick={onClose}>
            <motion.div
              className="brand-icon-box"
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.35 }}
            >
              <Building2 size={22} className="brand-svg" />
            </motion.div>
            <div className="brand-text-block">
              <span className="brand-app-name">SONAR</span>
              <span className="brand-badge-portal">EMS</span>
            </div>
          </NavLink>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN NAVIGATION</div>
          <ul className="nav-list">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.to}
                  className="nav-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.035, duration: 0.2 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/employees'}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                    onClick={onClose}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-active-pill"
                            className="nav-active-pill"
                            transition={{
                              type: 'spring',
                              stiffness: 380,
                              damping: 32
                            }}
                          />
                        )}
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
                          transition={{ duration: 0.25 }}
                          style={{ display: 'inline-flex' }}
                        >
                          <Icon size={19} className="nav-icon" />
                        </motion.div>
                        <span className="nav-label">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Direct Logout Action */}
        <div className="sidebar-footer">
          <motion.button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.97 }}
            title="Log out of application"
            aria-label="Log out of application"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
              className="sidebar-logout-icon-wrap"
            >
              <LogOut size={18} className="sidebar-logout-icon" />
            </motion.div>
            <span className="sidebar-logout-label">Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
