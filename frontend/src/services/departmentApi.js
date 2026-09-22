/**
 * Department API Service Layer
 * Centralizes department data operations communicating with /api/departments.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export async function getDepartments() {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch departments (Status: ${response.status})`);
    }

    const json = await response.json();
    return Array.isArray(json) ? json : json.data || [];
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the backend server. Please verify the API is running at ' + API_BASE_URL);
    }
    throw err;
  }
}
