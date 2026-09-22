import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, LayoutDashboard, Users, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="not-found-viewport">
      <motion.div
        className="not-found-card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="not-found-icon-box">
          <FileQuestion size={48} className="not-found-icon" />
        </div>
        <span className="not-found-code">404</span>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          The page or resource you requested does not exist or has been relocated within the portal.
        </p>

        <div className="not-found-actions">
          <Link to="/dashboard" className="btn btn-primary">
            <LayoutDashboard size={16} />
            <span>Go to Dashboard</span>
          </Link>
          <Link to="/employees" className="btn btn-secondary">
            <Users size={16} />
            <span>Employee Directory</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
