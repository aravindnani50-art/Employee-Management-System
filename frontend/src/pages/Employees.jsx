import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Trash2,
  Building,
  Mail,
  Phone,
  DollarSign
} from 'lucide-react';
import { getEmployees, deleteEmployee } from '../services/employeeApi';
import { getDepartments } from '../services/departmentApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import EmployeeAvatar from '../components/common/EmployeeAvatar';
import Badge from '../components/common/Badge';
import { TableSkeleton, CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useToast } from '../context/ToastContext';
import {
  gsap,
  Flip,
  useGsapContext,
  animateSplitHeading,
  scrambleElementText,
  initCard3DTilt,
  initScrollReveal
} from '../animations/gsapUtils';

// Display ordering helper: ensures Aravind Kumar appears first, followed by Bhuvana Thummalapalli if present
const prioritizeEmployees = (list) => {
  if (!Array.isArray(list) || list.length === 0) return list;
  const isAravind = (emp) => {
    const name = (emp?.name || '').trim().toLowerCase();
    return (name.includes('aravind') && name.includes('kumar')) || emp?.id === 15;
  };
  const isBhuvana = (emp) => {
    const name = (emp?.name || '').trim().toLowerCase();
    return (name.includes('bhuvana') && name.includes('thummalapalli')) || emp?.id === 21;
  };

  const aravind = list.find(isAravind);
  const bhuvana = list.find(isBhuvana);
  if (!aravind && !bhuvana) return list;

  const others = list.filter((emp) => !isAravind(emp) && !isBhuvana(emp));
  return [
    ...(aravind ? [aravind] : []),
    ...(bhuvana ? [bhuvana] : []),
    ...others
  ];
};

export default function Employees() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);

  // URL state sync for initial filters and pagination
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const initialLimit = parseInt(searchParams.get('limit') || '10', 10) || 10;
  const initialSearch = searchParams.get('search') || '';
  const initialDept = searchParams.get('department') || '';
  const initialDesig = searchParams.get('designation') || '';
  const initialSortBy = searchParams.get('sortBy') || 'name';
  const initialSortOrder = searchParams.get('sortOrder') || 'asc';

  // Data states
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState(initialSearch);
  const [selectedDepartment, setSelectedDepartment] = useState(initialDept);
  const [selectedDesignation, setSelectedDesignation] = useState(initialDesig);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  // Presentation mode
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination state
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 1
  });

  // Delete modal state
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load departments dropdown
  useEffect(() => {
    async function loadDepts() {
      try {
        const data = await getDepartments();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Could not load departments:', err.message);
      }
    }
    loadDepts();
  }, []);

  // Synchronize state when URL searchParams change (e.g. browser Back / Forward buttons)
  useEffect(() => {
    const p = parseInt(searchParams.get('page') || '1', 10) || 1;
    const l = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const s = searchParams.get('search') || '';
    const d = searchParams.get('department') || '';
    const desig = searchParams.get('designation') || '';
    const sb = searchParams.get('sortBy') || 'name';
    const so = searchParams.get('sortOrder') || 'asc';

    setPagination((prev) => {
      if (prev.page !== p || prev.limit !== l) {
        return { ...prev, page: p, limit: l };
      }
      return prev;
    });

    if (s !== search) setSearch(s);
    if (d !== selectedDepartment) setSelectedDepartment(d);
    if (desig !== selectedDesignation) setSelectedDesignation(desig);
    if (sb !== sortBy) setSortBy(sb);
    if (so !== sortOrder) setSortOrder(so);
  }, [searchParams]);

  // Fetch employees from API
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getEmployees({
        page: pagination.page,
        limit: pagination.limit,
        search,
        department: selectedDepartment,
        designation: selectedDesignation,
        sortBy,
        sortOrder
      });

      if (!response) {
        setEmployees([]);
        return;
      }

      if (Array.isArray(response)) {
        setEmployees(prioritizeEmployees(response));
        setPagination((prev) => ({
          ...prev,
          total: response.length,
          totalPages: Math.max(1, Math.ceil(response.length / prev.limit))
        }));
      } else if (response.data && Array.isArray(response.data)) {
        setEmployees(prioritizeEmployees(response.data));
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || pagination.page,
            limit: response.pagination.limit || pagination.limit,
            total: response.pagination.total !== undefined ? response.pagination.total : response.data.length,
            totalPages: response.pagination.totalPages || 1
          });
        } else {
          setPagination((prev) => ({
            ...prev,
            total: response.data.length,
            totalPages: Math.max(1, Math.ceil(response.data.length / prev.limit))
          }));
        }
      } else {
        setEmployees([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load employees. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    selectedDepartment,
    selectedDesignation,
    sortBy,
    sortOrder
  ]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handlers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (search && search.trim()) {
        next.set('search', search.trim());
      } else {
        next.delete('search');
      }
      next.set('page', '1');
      return next;
    }, { replace: false });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedDepartment('');
    setSelectedDesignation('');
    setSortBy('name');
    setSortOrder('asc');
    setSearchParams({}, { replace: false });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePromptDelete = (e, emp) => {
    e.stopPropagation();
    setDeletingEmployee(emp);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);

    try {
      await deleteEmployee(deletingEmployee.id);
      showSuccess(`Employee "${deletingEmployee.name}" deleted successfully.`);
      setDeletingEmployee(null);

      // Handle page decrement if last item on current page was deleted
      if (employees.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        fetchEmployees();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete employee.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(newPage));
        return next;
      }, { replace: false });
    }
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('limit', String(newLimit));
      next.set('page', '1');
      return next;
    }, { replace: false });
  };

  useGsapContext(pageRef, ({ q }) => {
    if (headingRef.current) {
      animateSplitHeading(headingRef.current, { delay: 0.1, duration: 0.7 });
    }
    if (subheadingRef.current && pagination.total > 0) {
      scrambleElementText(
        subheadingRef.current,
        `Showing ${pagination.total} employee records in organizational database`,
        { delay: 0.3, duration: 0.9 }
      );
    }
    // 3D Tilt on grid cards
    const cards = q('.employee-grid-card');
    cards.forEach((card) => {
      initCard3DTilt(card, { maxTilt: 6, scale: 1.015 });
    });
  }, [viewMode, pagination.total, employees.length]);

  const handleToggleView = (mode) => {
    if (mode === viewMode) return;
    const state = Flip.getState('.table-card-wrapper, .cards-section, .table-clickable-row, .employee-grid-card');
    setViewMode(mode);
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.45,
        ease: 'power3.inOut',
        stagger: 0.02,
        absolute: true
      });
    });
  };

  return (
    <div ref={pageRef} className="employees-page-container">
      {/* Top Action Bar */}
      <div className="directory-header-row">
        <div>
          <h2 ref={headingRef} className="directory-heading">Personnel Directory</h2>
          <p ref={subheadingRef} className="directory-subheading">
            Showing {pagination.total} employee records in organizational database
          </p>
        </div>
        <div className="directory-actions-row">
          {/* View Toggle */}
          <div className="view-mode-toggle" role="group" aria-label="View layout switcher">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => handleToggleView('table')}
              title="Table View"
              aria-label="Table View"
            >
              <List size={18} />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              className={`btn-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleToggleView('grid')}
              title="Grid Card View"
              aria-label="Grid Card View"
            >
              <LayoutGrid size={18} />
            </motion.button>
          </div>

          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/employees/new" className="btn btn-primary">
              <UserPlus size={16} />
              <span>Add Employee</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="toolbar-card">
        <form onSubmit={handleSearchSubmit} className="search-form-col">
          <div className="search-input-box">
            <Search size={18} className="search-box-icon" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search by employee name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
        </form>

        <div className="filters-group-col">
          {/* Department Filter */}
          <div className="filter-select-wrapper">
            <select
              className="filter-select"
              value={selectedDepartment}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDepartment(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (val) next.set('department', val);
                  else next.delete('department');
                  next.set('page', '1');
                  return next;
                }, { replace: false });
              }}
              aria-label="Filter by department"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Field */}
          <div className="filter-select-wrapper">
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => {
                const val = e.target.value;
                setSortBy(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (val && val !== 'name') next.set('sortBy', val);
                  else next.delete('sortBy');
                  next.set('page', '1');
                  return next;
                }, { replace: false });
              }}
              aria-label="Sort by attribute"
            >
              <option value="name">Employee Name</option>
              <option value="createdAt">Date Created</option>
              <option value="salary">Annual Salary</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="filter-select-wrapper">
            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => {
                const val = e.target.value;
                setSortOrder(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (val && val !== 'asc') next.set('sortOrder', val);
                  else next.delete('sortOrder');
                  next.set('page', '1');
                  return next;
                }, { replace: false });
              }}
              aria-label="Sort direction"
            >
              <option value="asc">Ascending ↑</option>
              <option value="desc">Descending ↓</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(search || selectedDepartment || selectedDesignation || sortBy !== 'name' || sortOrder !== 'asc') && (
            <button
              type="button"
              className="btn btn-outline btn-reset-filters"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <ErrorMessage message={error} onRetry={fetchEmployees} />
      ) : loading ? (
        viewMode === 'table' ? (
          <div className="table-responsive-box">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : (
          <CardSkeleton count={8} />
        )
      ) : employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          message="No employee records matched your current query or department selection."
          action={
            <div className="empty-state-btn-group">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleResetFilters}
              >
                Clear Filters
              </button>
              <Link to="/employees/new" className="btn btn-primary">
                Add New Employee
              </Link>
            </div>
          }
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="table-card-wrapper">
          <div className="table-responsive-box">
            <table className="enterprise-table" aria-label="Employees Table">
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Department</th>
                  <th scope="col">Designation</th>
                  <th scope="col">Salary</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody
                key={`tbody-${pagination.page}-${selectedDepartment}-${selectedDesignation}-${search}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                {employees.map((emp, index) => (
                  <motion.tr
                    key={emp.id}
                    className="table-clickable-row"
                    onClick={() => navigate(`/employees/${emp.id}`, { state: { from: location.pathname + location.search } })}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.025, 0.25),
                      duration: 0.18,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    <td>
                      <div className="emp-table-cell">
                        <motion.div
                          className="emp-avatar-anim-wrap"
                          initial={{ scale: 0.88, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            delay: Math.min(index * 0.025 + 0.03, 0.28),
                            duration: 0.18
                          }}
                        >
                          <EmployeeAvatar employee={emp} size="md" />
                        </motion.div>
                        <div className="emp-cell-meta">
                          <span className="emp-cell-name">{emp.name}</span>
                          <span className="emp-cell-email">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: Math.min(index * 0.025 + 0.05, 0.3),
                          duration: 0.18
                        }}
                      >
                        <Badge department={emp.department?.name}>
                          {emp.department?.name || 'General'}
                        </Badge>
                      </motion.div>
                    </td>
                    <td>
                      <span className="emp-cell-role">{emp.designation}</span>
                    </td>
                    <td>
                      <span className="emp-cell-salary">{formatCurrency(emp.salary)}</span>
                    </td>
                    <td>
                      <span className="badge badge-active">Active</span>
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions-inline">
                        <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                          <Link
                            to={`/employees/${emp.id}`}
                            state={{ from: location.pathname + location.search }}
                            className="btn-action-icon"
                            title="View Profile"
                            aria-label={`View ${emp.name}'s profile`}
                          >
                            <Eye size={16} />
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                          <Link
                            to={`/employees/${emp.id}/edit`}
                            state={{ from: location.pathname + location.search }}
                            className="btn-action-icon edit"
                            title="Edit Details"
                            aria-label={`Edit ${emp.name}`}
                          >
                            <Edit2 size={16} />
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                          <button
                            type="button"
                            className="btn-action-icon delete"
                            onClick={(e) => handlePromptDelete(e, emp)}
                            title="Delete Employee"
                            aria-label={`Delete ${emp.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-pagination-footer">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalRecords={pagination.total}
              totalItems={pagination.total}
              currentCount={employees.length}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="cards-section">
          <motion.div
            key={`grid-${pagination.page}-${selectedDepartment}-${selectedDesignation}-${search}`}
            className="employee-cards-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
          >
            {employees.map((emp, index) => (
              <motion.div
                key={emp.id}
                className="employee-grid-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(index * 0.035, 0.3),
                  duration: 0.22,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/employees/${emp.id}`, { state: { from: location.pathname + location.search } })}
              >
                <div className="card-top-row">
                  <motion.div
                    className="grid-card-avatar-wrap"
                    initial={{ scale: 0.88, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: Math.min(index * 0.035 + 0.04, 0.34),
                      duration: 0.2
                    }}
                  >
                    <EmployeeAvatar employee={emp} size="lg" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: Math.min(index * 0.035 + 0.07, 0.38),
                      duration: 0.2
                    }}
                    className="card-header-badge"
                  >
                    <Badge department={emp.department?.name}>
                      {emp.department?.name || 'General'}
                    </Badge>
                  </motion.div>
                </div>

                <div className="card-person-info">
                  <h4 className="card-emp-name">{emp.name}</h4>
                  <span className="card-emp-role">{emp.designation}</span>
                </div>

                <div className="card-details-list">
                  <div className="card-detail-item" title={emp.email}>
                    <Mail size={14} className="card-detail-icon" />
                    <span className="card-detail-text">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="card-detail-item">
                      <Phone size={14} className="card-detail-icon" />
                      <span className="card-detail-text">{emp.phone}</span>
                    </div>
                  )}
                  <div className="card-detail-item">
                    <DollarSign size={14} className="card-detail-icon" />
                    <span className="card-detail-text salary">{formatCurrency(emp.salary)} / yr</span>
                  </div>
                </div>

                <div className="card-actions-footer" onClick={(e) => e.stopPropagation()}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={`/employees/${emp.id}`}
                      state={{ from: location.pathname + location.search }}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={`/employees/${emp.id}/edit`}
                      state={{ from: location.pathname + location.search }}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm"
                      onClick={(e) => handlePromptDelete(e, emp)}
                      aria-label={`Delete ${emp.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="cards-pagination-footer">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalRecords={pagination.total}
              totalItems={pagination.total}
              currentCount={employees.length}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingEmployee)}
        title="Delete Employee Record"
        message={
          deletingEmployee
            ? `Are you sure you want to permanently remove "${deletingEmployee.name}" (${deletingEmployee.designation}) from the employee directory?`
            : ''
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingEmployee(null)}
      />
    </div>
  );
}
