import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  Hash,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getEmployeeById, deleteEmployee } from '../services/employeeApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadEmployee() {
      setLoading(true);
      setError(null);
      try {
        const res = await getEmployeeById(id);
        const empData = res?.data || res;
        if (!empData || !empData.id) {
          throw new Error('Employee record not found.');
        }
        setEmployee(empData);
      } catch (err) {
        setError(err.message || 'Unable to fetch employee details.');
      } finally {
        setLoading(false);
      }
    }
    loadEmployee();
  }, [id]);

  const handleDelete = async () => {
    if (!employee) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(employee.id);
      showSuccess(`Employee "${employee.name}" deleted successfully.`);
      navigate('/employees');
    } catch (err) {
      showError(err.message || 'Failed to delete employee.');
    } finally {
      setIsDeleting(false);
      setIsDeletingModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="breadcrumb-nav">
          <Skeleton width="180px" height="1.2rem" />
        </div>
        <div className="profile-hero-card">
          <Skeleton width="80px" height="80px" borderRadius="50%" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skeleton width="40%" height="2rem" />
            <Skeleton width="25%" height="1.2rem" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="profile-page-container">
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/employees" className="breadcrumb-link">
            <ArrowLeft size={16} />
            <span>Back to Directory</span>
          </Link>
        </nav>
        <div className="error-card-container">
          <AlertCircle size={40} className="error-icon text-danger" />
          <h3>Employee Not Found</h3>
          <p>{error || 'The requested employee ID does not exist in the database.'}</p>
          <Link to="/employees" className="btn btn-primary">
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/employees" className="breadcrumb-link">
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{employee.name}</span>
      </nav>

      {/* Hero Profile Header */}
      <motion.div
        className="profile-hero-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="hero-left-section">
          <Avatar name={employee.name} size="xl" />
          <div className="hero-text-block">
            <div className="hero-name-row">
              <h2 className="hero-emp-name">{employee.name}</h2>
              <Badge department={employee.department?.name}>
                {employee.department?.name || 'General'}
              </Badge>
              <span className="badge badge-active">Active</span>
            </div>
            <p className="hero-emp-designation">{employee.designation}</p>
            <span className="hero-emp-id">Employee ID: #{employee.id}</span>
          </div>
        </div>

        <div className="hero-actions-section">
          <Link
            to={`/employees/${employee.id}/edit`}
            className="btn btn-secondary"
          >
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setIsDeletingModalOpen(true)}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </motion.div>

      {/* Information Cards Grid */}
      <div className="profile-grid">
        {/* Contact Information */}
        <div className="profile-section-card">
          <h3 className="section-card-title">Contact Information</h3>
          <div className="info-rows-list">
            <div className="info-row">
              <div className="info-icon-box">
                <Mail size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Email Address</span>
                <a href={`mailto:${employee.email}`} className="info-value link">
                  {employee.email}
                </a>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon-box">
                <Phone size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Phone Number</span>
                <span className="info-value">
                  {employee.phone || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Employment & Compensation */}
        <div className="profile-section-card">
          <h3 className="section-card-title">Employment & Role</h3>
          <div className="info-rows-list">
            <div className="info-row">
              <div className="info-icon-box">
                <Building2 size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Department</span>
                <span className="info-value">
                  {employee.department?.name || 'General Department'}
                </span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon-box">
                <Briefcase size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Designation</span>
                <span className="info-value">{employee.designation}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon-box">
                <DollarSign size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Annual Compensation</span>
                <span className="info-value highlight-salary">
                  {formatCurrency(employee.salary)} / year
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata & Audit */}
        <div className="profile-section-card">
          <h3 className="section-card-title">System Information</h3>
          <div className="info-rows-list">
            <div className="info-row">
              <div className="info-icon-box">
                <Hash size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Database Record ID</span>
                <span className="info-value code-font">#{employee.id}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon-box">
                <Calendar size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Joined / Created On</span>
                <span className="info-value">{formatDate(employee.createdAt)}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon-box">
                <ShieldCheck size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Verification Status</span>
                <span className="info-value text-success">Verified Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeletingModalOpen}
        title="Confirm Employee Deletion"
        message={`Are you sure you want to delete ${employee.name}? This will permanently remove their record from the PostgreSQL database.`}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeletingModalOpen(false)}
      />
    </div>
  );
}
