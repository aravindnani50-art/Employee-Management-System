import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Edit2,
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
import { getEmployeeById, updateEmployee } from '../services/employeeApi';
import { getDepartments } from '../services/departmentApi';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialName, setInitialName] = useState('');

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
  const [loadError, setLoadError] = useState(null);

  // Load employee and departments
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setLoadError(null);

      try {
        const [empRes, deptsRes] = await Promise.all([
          getEmployeeById(id),
          getDepartments()
        ]);

        const empData = empRes?.data || empRes;
        if (!empData || !empData.id) {
          throw new Error('Employee record not found.');
        }

        setInitialName(empData.name);
        setFormData({
          name: empData.name || '',
          email: empData.email || '',
          phone: empData.phone || '',
          departmentId: String(empData.departmentId || empData.department?.id || ''),
          designation: empData.designation || '',
          salary: empData.salary !== undefined && empData.salary !== null ? String(empData.salary) : ''
        });

        setDepartments(Array.isArray(deptsRes) ? deptsRes : deptsRes?.data || []);
      } catch (err) {
        setLoadError(err.message || 'Unable to load employee details for editing.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Validation
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
      errs.email = 'Please provide a valid email format.';
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
      await updateEmployee(id, {
        ...formData,
        departmentId: Number(formData.departmentId),
        salary: parseFloat(formData.salary)
      });

      showSuccess(`Employee "${formData.name}" successfully updated.`);
      navigate(`/employees/${id}`);
    } catch (err) {
      setServerError(err.message || 'Failed to update employee details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-page-container">
        <div className="breadcrumb-nav">
          <Skeleton width="180px" height="1.2rem" />
        </div>
        <div className="form-card-container">
          <Skeleton width="100%" height="350px" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="form-page-container">
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/employees" className="breadcrumb-link">
            <ArrowLeft size={16} />
            <span>Back to Directory</span>
          </Link>
        </nav>
        <div className="error-card-container">
          <AlertCircle size={40} className="error-icon text-danger" />
          <h3>Unable to Load Employee</h3>
          <p>{loadError}</p>
          <Link to="/employees" className="btn btn-primary">
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/employees" className="breadcrumb-link">
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link to={`/employees/${id}`} className="breadcrumb-link">
          {initialName}
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Edit Profile</span>
      </nav>

      {/* Main Edit Form Card */}
      <motion.div
        className="form-card-container"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="form-card-header">
          <div className="form-card-icon-badge">
            <Edit2 size={24} className="icon-accent" />
          </div>
          <div>
            <h2 className="form-card-title">Edit Employee Profile</h2>
            <p className="form-card-subtitle">
              Update personnel records for {initialName} (#{id}) in the database.
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
            <Link to={`/employees/${id}`} className="btn btn-secondary">
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
                  <span>Updating Record...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
