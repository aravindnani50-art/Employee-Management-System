import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  DollarSign,
  Briefcase,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getEmployees, getDepartments } from '../services/employeeApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    averageSalary: 0,
    totalRoles: 0
  });

  const [recentEmployees, setRecentEmployees] = useState([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch departments
      const deptsRes = await getDepartments();
      const depts = Array.isArray(deptsRes)
        ? deptsRes
        : deptsRes?.data && Array.isArray(deptsRes.data)
        ? deptsRes.data
        : [];

      // 2. Fetch sample employees slice to calculate statistics & department breakdown
      const empRes = await getEmployees({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
      const empList = Array.isArray(empRes)
        ? empRes
        : empRes?.data && Array.isArray(empRes.data)
        ? empRes.data
        : [];

      const totalEmpCount = empRes?.pagination?.total !== undefined ? empRes.pagination.total : empList.length;

      // Compute Average Salary
      const totalSalary = empList.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0);
      const avgSalary = empList.length > 0 ? Math.round(totalSalary / empList.length) : 0;

      // Compute unique designations
      const uniqueRoles = new Set(empList.map((e) => (e.designation || '').trim().toLowerCase()).filter(Boolean)).size;

      // Compute distribution per department
      const deptCounts = {};
      empList.forEach((emp) => {
        const deptName = emp.department?.name || 'Unassigned';
        deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
      });

      const breakdown = depts.map((d) => {
        const count = deptCounts[d.name] || 0;
        const percentage = totalEmpCount > 0 ? Math.round((count / totalEmpCount) * 100) : 0;
        return {
          id: d.id,
          name: d.name,
          count,
          percentage
        };
      }).sort((a, b) => b.count - a.count);

      setStats({
        totalEmployees: totalEmpCount,
        totalDepartments: depts.length,
        averageSalary: avgSalary,
        totalRoles: uniqueRoles
      });

      // Recent 5 employees
      setRecentEmployees(empList.slice(0, 5));
      setDepartmentBreakdown(breakdown);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard metrics. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.07, duration: 0.22, ease: 'easeOut' }
    })
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text-col">
          <div className="welcome-tag">
            <Sparkles size={14} />
            <span>Operational Workforce Insights</span>
          </div>
          <h2 className="welcome-title">Enterprise Workforce Dashboard</h2>
          <p className="welcome-desc">
            Monitor real-time personnel data, departmental allocations, and compensation across the organization.
          </p>
        </div>
        <div className="welcome-actions-col">
          <Link to="/employees/new" className="btn btn-primary">
            <UserPlus size={16} />
            <span>Add New Employee</span>
          </Link>
          <Link to="/employees" className="btn btn-secondary">
            <span>View All Records</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && <ErrorMessage message={error} onRetry={loadDashboardData} />}

      {/* KPI Stat Cards Grid */}
      <div className="kpi-grid">
        {/* Total Employees */}
        <motion.div
          className="kpi-card"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="kpi-header">
            <span className="kpi-label">Total Employees</span>
            <div className="kpi-icon-box blue">
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? <Skeleton width="80px" height="2.2rem" /> : stats.totalEmployees}
          </div>
          <div className="kpi-footer">
            <span className="kpi-trend positive">
              <TrendingUp size={14} /> Active Personnel
            </span>
            <span className="kpi-subtext">in database</span>
          </div>
        </motion.div>

        {/* Total Departments */}
        <motion.div
          className="kpi-card"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="kpi-header">
            <span className="kpi-label">Departments</span>
            <div className="kpi-icon-box purple">
              <Building2 size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? <Skeleton width="60px" height="2.2rem" /> : stats.totalDepartments}
          </div>
          <div className="kpi-footer">
            <Link to="/departments" className="kpi-link">
              <span>View breakdown</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </motion.div>

        {/* Average Salary */}
        <motion.div
          className="kpi-card"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="kpi-header">
            <span className="kpi-label">Average Annual Salary</span>
            <div className="kpi-icon-box green">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? <Skeleton width="110px" height="2.2rem" /> : formatCurrency(stats.averageSalary)}
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Across active directory</span>
          </div>
        </motion.div>

        {/* Unique Job Titles */}
        <motion.div
          className="kpi-card"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="kpi-header">
            <span className="kpi-label">Active Designations</span>
            <div className="kpi-icon-box amber">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? <Skeleton width="50px" height="2.2rem" /> : stats.totalRoles}
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Specialized roles</span>
          </div>
        </motion.div>
      </div>

      {/* Main Dashboard Two-Column Section */}
      <div className="dashboard-columns-grid">
        {/* Left Column: Recent Employees */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Recent Employees</h3>
              <p className="panel-subtitle">Latest additions to the workforce directory</p>
            </div>
            <Link to="/employees" className="panel-link">
              <span>See all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="panel-body">
            {loading ? (
              <div className="recent-list-skeleton">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="recent-item-skeleton">
                    <Skeleton width="40px" height="40px" borderRadius="50%" />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Skeleton width="45%" height="1rem" />
                      <Skeleton width="30%" height="0.85rem" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentEmployees.length === 0 ? (
              <p className="empty-inline-note">No employee records in the system yet.</p>
            ) : (
              <div className="recent-employees-list">
                {recentEmployees.map((emp) => (
                  <Link
                    key={emp.id}
                    to={`/employees/${emp.id}`}
                    className="recent-employee-item"
                  >
                    <Avatar name={emp.name} size="sm" />
                    <div className="recent-employee-info">
                      <span className="recent-emp-name">{emp.name}</span>
                      <span className="recent-emp-role">{emp.designation}</span>
                    </div>
                    <div className="recent-employee-meta">
                      <Badge department={emp.department?.name}>
                        {emp.department?.name || 'General'}
                      </Badge>
                      <span className="recent-emp-date">{formatDate(emp.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Department Workforce Distribution */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Department Distribution</h3>
              <p className="panel-subtitle">Headcount allocation by business unit</p>
            </div>
            <Link to="/departments" className="panel-link">
              <span>View units</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="panel-body">
            {loading ? (
              <div className="dept-bars-skeleton">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="dept-bar-skeleton-item">
                    <Skeleton width="35%" height="1rem" />
                    <Skeleton width="100%" height="10px" borderRadius="999px" />
                  </div>
                ))}
              </div>
            ) : departmentBreakdown.length === 0 ? (
              <p className="empty-inline-note">No department breakdown available.</p>
            ) : (
              <div className="department-distribution-list">
                {departmentBreakdown.map((dept) => (
                  <div key={dept.id} className="distribution-item">
                    <div className="distribution-label-row">
                      <span className="distribution-dept-name">{dept.name}</span>
                      <span className="distribution-dept-count">
                        <strong>{dept.count}</strong> employees ({dept.percentage}%)
                      </span>
                    </div>
                    <div className="distribution-progress-track">
                      <div
                        className="distribution-progress-fill"
                        style={{ width: `${Math.max(5, dept.percentage)}%` }}
                        aria-valuenow={dept.percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
