import React from 'react';
import { getInitials, stringToColorHue } from '../../utils/formatters';

/**
 * Avatar Component
 * Strictly renders clean, styled initials with deterministic color hues.
 * No external image upload or external image URL dependencies.
 */
export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = getInitials(name);
  const hue = stringToColorHue(name);

  // Derive accessible pastel/dark-adapted background and border using HSL
  const style = {
    backgroundColor: `hsl(${hue}, 65%, 45%)`,
    color: '#ffffff'
  };

  return (
    <div
      className={`avatar-circle avatar-${size} ${className}`}
      style={style}
      aria-label={`Avatar for ${name || 'Employee'}`}
      role="img"
    >
      <span className="avatar-initials">{initials}</span>
    </div>
  );
}
