import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import EmployeeAvatar from '../components/common/EmployeeAvatar';
import Badge from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import {
  gsap,
  useGsapContext,
  animateSplitHeading,
  scrambleElementText,
  initCard3DTilt,
  initScrollReveal
} from '../animations/gsapUtils';
import SonarRadarWidget from '../components/common/SonarRadarWidget';

/**
 * AnimatedCounter Component
 * Animates a number from 0 to its target value smoothly using GSAP.
 */
function AnimatedCounter({ value, formatter }) {
  const counterRef = useRef(null);

  useEffect(() => {
    const end = typeof value === 'number' ? value : parseInt(value, 10) || 0;
    if (!counterRef.current) return;

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: end,
      duration: 1.2,
      ease: 'power3.out',
      roundProps: 'val',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.innerText = formatter
            ? formatter(Math.round(obj.val))
            : Math.round(obj.val).toLocaleString();
        }
      }
    });

    return () => tween.kill();
  }, [value, formatter]);

  return <span ref={counterRef}>0</span>;
}

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

  const dashboardRef = useRef(null);
  const titleRef = useRef(null);
  const tagRef = useRef(null);

  useGsapContext(dashboardRef, ({ q }) => {
    // 1. SplitText reveal on title
    if (titleRef.current) {
      animateSplitHeading(titleRef.current, { delay: 0.1, duration: 0.75 });
    }

    // 2. ScrambleText on tag
    if (tagRef.current) {
      scrambleElementText(tagRef.current, 'OPERATIONAL WORKFORCE TELEMETRY', { delay: 0.35, duration: 1.2 });
    }

    // 3. 3D tilt on all KPI cards
    const cards = q('.kpi-card');
    cards.forEach((card) => {
      initCard3DTilt(card, { maxTilt: 7, scale: 1.015 });
    });

    // 4. ScrollTrigger batch reveal for panels
    initScrollReveal(q('.dashboard-panel'), { y: 25, duration: 0.6, stagger: 0.12 });
  }, [loading]);

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.06 + i * 0.06, duration: 0.22, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <div ref={dashboardRef} className="dashboard-container">
      {/* Welcome Banner */}
      <motion.div
        className="dashboard-welcome-banner"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="welcome-text-col">
          <div className="welcome-tag">
            <Sparkles size={14} />
            <span ref={tagRef}>Operational Workforce Insights</span>
          </div>
          <h2 ref={titleRef} className="welcome-title">Enterprise Workforce Dashboard</h2>
          <p className="welcome-desc">
            Monitor real-time personnel data, departmental allocations, and compensation across the organization.
          </p>
        </div>
        <div className="welcome-actions-col">
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/employees/new" className="btn btn-primary">
              <UserPlus size={16} />
              <span>Add New Employee</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/employees" className="btn btn-secondary">
              <span>View All Records</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </motion.div>

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
            {loading ? <Skeleton width="80px" height="2.2rem" /> : <AnimatedCounter value={stats.totalEmployees} />}
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
            {loading ? <Skeleton width="60px" height="2.2rem" /> : <AnimatedCounter value={stats.totalDepartments} />}
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
            {loading ? (
              <Skeleton width="110px" height="2.2rem" />
            ) : (
              <AnimatedCounter
                value={stats.averageSalary}
                formatter={(val) => formatCurrency(val)}
              />
            )}
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
            {loading ? <Skeleton width="50px" height="2.2rem" /> : <AnimatedCounter value={stats.totalRoles} />}
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Specialized roles</span>
          </div>
        </motion.div>
      </div>

      {/* Main Dashboard Two-Column Section */}
      <motion.div
        className="dashboard-columns-grid"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
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
                {recentEmployees.map((emp, idx) => (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.32 + idx * 0.04, duration: 0.2 }}
                    whileHover={{ x: 6 }}
                  >
                    <Link
                      to={`/employees/${emp.id}`}
                      className="recent-employee-item"
                    >
                      <motion.div
                        className="recent-avatar-wrap"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.12 }}
                        transition={{ delay: 0.35 + idx * 0.04, duration: 0.2 }}
                      >
                        <EmployeeAvatar employee={emp} size="sm" />
                      </motion.div>
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
                  </motion.div>
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
                {departmentBreakdown.map((dept, idx) => (
                  <motion.div
                    key={dept.id}
                    className="distribution-item"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 + idx * 0.04, duration: 0.2 }}
                  >
                    <div className="distribution-label-row">
                      <span className="distribution-dept-name">{dept.name}</span>
                      <span className="distribution-dept-count">
                        <strong>{dept.count}</strong> employees ({dept.percentage}%)
                      </span>
                    </div>
                    <div className="distribution-progress-track">
                      <motion.div
                        className="distribution-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, dept.percentage)}%` }}
                        transition={{ delay: 0.38 + idx * 0.05, duration: 0.45, ease: 'easeOut' }}
                        aria-valuenow={dept.percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Embedded Sonar Visual Identity Radar (MotionPath, Sweep & Telemetry) */}
            <div className="dept-panel-telemetry-embed" style={{ marginTop: '1.25rem' }}>
              <SonarRadarWidget isFloating={false} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
