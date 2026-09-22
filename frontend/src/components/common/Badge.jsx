import React from 'react';
import { getDepartmentStyles } from '../../utils/formatters';

export default function Badge({ children, variant = 'default', department = null, className = '' }) {
  if (department) {
    const deptStyles = getDepartmentStyles(department);
    return (
      <span
        className={`badge badge-department ${className}`}
        style={{
          backgroundColor: deptStyles.bg,
          color: deptStyles.text,
          borderColor: deptStyles.border
        }}
      >
        {children || department}
      </span>
    );
  }

  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
}
