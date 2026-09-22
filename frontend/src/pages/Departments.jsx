import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  ArrowRight,
  UserPlus,
  Briefcase
} from 'lucide-react';
import { getDepartments } from '../services/departmentApi';
import { getEmployees } from '../services/employeeApi';
import Badge from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [deptsRes, empRes] = await Promise.all([
        getDepartments(),
        getEmployees({ limit: 100 })
      ]);

      const depts = Array.isArray(deptsRes) ? deptsRes : deptsRes?.data || [];
      const empList = Array.isArray(empRes) ? empRes : empRes?.data || [];
      const total = empRes?.pagination?.total !== undefined ? empRes.pagination.total : empList.length;

      // Calculate count per department
      const counts = {};
      empList.forEach((emp) => {
        const dId = emp.departmentId || emp.department?.id;
        if (dId) {
          counts[dId] = (counts[dId] || 0) + 1;
        }
      });

      const formatted = depts.map((d) => {
        const count = counts[d.id] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          ...d,
          count,
          percentage
        };
      });

      setDepartments(formatted);
      setTotalEmployees(total);
    } catch (err) {
      setError(err.message || 'Failed to load department records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="departments-page-container">
      {/* Header */}
      <div className="directory-header-row">
        <div>
          <h2 className="directory-heading">Organizational Departments</h2>
          <p className="directory-subheading">
            Overview of company business units and staffing distributions
          </p>
        </div>
        <div className="directory-actions-row">
          <Link to="/employees/new" className="btn btn-primary">
            <UserPlus size={16} />
            <span>Assign New Employee</span>
          </Link>
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="departments-grid">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.id}
              className="department-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <div className="dept-card-header">
                <div className="dept-card-icon-box">
                  <Building2 size={22} className="dept-icon" />
                </div>
                <Badge department={dept.name}>{dept.name}</Badge>
              </div>

              <div className="dept-card-body">
                <h3 className="dept-card-name">{dept.name}</h3>
                <div className="dept-count-badge">
                  <Users size={16} className="text-muted" />
                  <span className="dept-count-num">{dept.count}</span>
                  <span className="dept-count-text">
                    {dept.count === 1 ? 'Employee' : 'Employees'}
                  </span>
                </div>

                {/* Progress ratio */}
                <div className="dept-progress-block">
                  <div className="dept-progress-label">
                    <span>Workforce share</span>
                    <strong>{dept.percentage}%</strong>
                  </div>
                  <div className="dept-progress-bar">
                    <div
                      className="dept-progress-fill"
                      style={{ width: `${Math.max(4, dept.percentage)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="dept-card-footer">
                <Link
                  to={`/employees?department=${dept.id}`}
                  className="dept-link-btn"
                >
                  <span>View Department Employees</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
