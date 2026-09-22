import React, { useState, useEffect } from 'react';

/**
 * Reusable EmployeeForm component
 * Supports both creating a new employee and editing an existing employee.
 * Features thorough client-side validation, server-side error display, and submitting state feedback.
 * 
 * @param {Object} props
 * @param {Object|null} props.initialData - If provided, populates form for Edit mode
 * @param {Array} props.departments - List of departments for the dropdown
 * @param {Function} props.onSubmit - Async function to submit the form data
 * @param {Function} props.onCancel - Closes or resets the form modal/panel
 * @param {boolean} props.isSubmitting - Loading state during API submission
 * @param {string|null} props.serverError - Error message returned from the backend (e.g. 409 conflict)
 */
export default function EmployeeForm({
  initialData = null,
  departments = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null
}) {
  const isEditMode = Boolean(initialData && initialData.id);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: '',
    salary: ''
  });

  // Client-side validation errors state
  const [errors, setErrors] = useState({});
  // Track whether the user has attempted to submit
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Pre-populate form fields when in edit mode or when initialData changes
  useEffect(() => {
    if (initialData) {
      // Determine department ID from initialData
      let deptId = '';
      if (initialData.departmentId !== undefined && initialData.departmentId !== null) {
        deptId = String(initialData.departmentId);
      } else if (initialData.department && typeof initialData.department === 'object') {
        deptId = String(initialData.department.id || initialData.department.name || '');
      } else if (initialData.department) {
        deptId = String(initialData.department);
      }

      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        departmentId: deptId,
        designation: initialData.designation || '',
        salary: initialData.salary !== undefined && initialData.salary !== null ? String(initialData.salary) : ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        departmentId: '',
        designation: '',
        salary: ''
      });
    }
    setErrors({});
    setHasSubmitted(false);
  }, [initialData]);

  // Client-side field validation rules
  const validate = (dataToValidate = formData) => {
    const newErrors = {};

    // Name validation: required, at least 2 characters
    if (!dataToValidate.name.trim()) {
      newErrors.name = 'Employee name is required.';
    } else if (dataToValidate.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    // Email validation: required, standard email format regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dataToValidate.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(dataToValidate.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. user@example.com).';
    }

    // Phone validation: optional but if entered, should be valid digits
    if (dataToValidate.phone.trim()) {
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(dataToValidate.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number (e.g. +1-555-0199 or 10 digits).';
      }
    }

    // Department validation: required
    if (!dataToValidate.departmentId || !String(dataToValidate.departmentId).trim()) {
      newErrors.departmentId = 'Department selection is required.';
    }

    // Designation validation: required
    if (!dataToValidate.designation.trim()) {
      newErrors.designation = 'Designation/Job Title is required.';
    }

    // Salary validation: required, valid positive number
    if (dataToValidate.salary === '' || dataToValidate.salary === null) {
      newErrors.salary = 'Salary is required.';
    } else {
      const numSalary = Number(dataToValidate.salary);
      if (isNaN(numSalary)) {
        newErrors.salary = 'Salary must be a valid number.';
      } else if (numSalary <= 0) {
        newErrors.salary = 'Salary must be a positive number greater than 0.';
      }
    }

    return newErrors;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // If user has already tried submitting once, validate interactively
    if (hasSubmitted) {
      setErrors(validate(updatedData));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    // If validation fails, abort submission
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Format payload for backend:
    // Determine selected department object if available to send both departmentId and department name
    const selectedDeptObj = departments.find(
      (d) => String(d.id || d) === String(formData.departmentId)
    );

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      departmentId: isNaN(Number(formData.departmentId)) ? formData.departmentId : Number(formData.departmentId),
      department: selectedDeptObj && selectedDeptObj.name ? selectedDeptObj.name : formData.departmentId,
      designation: formData.designation.trim(),
      salary: parseFloat(formData.salary)
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Edit Employee Record' : 'Add New Employee'}
          </h2>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Server-side error alert (e.g. 409 Duplicate Email or 400 Bad Request) */}
        {serverError && (
          <div className="form-server-error" role="alert">
            <span className="error-badge-icon">⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="employee-form">
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-field full-width">
              <label htmlFor="name" className="form-label">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                autoFocus
              />
              {errors.name && <span className="field-error-msg">{errors.name}</span>}
            </div>

            {/* Email Address */}
            <div className="form-field">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email && <span className="field-error-msg">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-field">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                placeholder="e.g. +1 555-0199"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
            </div>

            {/* Department Dropdown */}
            <div className="form-field">
              <label htmlFor="departmentId" className="form-label">
                Department <span className="required-star">*</span>
              </label>
              <select
                id="departmentId"
                name="departmentId"
                className={`form-select ${errors.departmentId ? 'input-error' : ''}`}
                value={formData.departmentId}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">-- Select Department --</option>
                {departments && departments.length > 0 ? (
                  departments.map((dept) => {
                    const deptId = dept.id !== undefined ? dept.id : dept;
                    const deptName = dept.name || dept;
                    return (
                      <option key={deptId} value={deptId}>
                        {deptName}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Product">Product</option>
                  </>
                )}
              </select>
              {errors.departmentId && (
                <span className="field-error-msg">{errors.departmentId}</span>
              )}
            </div>

            {/* Designation / Job Title */}
            <div className="form-field">
              <label htmlFor="designation" className="form-label">
                Designation <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                className={`form-input ${errors.designation ? 'input-error' : ''}`}
                placeholder="e.g. Senior Software Engineer"
                value={formData.designation}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.designation && (
                <span className="field-error-msg">{errors.designation}</span>
              )}
            </div>

            {/* Annual Salary */}
            <div className="form-field full-width">
              <label htmlFor="salary" className="form-label">
                Annual Salary ($) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                id="salary"
                name="salary"
                min="1"
                step="any"
                className={`form-input ${errors.salary ? 'input-error' : ''}`}
                placeholder="e.g. 75000"
                value={formData.salary}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.salary && <span className="field-error-msg">{errors.salary}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? 'Updating employee...'
                  : 'Creating employee...'
                : isEditMode
                ? 'Save Changes'
                : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
