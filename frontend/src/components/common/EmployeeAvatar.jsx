import React, { useState, useEffect } from 'react';
import { getInitials, stringToColorHue } from '../../utils/formatters';

/**
 * EmployeeAvatar Component
 * 
 * Displays an employee profile photo when an image URL is available (via `employee.imageUrl`,
 * `avatarUrl`, or `src`).
 * 
 * If no image is provided, or if the image fails to load (404, invalid URL, network error),
 * it seamlessly falls back to a clean, styled initials-based avatar with deterministic color hues.
 * 
 * Renders the image directly with object-fit: cover and circular border radius.
 * Prevents broken image icons or phantom fallback locks from ever occurring in the UI.
 * 
 * @param {Object} props
 * @param {Object} [props.employee] - Employee object containing id, name, email, imageUrl
 * @param {string} [props.src] - Explicit image source override
 * @param {string} [props.name] - Fallback name if employee object is omitted
 * @param {number|string} [props.id] - Fallback employee ID if employee object is omitted
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Function} [props.onImageLoad] - Callback fired when image successfully loads
 * @param {Function} [props.onImageError] - Callback fired when image fails to load
 * @param {Function} [props.onClick] - Click handler for interactive avatars
 */
export default function EmployeeAvatar({
  employee,
  src: propSrc,
  name: propName,
  id: propId,
  size = 'md',
  className = '',
  onImageLoad,
  onImageError,
  onClick,
  ...rest
}) {
  const name = employee?.name || propName || 'Employee';
  const explicitUrl = propSrc || employee?.imageUrl || employee?.avatarUrl || employee?.image || employee?.photo;

  // Use explicit URL if provided and non-empty; otherwise null
  const imageSource = (explicitUrl && typeof explicitUrl === 'string' && explicitUrl.trim() !== '')
    ? explicitUrl.trim()
    : null;

  const [hasError, setHasError] = useState(false);

  // Reset error state if imageSource changes
  useEffect(() => {
    setHasError(false);
  }, [imageSource]);

  const handleLoad = (e) => {
    if (onImageLoad) onImageLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onImageError) onImageError(e);
  };

  const initials = getInitials(name);
  const hue = stringToColorHue(name);

  const initialsStyle = {
    backgroundColor: `hsl(${hue}, 65%, 45%)`,
    color: '#ffffff'
  };

  const showImage = Boolean(imageSource && !hasError);

  return (
    <div
      className={`avatar-circle avatar-${size} ${onClick ? 'avatar-interactive' : ''} ${className}`}
      style={!showImage ? initialsStyle : undefined}
      aria-label={`Avatar for ${name}`}
      role={onClick ? 'button' : 'img'}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
      {...rest}
    >
      {showImage ? (
        <img
          src={imageSource}
          alt={`${name}'s profile photo`}
          className="avatar-image"
          onLoad={handleLoad}
          onError={handleError}
          loading="eager"
        />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
    </div>
  );
}
