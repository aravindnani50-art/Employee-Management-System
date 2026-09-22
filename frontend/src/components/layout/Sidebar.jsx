import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Settings,
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import Avatar from '../common/Avatar';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
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
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Sidebar Header / Brand */}
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-brand" onClick={onClose}>
            <div className="brand-icon-box">
              <Building2 size={22} className="brand-svg" />
            </div>
            <div className="brand-text-block">
              <span className="brand-app-name">WorkPulse</span>
              <span className="brand-badge-portal">PORTAL</span>
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
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="nav-item">
                  <NavLink
                    to={item.to}
                    end={item.to === '/employees'}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={19} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Demo Mode Notice */}
        <div className="sidebar-demo-notice">
          <div className="demo-notice-header">
            <ShieldCheck size={14} />
            <span>Demo Auth Active</span>
          </div>
          <p className="demo-notice-text">
            Client-side isolated auth. Ready for backend JWT/OAuth integration.
          </p>
        </div>

        {/* User Profile & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <Avatar name={user?.name || 'Admin'} size="sm" />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name" title={user?.name}>
                {user?.name || 'Administrator'}
              </span>
              <span className="sidebar-user-role" title={user?.role}>
                {user?.role || 'Admin'}
              </span>
            </div>
            <button
              type="button"
              className="btn-sidebar-logout"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign out of application"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
