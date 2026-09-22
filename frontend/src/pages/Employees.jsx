import React, { useState, useEffect, useCallback } from 'react';
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
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { TableSkeleton, CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useToast } from '../context/ToastContext';

export default function Employees() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  // URL state sync for initial filters
  const initialDept = searchParams.get('department') || '';

  // Data states
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(initialDept);
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Presentation mode
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
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

  // Update selectedDepartment if query param changes
  useEffect(() => {
    const deptParam = searchParams.get('department');
    if (deptParam !== null && deptParam !== selectedDepartment) {
      setSelectedDepartment(deptParam);
    }
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
        setEmployees(response);
        setPagination((prev) => ({
          ...prev,
          total: response.length,
          totalPages: Math.max(1, Math.ceil(response.length / prev.limit))
        }));
      } else if (response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
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
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedDepartment('');
    setSelectedDesignation('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setSearchParams({});
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
    }
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  return (
    <div className="employees-page-container">
      {/* Top Action Bar */}
      <div className="directory-header-row">
        <div>
          <h2 className="directory-heading">Personnel Directory</h2>
          <p className="directory-subheading">
            Showing {pagination.total} employee records in organizational database
          </p>
        </div>
        <div className="directory-actions-row">
          {/* View Toggle */}
          <div className="view-mode-toggle" role="group" aria-label="View layout switcher">
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
              aria-label="Table View"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid Card View"
              aria-label="Grid Card View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <Link to="/employees/new" className="btn btn-primary">
            <UserPlus size={16} />
            <span>Add Employee</span>
          </Link>
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
                if (val) {
                  setSearchParams({ department: val });
                } else {
                  setSearchParams({});
                }
                setPagination((prev) => ({ ...prev, page: 1 }));
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
                setSortBy(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              aria-label="Sort by attribute"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Employee Name</option>
              <option value="salary">Annual Salary</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="filter-select-wrapper">
            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              aria-label="Sort direction"
            >
              <option value="desc">Descending ↓</option>
              <option value="asc">Ascending ↑</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(search || selectedDepartment || selectedDesignation || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
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
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="table-clickable-row"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <td>
                      <div className="emp-table-cell">
                        <Avatar name={emp.name} size="md" />
                        <div className="emp-cell-meta">
                          <span className="emp-cell-name">{emp.name}</span>
                          <span className="emp-cell-email">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge department={emp.department?.name}>
                        {emp.department?.name || 'General'}
                      </Badge>
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
                        <Link
                          to={`/employees/${emp.id}`}
                          className="btn-action-icon"
                          title="View Profile"
                          aria-label={`View ${emp.name}'s profile`}
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/employees/${emp.id}/edit`}
                          className="btn-action-icon edit"
                          title="Edit Details"
                          aria-label={`Edit ${emp.name}`}
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          type="button"
                          className="btn-action-icon delete"
                          onClick={(e) => handlePromptDelete(e, emp)}
                          title="Delete Employee"
                          aria-label={`Delete ${emp.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-pagination-footer">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="cards-section">
          <div className="employee-cards-grid">
            {employees.map((emp) => (
              <motion.div
                key={emp.id}
                className="employee-grid-card"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                onClick={() => navigate(`/employees/${emp.id}`)}
              >
                <div className="card-top-row">
                  <Avatar name={emp.name} size="lg" />
                  <div className="card-header-badge">
                    <Badge department={emp.department?.name}>
                      {emp.department?.name || 'General'}
                    </Badge>
                  </div>
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
                  <Link
                    to={`/employees/${emp.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </Link>
                  <Link
                    to={`/employees/${emp.id}/edit`}
                    className="btn btn-outline btn-sm"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-sm"
                    onClick={(e) => handlePromptDelete(e, emp)}
                    aria-label={`Delete ${emp.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="cards-pagination-footer">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
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
