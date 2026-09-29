import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
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
  AlertCircle,
  ZoomIn
} from 'lucide-react';
import { getEmployeeById, deleteEmployee } from '../services/employeeApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import EmployeeAvatar from '../components/common/EmployeeAvatar';
import ImagePreviewModal from '../components/common/ImagePreviewModal';
import Badge from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import {
  gsap,
  useGsapContext,
  animateSplitHeading,
  scrambleElementText,
  initCard3DTilt,
  initScrollReveal
} from '../animations/gsapUtils';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.from || '/employees';
  const { showSuccess, showError } = useToast();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile image modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const detailsContainerRef = useRef(null);
  const nameRef = useRef(null);
  const roleRef = useRef(null);
  const idRef = useRef(null);

  useGsapContext(detailsContainerRef, ({ q }) => {
    if (!employee) return;
    if (nameRef.current) {
      animateSplitHeading(nameRef.current, { delay: 0.15, duration: 0.7 });
    }
    if (roleRef.current) {
      scrambleElementText(roleRef.current, employee.designation || 'Staff Member', { delay: 0.25, duration: 0.85 });
    }
    if (idRef.current) {
      scrambleElementText(idRef.current, `Employee ID: #${employee.id}`, { delay: 0.35, duration: 0.75 });
    }
    const heroCard = q('.profile-hero-card');
    if (heroCard[0]) {
      initCard3DTilt(heroCard[0], { maxTilt: 5, scale: 1.01 });
    }
    const cards = q('.profile-section-card, .system-spec-card');
    cards.forEach((c) => {
      initCard3DTilt(c, { maxTilt: 6, scale: 1.015 });
    });
    initScrollReveal(cards, { stagger: 0.08, y: 25 });
  }, [employee?.id]);

  const hasImage = Boolean(employee?.imageUrl && String(employee.imageUrl).trim() !== '');
  const canPreviewImage = hasImage && !imageError;

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
    <div className="profile-page-container" ref={detailsContainerRef}>
      {/* Breadcrumbs */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <button
          type="button"
          onClick={() => {
            if (location.state?.from) {
              navigate(location.state.from);
            } else if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/employees');
            }
          }}
          className="breadcrumb-link"
          title="Back to previous page"
        >
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>
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
          <motion.div
            className={`hero-avatar-preview-wrap ${canPreviewImage ? 'can-preview' : ''}`}
            onClick={canPreviewImage ? () => setIsPreviewOpen(true) : undefined}
            title={canPreviewImage ? 'Click to view full photo' : undefined}
            role={canPreviewImage ? 'button' : undefined}
            tabIndex={canPreviewImage ? 0 : undefined}
            whileHover={canPreviewImage ? { scale: 1.05 } : {}}
            whileTap={canPreviewImage ? { scale: 0.97 } : {}}
            onKeyDown={canPreviewImage ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsPreviewOpen(true);
              }
            } : undefined}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sonar-avatar-beacon-wrap">
              <EmployeeAvatar
                employee={employee}
                size="xl"
                className="profile-hero-avatar"
                onImageLoad={() => setImageError(false)}
                onImageError={() => setImageError(true)}
              />
              <span className="sonar-avatar-beacon-ring" />
            </div>
            {canPreviewImage && (
              <div className="hero-avatar-zoom-badge" aria-hidden="true">
                <ZoomIn size={14} />
              </div>
            )}
          </motion.div>
          <div className="hero-text-block">
            <div className="hero-name-row">
              <motion.h2
                ref={nameRef}
                className="hero-emp-name"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {employee.name}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.16, duration: 0.2 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Badge department={employee.department?.name}>
                  {employee.department?.name || 'General'}
                </Badge>
                <span className="badge badge-active">Active</span>
              </motion.div>
            </div>
            <motion.p
              ref={roleRef}
              className="hero-emp-designation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              {employee.designation}
            </motion.p>
            <motion.span
              ref={idRef}
              className="hero-emp-id"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.2 }}
            >
              Employee ID: #{employee.id}
            </motion.span>
          </div>
        </div>

        <motion.div
          className="hero-actions-section"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.34, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={`/employees/${employee.id}/edit`}
              state={{ from: returnUrl }}
              className="btn btn-secondary"
            >
              <Edit2 size={16} />
              <span>Edit Profile</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setIsDeletingModalOpen(true)}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Information Cards Grid */}
      <div className="profile-grid">
        {/* Contact Information */}
        <motion.div
          className="profile-section-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.div>

        {/* Employment & Compensation */}
        <motion.div
          className="profile-section-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.div>

        {/* Metadata & Audit */}
        <motion.div
          className="profile-section-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.div>
      </div>

      {/* Profile Photo Lightbox Modal */}
      {canPreviewImage && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          imageUrl={employee.imageUrl}
          employeeName={employee.name}
          employeeTitle={employee.designation || employee.department?.name}
          employee={employee}
        />
      )}

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
