import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="portal-layout">
      {/* Dynamic Ambient Background Glow */}
      <div className="portal-ambient-glow" aria-hidden="true">
        <div className="portal-glow-orb orb-1" />
        <div className="portal-glow-orb orb-2" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="portal-main-column">
        <TopBar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />

        <main className="portal-content-body">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="page-motion-wrapper"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
