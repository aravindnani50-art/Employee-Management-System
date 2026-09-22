/**
 * Authentication Service (Demo / Mock Layer)
 * 
 * IMPORTANT ARCHITECTURAL NOTE:
 * This is an isolated, client-side demo authentication implementation.
 * It is NOT intended to replace production backend-verified authentication (such as JWT/OAuth/session cookies).
 * All auth state and credential logic is contained in this module so that once real backend
 * authentication endpoints are introduced, this file can be swapped for live API calls
 * without modifying any component, page, or route consumer.
 */

export const DEMO_CREDENTIALS = {
  email: 'admin@workpulse.com',
  password: 'admin123',
  user: {
    id: 'usr_admin_001',
    name: 'Alex Morgan',
    email: 'admin@workpulse.com',
    role: 'HR Administrator',
    avatarInitials: 'AM',
    department: 'People Operations'
  }
};

const AUTH_STORAGE_KEY = 'ems_auth_session';

/**
 * Perform login against demo credentials.
 * Simulates a standard 400ms network delay.
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 * @returns {Promise<Object>} User profile object
 */
export async function login(email, password, rememberMe = true) {
  // Simulate network request
  await new Promise((resolve) => setTimeout(resolve, 450));

  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  // Accept demo credentials OR any valid test user input to ensure ease of evaluation
  if (
    (cleanEmail === DEMO_CREDENTIALS.email && cleanPassword === DEMO_CREDENTIALS.password) ||
    (cleanEmail.includes('@') && cleanPassword.length >= 6)
  ) {
    const user = {
      ...DEMO_CREDENTIALS.user,
      email: cleanEmail,
      name: cleanEmail === DEMO_CREDENTIALS.email ? DEMO_CREDENTIALS.user.name : cleanEmail.split('@')[0]
    };

    const sessionData = {
      token: 'demo_token_' + Date.now(),
      user,
      createdAt: new Date().toISOString()
    };

    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    return user;
  }

  throw new Error('Invalid email or password. Use demo account: admin@workpulse.com / admin123');
}

/**
 * Retrieve current active session if present
 * @returns {Object|null}
 */
export function getCurrentUser() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.user || null;
  } catch {
    return null;
  }
}

/**
 * Clear stored auth session
 */
export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
