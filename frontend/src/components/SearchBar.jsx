import React, { useState } from 'react';

/**
 * SearchBar component
 * Allows users to search employees by name or email.
 * Triggers server-side search via query parameters.
 * 
 * @param {Object} props
 * @param {string} props.initialSearch - Current search query value
 * @param {Function} props.onSearch - Callback triggered when search is submitted or cleared
 */
export default function SearchBar({ initialSearch = '', onSearch }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search employees by name or email"
        />
        {searchTerm && (
          <button
            type="button"
            className="btn-clear"
            onClick={handleClear}
            title="Clear search"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-secondary">
        Search
      </button>
    </form>
  );
}
