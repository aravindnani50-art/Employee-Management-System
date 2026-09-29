/**
 * Employee API Service Layer
 * Centralizes all REST API calls using native browser fetch().
 * Communicates with the Node.js / Express / Prisma / PostgreSQL backend.
 * Handles HTTP status codes (200, 201, 400, 404, 409, 500) and network failures.
 */

// Retrieve backend API base URL from Vite environment variables with fallback
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

/**
 * Helper to process fetch responses and handle HTTP status codes consistently.
 * Throws readable error messages tailored for junior-level debugging and clean UI feedback.
 */
async function handleResponse(response) {
  // If response is 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text ? { message: text } : null;
    } catch {
      data = null;
    }
  }

  // Handle successful status codes (200 OK, 201 Created)
  if (response.ok) {
    return data;
  }

  // Handle specific HTTP error status codes
  let errorMessage = 'An unexpected error occurred.';

  if (data && data.message) {
    errorMessage = data.message;
  } else if (data && data.error) {
    errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
  } else {
    switch (response.status) {
      case 400:
        errorMessage = 'Invalid request data. Please check your inputs.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 409:
        errorMessage = 'An employee with this email address already exists.';
        break;
      case 500:
        errorMessage = 'Internal server error. Please try again later.';
        break;
      default:
        errorMessage = `Request failed with status ${response.status}.`;
    }
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  error.data = data;
  throw error;
}

/**
 * Helper to catch network-level errors (e.g. backend server is stopped / offline).
 */
function handleNetworkError(err) {
  if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))) {
    throw new Error('Unable to connect to the backend server. Please verify the API is running at ' + API_BASE_URL);
  }
  throw err;
}

/**
 * Fetch a paginated, searchable, filterable, and sortable list of employees.
 * 
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.search=''] - Search term (searches name or email)
 * @param {string|number} [params.department=''] - Filter by department / departmentId
 * @param {string} [params.designation=''] - Filter by designation
 * @param {string} [params.sortBy='name'] - Field to sort by (e.g. 'name', 'salary', 'createdAt')
 * @param {string} [params.sortOrder='asc'] - Sort order ('asc' or 'desc')
 * @returns {Promise<Object>} API response containing data and pagination metadata
 */
export async function getEmployees({
  page = 1,
  limit = 10,
  search = '',
  department = '',
  designation = '',
  sortBy = 'name',
  sortOrder = 'asc'
} = {}) {
  try {
    const query = new URLSearchParams();

    if (page) query.append('page', page);
    if (limit) query.append('limit', limit);
    if (search && search.trim()) query.append('search', search.trim());
    if (department) query.append('department', department);
    if (designation && designation.trim()) query.append('designation', designation.trim());
    if (sortBy) query.append('sortBy', sortBy);
    if (sortOrder) query.append('sortOrder', sortOrder);

    const url = `${API_BASE_URL}/employees?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    return await handleResponse(response);
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Fetch a single employee by their ID.
 * 
 * @param {string|number} id - Employee ID
 * @returns {Promise<Object>} Employee details
 */
export async function getEmployeeById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    return await handleResponse(response);
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Create a new employee record.
 * 
 * @param {Object} employeeData - Employee form details
 * @returns {Promise<Object>} Created employee data
 */
export async function createEmployee(employeeData) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });

    return await handleResponse(response);
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Update an existing employee record.
 * 
 * @param {string|number} id - Employee ID
 * @param {Object} employeeData - Updated employee details
 * @returns {Promise<Object>} Updated employee data
 */
export async function updateEmployee(id, employeeData) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });

    return await handleResponse(response);
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Delete an employee by their ID.
 * 
 * @param {string|number} id - Employee ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteEmployee(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });

    return await handleResponse(response);
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Fetch all departments from the backend.
 * Used to populate the department dropdown in the employee form and filter bar.
 * 
 * @returns {Promise<Array|Object>} List of departments
 */
export async function getDepartments() {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    return await handleResponse(response);
  } catch (err) {
    handleNetworkError(err);
  }
}
