// Employee Input Validators
// Clean, simple, beginner-friendly validation logic without heavy external libraries.

// Basic RFC 5322 compatible email format regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates employee input data for Create (POST) and Update (PUT)
 * @param {Object} data - Request body containing employee details
 * @param {boolean} isUpdate - True if validating for an update operation
 * @returns {Array<string>} - Array of error messages, empty if valid
 */
const validateEmployeeData = (data, isUpdate = false) => {
  const errors = [];

  // Check if body itself is present
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return ['Request body cannot be empty'];
  }

  const { name, email, phone, departmentId, designation, salary } = data;

  // 1. Name validation
  if (name === undefined || name === null || String(name).trim() === '') {
    errors.push('Employee name is required and cannot be empty');
  } else if (typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Employee name must be at least 2 characters long');
  }

  // 2. Email validation
  if (email === undefined || email === null || String(email).trim() === '') {
    errors.push('Email is required and cannot be empty');
  } else if (!EMAIL_REGEX.test(String(email).trim())) {
    errors.push('Please provide a valid email address (e.g., user@example.com)');
  }

  // 3. Department ID validation
  if (departmentId === undefined || departmentId === null || departmentId === '') {
    errors.push('departmentId is required');
  } else {
    const parsedDeptId = Number(departmentId);
    if (!Number.isInteger(parsedDeptId) || parsedDeptId <= 0) {
      errors.push('departmentId must be a valid positive integer');
    }
  }

  // 4. Designation validation
  if (designation === undefined || designation === null || String(designation).trim() === '') {
    errors.push('Designation is required and cannot be empty');
  } else if (typeof designation !== 'string' || designation.trim().length < 2) {
    errors.push('Designation must be at least 2 characters long');
  }

  // 5. Salary validation
  if (salary === undefined || salary === null || salary === '') {
    errors.push('Salary is required');
  } else {
    const parsedSalary = Number(salary);
    if (isNaN(parsedSalary) || parsedSalary <= 0) {
      errors.push('Salary must be a valid positive number');
    }
  }

  // 6. Optional Phone validation
  if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
    const trimmedPhone = String(phone).trim();
    // Allow digits, spaces, plus sign, and hyphens (min 7, max 15 digits)
    const phoneDigits = trimmedPhone.replace(/[\s+-]/g, '');
    if (!/^\d{7,15}$/.test(phoneDigits)) {
      errors.push('Phone number must contain between 7 and 15 digits');
    }
  }

  return errors;
};

/**
 * Validates a route parameter ID (e.g., :id)
 * @param {string|number} id - ID parameter to validate
 * @returns {number|null} - Parsed positive integer ID, or null if invalid
 */
const parseAndValidateId = (id) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }
  return parsedId;
};

module.exports = {
  validateEmployeeData,
  parseAndValidateId,
};
