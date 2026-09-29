import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import EmployeeAvatar from '../components/common/EmployeeAvatar';
import { CardSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import {
  gsap,
  useGsapContext,
  animateSplitHeading,
  scrambleElementText,
  initCard3DTilt,
  initScrollReveal
} from '../animations/gsapUtils';

function AnimatedCounter({ value }) {
  const countRef = useRef(null);

  useEffect(() => {
    const end = typeof value === 'number' ? value : parseInt(value, 10) || 0;
    if (!countRef.current) return;

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: end,
      duration: 1.1,
      ease: 'power3.out',
      roundProps: 'val',
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.innerText = Math.round(obj.val).toLocaleString();
        }
      }
    });

    return () => tween.kill();
  }, [value]);

  return <span ref={countRef}>0</span>;
}

export default function Departments() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);

  useGsapContext(containerRef, ({ q }) => {
    if (headingRef.current) {
      animateSplitHeading(headingRef.current, { delay: 0.1, duration: 0.7 });
    }
    if (subheadingRef.current) {
      scrambleElementText(
        subheadingRef.current,
        'Overview of company business units and staffing distributions',
        { delay: 0.3, duration: 1.0 }
      );
    }
    const cards = q('.department-card');
    cards.forEach((card) => {
      initCard3DTilt(card, { maxTilt: 7, scale: 1.02 });
    });
    initScrollReveal(cards, { stagger: 0.06, y: 20 });
  }, [departments.length, loading]);

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

      // Calculate count and extract sample members per department
      const counts = {};
      const deptMembers = {};
      empList.forEach((emp) => {
        const dId = emp.departmentId || emp.department?.id;
        if (dId) {
          counts[dId] = (counts[dId] || 0) + 1;
          if (!deptMembers[dId]) deptMembers[dId] = [];
          if (deptMembers[dId].length < 4) {
            deptMembers[dId].push(emp);
          }
        }
      });

      const formatted = depts.map((d) => {
        const count = counts[d.id] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          ...d,
          count,
          percentage,
          members: deptMembers[d.id] || []
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
    <div ref={containerRef} className="departments-page-container">
      {/* Header */}
      <div className="directory-header-row">
        <div>
          <h2 ref={headingRef} className="directory-heading">Organizational Departments</h2>
          <p ref={subheadingRef} className="directory-subheading">
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.22,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/employees?department=${dept.id || dept.name}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="dept-card-header">
                <motion.div
                  className="dept-card-icon-box"
                  whileHover={{ scale: 1.15, rotate: 12 }}
                  transition={{ duration: 0.25 }}
                >
                  <Building2 size={22} className="dept-icon" />
                </motion.div>
                <Badge department={dept.name}>{dept.name}</Badge>
              </div>

              <div className="dept-card-body">
                <h3 className="dept-card-name">{dept.name}</h3>
                <div className="dept-count-badge">
                  <Users size={16} className="text-muted" />
                  <span className="dept-count-num">
                    <AnimatedCounter value={dept.count} />
                  </span>
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
                    <motion.div
                      className="dept-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, dept.percentage)}%` }}
                      transition={{ delay: 0.15 + index * 0.05, duration: 0.45, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Department Member Avatar Stack */}
                {dept.members && dept.members.length > 0 && (
                  <div className="dept-avatar-stack">
                    {dept.members.map((member, mIdx) => (
                      <div key={member.id} className="dept-stack-avatar" style={{ zIndex: 10 - mIdx }}>
                        <EmployeeAvatar employee={member} size="sm" />
                      </div>
                    ))}
                    {dept.count > dept.members.length && (
                      <span className="dept-stack-count">+{dept.count - dept.members.length} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="dept-card-footer" onClick={(e) => e.stopPropagation()}>
                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to={`/employees?department=${dept.id || dept.name}`}
                    className="dept-link-btn"
                  >
                    <span>View Department Employees</span>
                    <ArrowRight size={15} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
