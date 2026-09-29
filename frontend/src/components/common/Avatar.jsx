import React from 'react';
import EmployeeAvatar from './EmployeeAvatar';

/**
 * Avatar Component
 * Backwards-compatible wrapper delegating to EmployeeAvatar.
 * Supports passing either `name` string or `employee` object.
 */
export default function Avatar({ name = '', employee = null, size = 'md', className = '', ...rest }) {
  if (employee) {
    return <EmployeeAvatar employee={employee} size={size} className={className} {...rest} />;
  }
  return <EmployeeAvatar name={name} size={size} className={className} {...rest} />;
}

export { EmployeeAvatar };
