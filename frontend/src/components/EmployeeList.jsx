import React from 'react';
import EmployeeCard from './EmployeeCard';

/**
 * EmployeeList component
 * Dynamically renders employee records using .map()
 * Provides a responsive layout: tabular view on desktop and card view on mobile screens.
 * 
 * @param {Object} props
 * @param {Array} props.employees - Array of employee records from the backend API
 * @param {Function} props.onEdit - Edit handler passed to action buttons
 * @param {Function} props.onDelete - Delete handler passed to action buttons
 */
export default function EmployeeList({ employees = [], onEdit, onDelete }) {
  // Helper to extract department name whether it's an object from Prisma relation or string
  const getDepartmentName = (dept) => {
    if (!dept) return 'N/A';
    if (typeof dept === 'object' && dept.name) {
      return dept.name;
    }
    return String(dept);
  };

  // Helper to format currency
  const formatSalary = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper to format date
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

  return (
    <div className="employee-list-wrapper">
      {/* Desktop Table Layout */}
      <div className="table-responsive desktop-only">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Contact</th>
              <th>Salary</th>
              <th>Created Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="employee-row">
                <td className="col-employee">
                  <div className="employee-name-cell">
                    <span className="employee-row-name">{emp.name}</span>
                    <span className="employee-row-email">{emp.email}</span>
                  </div>
                </td>
                <td>
                  <span className="designation-text">{emp.designation || 'Staff'}</span>
                </td>
                <td>
                  <span className="badge badge-department">
                    {getDepartmentName(emp.department)}
                  </span>
                </td>
                <td className="col-phone">
                  <span>{emp.phone || 'N/A'}</span>
                </td>
                <td className="col-salary">
                  <strong>{formatSalary(emp.salary)}</strong>
                </td>
                <td className="col-date">
                  <span>{formatDate(emp.createdAt)}</span>
                </td>
                <td className="col-actions text-right">
                  <div className="action-buttons-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-edit"
                      onClick={() => onEdit(emp)}
                      title={`Edit ${emp.name}`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-delete"
                      onClick={() => onDelete(emp)}
                      title={`Delete ${emp.name}`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid Layout */}
      <div className="card-grid mobile-only">
        {employees.map((emp) => (
          <EmployeeCard
            key={emp.id}
            employee={emp}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
