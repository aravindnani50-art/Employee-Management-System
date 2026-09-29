/**
 * Utility Formatters & Helpers
 * Clean, pure helper functions for currency, dates, initials, and theme colors.
 */

/**
 * Formats a numeric value into standard currency display
 * @param {number|string} amount 
 * @param {string} currency 
 * @returns {string} e.g. "$75,000"
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(amount));
}

/**
 * Formats an ISO date string into a clean readable date
 * @param {string|Date} dateInput 
 * @returns {string} e.g. "Sep 18, 2026"
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '—';
  }
}

/**
 * Extracts 1-2 letter initials from a person's name
 * @param {string} name 
 * @returns {string} e.g. "Sarah Connor" -> "SC", "John" -> "JO"
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'EM';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'EM';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns deterministic color classes/hues based on department or string name
 * Ensures consistent visual branding for departments across tables, cards, and details
 */
export const DEPARTMENT_COLORS = {
  engineering: {
    bg: 'var(--dept-blue-bg)',
    text: 'var(--dept-blue-text)',
    border: 'var(--dept-blue-border)'
  },
  finance: {
    bg: 'var(--dept-green-bg)',
    text: 'var(--dept-green-text)',
    border: 'var(--dept-green-border)'
  },
  marketing: {
    bg: 'var(--dept-purple-bg)',
    text: 'var(--dept-purple-text)',
    border: 'var(--dept-purple-border)'
  },
  'human resources': {
    bg: 'var(--dept-amber-bg)',
    text: 'var(--dept-amber-text)',
    border: 'var(--dept-amber-border)'
  },
  hr: {
    bg: 'var(--dept-amber-bg)',
    text: 'var(--dept-amber-text)',
    border: 'var(--dept-amber-border)'
  },
  operations: {
    bg: 'var(--dept-teal-bg)',
    text: 'var(--dept-teal-text)',
    border: 'var(--dept-teal-border)'
  },
  product: {
    bg: 'var(--dept-indigo-bg)',
    text: 'var(--dept-indigo-text)',
    border: 'var(--dept-indigo-border)'
  },
  sales: {
    bg: 'var(--dept-rose-bg)',
    text: 'var(--dept-rose-text)',
    border: 'var(--dept-rose-border)'
  }
};

export function getDepartmentStyles(departmentName) {
  if (!departmentName) {
    return {
      bg: 'var(--badge-bg)',
      text: 'var(--badge-text)',
      border: 'var(--border-color)'
    };
  }
  const key = String(departmentName).toLowerCase().trim();
  return (
    DEPARTMENT_COLORS[key] || {
      bg: 'var(--badge-bg)',
      text: 'var(--badge-text)',
      border: 'var(--border-color)'
    }
  );
}

/**
 * Returns a stable color hue (0-360) for a given name to style avatar backgrounds
 */
export function stringToColorHue(str) {
  if (!str) return 210;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}
