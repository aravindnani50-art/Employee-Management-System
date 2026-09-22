import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlus,
  ArrowLeft,
  Check,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  User
} from 'lucide-react';
import { createEmployee } from '../services/employeeApi';
import { getDepartments } from '../services/departmentApi';
import { useToast } from '../context/ToastContext';

export default function AddEmployee() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: '',
    salary: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Load departments
  useEffect(() => {
    async function loadDepts() {
      try {
        const data = await getDepartments();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Could not load departments:', err.message);
      } finally {
        setLoadingDepts(false);
      }
    }
    loadDepts();
  }, []);

  // Validation rules
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email format (e.g. user@company.com).';
    }

    if (formData.phone && formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[\s+-]/g, '');
      if (!/^\d{7,15}$/.test(cleanPhone)) {
        errs.phone = 'Phone number must contain between 7 and 15 digits.';
      }
    }

    if (!formData.departmentId) {
      errs.departmentId = 'Please select an organizational department.';
    }

    if (!formData.designation.trim()) {
      errs.designation = 'Job title / designation is required.';
    } else if (formData.designation.trim().length < 2) {
      errs.designation = 'Designation must be at least 2 characters.';
    }

    if (!formData.salary || String(formData.salary).trim() === '') {
      errs.salary = 'Annual compensation is required.';
    } else {
      const num = Number(formData.salary);
      if (isNaN(num) || num <= 0) {
        errs.salary = 'Salary must be a positive number.';
      }
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await createEmployee({
        ...formData,
        departmentId: Number(formData.departmentId),
        salary: parseFloat(formData.salary)
      });

      showSuccess(`Employee "${formData.name}" successfully created.`);
      navigate('/employees');
    } catch (err) {
      setServerError(err.message || 'Failed to create employee record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/employees" className="breadcrumb-link">
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Add New Employee</span>
      </nav>

      {/* Main Form Card */}
      <motion.div
        className="form-card-container"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="form-card-header">
          <div className="form-card-icon-badge">
            <UserPlus size={24} className="icon-accent" />
          </div>
          <div>
            <h2 className="form-card-title">New Employee Registration</h2>
            <p className="form-card-subtitle">
              Enter personnel information to register a new employee into the PostgreSQL database.
            </p>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle size={18} className="auth-error-icon" />
            <span className="auth-error-text">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="employee-entry-form" noValidate>
          <div className="form-grid-layout">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name <span className="req-star">*</span>
              </label>
              <div className={`input-icon-wrapper ${errors.name ? 'input-has-error' : ''}`}>
                <User size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Maya Chen"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.name && <span className="field-error-msg">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Work Email <span className="req-star">*</span>
              </label>
              <div className={`input-icon-wrapper ${errors.email ? 'input-has-error' : ''}`}>
                <Mail size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="e.g. maya.chen@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.email && <span className="field-error-msg">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="opt-label">(Optional)</span>
              </label>
              <div className={`input-icon-wrapper ${errors.phone ? 'input-has-error' : ''}`}>
                <Phone size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
            </div>

            {/* Department */}
            <div className="form-group">
              <label htmlFor="departmentId" className="form-label">
                Department <span className="req-star">*</span>
              </label>
              <div className={`input-icon-wrapper select-wrapper ${errors.departmentId ? 'input-has-error' : ''}`}>
                <Building2 size={18} className="field-icon" aria-hidden="true" />
                <select
                  id="departmentId"
                  name="departmentId"
                  className="form-control"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={loadingDepts}
                  required
                >
                  <option value="">Select a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.departmentId && <span className="field-error-msg">{errors.departmentId}</span>}
            </div>

            {/* Designation */}
            <div className="form-group">
              <label htmlFor="designation" className="form-label">
                Job Title / Designation <span className="req-star">*</span>
              </label>
              <div className={`input-icon-wrapper ${errors.designation ? 'input-has-error' : ''}`}>
                <Briefcase size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.designation && <span className="field-error-msg">{errors.designation}</span>}
            </div>

            {/* Salary */}
            <div className="form-group">
              <label htmlFor="salary" className="form-label">
                Annual Salary ($) <span className="req-star">*</span>
              </label>
              <div className={`input-icon-wrapper ${errors.salary ? 'input-has-error' : ''}`}>
                <DollarSign size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  step="1000"
                  min="1"
                  className="form-control"
                  placeholder="e.g. 85000"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.salary && <span className="field-error-msg">{errors.salary}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions-footer">
            <Link to="/employees" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true"></span>
                  <span>Saving Employee...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Create Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
