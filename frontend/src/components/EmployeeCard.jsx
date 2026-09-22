import React from 'react';

/**
 * EmployeeCard component
 * Used to render employee information on smaller screens or in a responsive card grid.
 * 
 * @param {Object} props
 * @param {Object} props.employee - Employee data object
 * @param {Function} props.onEdit - Callback when Edit is clicked
 * @param {Function} props.onDelete - Callback when Delete is clicked
 */
export default function EmployeeCard({ employee, onEdit, onDelete }) {
  // Helper to extract department name whether it's an object from Prisma or a direct string
  const getDepartmentName = () => {
    if (!employee.department) return 'N/A';
    if (typeof employee.department === 'object' && employee.department.name) {
      return employee.department.name;
    }
    return String(employee.department);
  };

  // Format currency
  const formatSalary = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format creation date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'EM';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <div className="employee-avatar">{getInitials(employee.name)}</div>
        <div className="employee-main-info">
          <h3 className="employee-name">{employee.name}</h3>
          <span className="employee-designation">{employee.designation || 'Staff'}</span>
        </div>
        <span className="badge badge-department">{getDepartmentName()}</span>
      </div>

      <div className="employee-card-body">
        <div className="card-detail-item">
          <span className="detail-label">📧 Email:</span>
          <a href={`mailto:${employee.email}`} className="detail-value text-link">
            {employee.email}
          </a>
        </div>

        <div className="card-detail-item">
          <span className="detail-label">📞 Phone:</span>
          <span className="detail-value">{employee.phone || 'N/A'}</span>
        </div>

        <div className="card-detail-item">
          <span className="detail-label">💰 Salary:</span>
          <span className="detail-value salary-highlight">{formatSalary(employee.salary)}</span>
        </div>

        <div className="card-detail-item">
          <span className="detail-label">📅 Joined:</span>
          <span className="detail-value">{formatDate(employee.createdAt)}</span>
        </div>
      </div>

      <div className="employee-card-actions">
        <button
          type="button"
          className="btn btn-sm btn-edit"
          onClick={() => onEdit(employee)}
          aria-label={`Edit ${employee.name}`}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          className="btn btn-sm btn-delete"
          onClick={() => onDelete(employee)}
          aria-label={`Delete ${employee.name}`}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
