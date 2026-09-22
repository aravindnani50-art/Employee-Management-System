import React, { useState, useEffect, useCallback } from 'react';
import {
  getEmployees,
  getDepartments,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../services/employeeApi';

import EmployeeList from '../components/EmployeeList';
import EmployeeForm from '../components/EmployeeForm';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

/**
 * EmployeesPage component
 * Primary dashboard page for managing employees.
 * Coordinates all data fetching, filtering, searching, sorting, pagination, and CRUD modal operations.
 */
export default function EmployeesPage() {
  // Employee data & fetching state
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal & CRUD states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formServerError, setFormServerError] = useState(null);

  // Delete modal state
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [notification, setNotification] = useState(null);

  // Helper to show temporary notification banner
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  /**
   * Fetch departments on initial mount to populate filter and form dropdowns
   */
  useEffect(() => {
    async function loadDepartments() {
      try {
        const response = await getDepartments();
        // Support both { data: [...] } and direct array [...]
        const deptList = Array.isArray(response)
          ? response
          : (response && response.data && Array.isArray(response.data))
          ? response.data
          : [];
        setDepartments(deptList);
      } catch (err) {
        console.warn('Could not load departments from API, using defaults:', err.message);
        setDepartments([
          { id: '1', name: 'Engineering' },
          { id: '2', name: 'Human Resources' },
          { id: '3', name: 'Marketing' },
          { id: '4', name: 'Finance' },
          { id: '5', name: 'Product' }
        ]);
      }
    }

    loadDepartments();
  }, []);

  /**
   * Main function to fetch employee records from the backend API.
   * Sends page, limit, search, department, designation, sortBy, sortOrder query params.
   */
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

      // Handle both { success: true, data: [...], pagination: { ... } } and plain array
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

  // Re-fetch whenever filters, pagination, or sorting changes
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /**
   * Search handler
   */
  const handleSearch = (term) => {
    setSearch(term);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /**
   * Filter & Sort change handler
   */
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'department') {
      setSelectedDepartment(value);
    } else if (filterType === 'designation') {
      setSelectedDesignation(value);
    } else if (filterType === 'sortBy') {
      setSortBy(value);
    } else if (filterType === 'sortOrder') {
      setSortOrder(value);
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /**
   * Reset all filters to defaults
   */
  const handleResetFilters = () => {
    setSearch('');
    setSelectedDepartment('');
    setSelectedDesignation('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /**
   * Pagination handlers
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  /**
   * Open Add Employee modal
   */
  const handleOpenAddForm = () => {
    setEditingEmployee(null);
    setFormServerError(null);
    setIsFormOpen(true);
  };

  /**
   * Open Edit Employee modal
   */
  const handleOpenEditForm = (employee) => {
    setEditingEmployee(employee);
    setFormServerError(null);
    setIsFormOpen(true);
  };

  /**
   * Close form modal
   */
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
    setFormServerError(null);
  };

  /**
   * Handle Create / Update Employee form submission
   */
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormServerError(null);

    try {
      if (editingEmployee && editingEmployee.id) {
        // Update existing employee
        await updateEmployee(editingEmployee.id, formData);
        showNotification(`Employee "${formData.name}" updated successfully!`, 'success');
      } else {
        // Create new employee
        await createEmployee(formData);
        showNotification(`Employee "${formData.name}" created successfully!`, 'success');
      }

      handleCloseForm();
      fetchEmployees(); // Refresh list without full page reload
    } catch (err) {
      // Keep modal open and display server error message (e.g. 409 duplicate email, 400 validation error)
      setFormServerError(err.message || 'Failed to save employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Open Delete confirmation dialog
   */
  const handlePromptDelete = (employee) => {
    setDeletingEmployee(employee);
  };

  /**
   * Confirm and execute employee deletion
   */
  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;

    setIsDeleting(true);
    try {
      await deleteEmployee(deletingEmployee.id);
      showNotification(`Employee "${deletingEmployee.name}" deleted successfully!`, 'success');
      setDeletingEmployee(null);

      // If on a page with only 1 item and it's deleted, go back to previous page
      if (employees.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        fetchEmployees();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to delete employee.', 'error');
      setDeletingEmployee(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="employees-page">
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`notification-toast toast-${notification.type}`} role="status">
          <span>{notification.type === 'success' ? '✅' : '❌'}</span>
          <span>{notification.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header with Title & Add Employee Button */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees Directory</h1>
          <p className="page-subtitle">
            Manage your organization's staff, roles, and departmental records.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-add-employee"
          onClick={handleOpenAddForm}
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar-section">
        <SearchBar initialSearch={search} onSearch={handleSearch} />
        <FilterBar
          departments={departments}
          selectedDepartment={selectedDepartment}
          selectedDesignation={selectedDesignation}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Content Area handling Loading, Error, Empty, and Success states */}
      <div className="content-section">
        {loading ? (
          <Loading message="Loading employees..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchEmployees} />
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            message={
              search || selectedDepartment || selectedDesignation
                ? "No employees match your search and filter criteria. Try resetting filters."
                : "No employee records exist in the database yet. Click 'Add Employee' to create one."
            }
            action={
              search || selectedDepartment || selectedDesignation ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenAddForm}
                >
                  ➕ Add First Employee
                </button>
              )
            }
          />
        ) : (
          <>
            <EmployeeList
              employees={employees}
              onEdit={handleOpenEditForm}
              onDelete={handlePromptDelete}
            />

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalRecords={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {isFormOpen && (
        <EmployeeForm
          initialData={editingEmployee}
          departments={departments}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
          serverError={formServerError}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingEmployee)}
        title="Delete Employee"
        message={
          deletingEmployee
            ? `Are you sure you want to delete ${deletingEmployee.name}? This will permanently remove their record from the database.`
            : 'Are you sure you want to delete this employee?'
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingEmployee(null)}
      />
    </div>
  );
}
