import React from 'react';

/**
 * FilterBar component
 * Controls filtering by Department and Designation, as well as Sorting by Name, Salary, or Date.
 * 
 * @param {Object} props
 * @param {Array} props.departments - List of departments fetched from the backend API
 * @param {string|number} props.selectedDepartment - Currently selected department ID/value
 * @param {string} props.selectedDesignation - Currently selected designation filter
 * @param {string} props.sortBy - Current sort field ('name', 'salary', 'createdAt')
 * @param {string} props.sortOrder - Current sort order ('asc', 'desc')
 * @param {Function} props.onFilterChange - Callback when any filter or sort option changes
 * @param {Function} props.onReset - Callback to reset all filters
 */
export default function FilterBar({
  departments = [],
  selectedDepartment = '',
  selectedDesignation = '',
  sortBy = 'name',
  sortOrder = 'asc',
  onFilterChange,
  onReset
}) {
  const commonDesignations = [
    'Software Engineer',
    'Senior Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'UI/UX Designer',
    'Product Manager',
    'QA Engineer',
    'HR Specialist',
    'Accountant'
  ];

  const hasActiveFilters = selectedDepartment || selectedDesignation || sortBy !== 'name' || sortOrder !== 'asc';

  return (
    <div className="filter-bar">
      {/* Department Filter */}
      <div className="filter-group">
        <label htmlFor="filter-department" className="filter-label">Department</label>
        <select
          id="filter-department"
          className="filter-select"
          value={selectedDepartment}
          onChange={(e) => onFilterChange('department', e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => {
            // Accommodate department as object ({ id, name }) or plain string
            const deptId = dept.id !== undefined ? dept.id : dept;
            const deptName = dept.name || dept;
            return (
              <option key={deptId} value={deptId}>
                {deptName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Designation Filter */}
      <div className="filter-group">
        <label htmlFor="filter-designation" className="filter-label">Designation</label>
        <select
          id="filter-designation"
          className="filter-select"
          value={selectedDesignation}
          onChange={(e) => onFilterChange('designation', e.target.value)}
        >
          <option value="">All Designations</option>
          {commonDesignations.map((desig) => (
            <option key={desig} value={desig}>
              {desig}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By Field */}
      <div className="filter-group">
        <label htmlFor="sort-by" className="filter-label">Sort By</label>
        <select
          id="sort-by"
          className="filter-select"
          value={sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
        >
          <option value="name">Name</option>
          <option value="salary">Salary</option>
          <option value="createdAt">Date Created</option>
        </select>
      </div>

      {/* Sort Order */}
      <div className="filter-group">
        <label htmlFor="sort-order" className="filter-label">Order</label>
        <select
          id="sort-order"
          className="filter-select"
          value={sortOrder}
          onChange={(e) => onFilterChange('sortOrder', e.target.value)}
        >
          <option value="asc">Ascending (A-Z, Low-High)</option>
          <option value="desc">Descending (Z-A, High-Low)</option>
        </select>
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <div className="filter-group filter-reset-wrapper">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onReset}
            title="Reset all filters and sorting"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
