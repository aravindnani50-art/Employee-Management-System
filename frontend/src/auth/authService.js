/**
 * Authentication Service
 * 
 * Manages user session state and validates credentials against exact portal requirements.
 * Valid login credentials:
 *   Email: Sonar@team.com
 *   Password: sonar123
 */

export const SONAR_USER = {
  id: 'usr_sonar_001',
  name: 'Sonar Admin',
  email: 'Sonar@team.com',
  role: 'System Administrator',
  avatarInitials: 'SA',
  department: 'Operations'
};

const AUTH_STORAGE_KEY = 'sonar_ems_auth_session';

/**
 * Perform login against exact Sonar credentials.
 * Rejects any deviation (case-sensitive email matching 'Sonar@team.com' and 'sonar123').
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 * @returns {Promise<Object>} User profile object
 */
export async function login(email, password, rememberMe = true) {
  // Simulate standard network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  const trimmedEmail = String(email || '').trim();
  const trimmedPassword = String(password || '').trim();

  // Exact credentials check:
  // ONLY 'Sonar@team.com' and 'sonar123' are valid.
  if (trimmedEmail === 'Sonar@team.com' && trimmedPassword === 'sonar123') {
    const user = {
      ...SONAR_USER
    };

    const sessionData = {
      token: 'sonar_token_' + Date.now(),
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

  // Reject all other credentials
  throw new Error('Invalid email or password. Please verify your credentials.');
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
