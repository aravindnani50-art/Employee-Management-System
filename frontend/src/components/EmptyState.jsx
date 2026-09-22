import React from 'react';
import { motion } from 'framer-motion';
import { FolderSearch } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  message = 'There are no records matching your current filter criteria.',
  icon: CustomIcon = FolderSearch,
  action = null
}) {
  return (
    <motion.div
      className="empty-state-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="empty-state-icon-wrapper" aria-hidden="true">
        <CustomIcon size={44} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </motion.div>
  );
}
