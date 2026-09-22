import React from 'react';

/**
 * Pagination component
 * Handles page navigation and records summary.
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current page (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalRecords - Total count of employee records
 * @param {number} props.limit - Items per page
 * @param {Function} props.onPageChange - Handler to switch pages
 * @param {Function} props.onLimitChange - Handler to change page size limit
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  limit = 10,
  onPageChange,
  onLimitChange
}) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // Calculate range of records currently displayed
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalRecords);

  return (
    <div className="pagination-container" aria-label="Pagination Navigation">
      {/* Records info */}
      <div className="pagination-info">
        <span>
          Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{' '}
          <strong>{totalRecords}</strong> employees
        </span>
      </div>

      {/* Page size selector */}
      <div className="pagination-limit">
        <label htmlFor="limit-select">Per page:</label>
        <select
          id="limit-select"
          className="limit-select"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      {/* Navigation Buttons */}
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-pagination"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Go to previous page"
        >
          &laquo; Previous
        </button>

        <span className="pagination-page-indicator">
          Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
        </span>

        <button
          type="button"
          className="btn btn-pagination"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Go to next page"
        >
          Next &raquo;
        </button>
      </div>
    </div>
  );
}
